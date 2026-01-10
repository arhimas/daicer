// Mock Strapi Factories to capture the service definition callback
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, factoryCallback: (opts: unknown) => unknown) => {
      // Return a function that executes the factory callback when called
      // This mimics the behavior where the service is instantiated
      return (opts: unknown) => factoryCallback(opts);
    },
  },
}));

import gameEventFactory from '../game-event';
import { StrapiInterface } from '../../../../ai/tools/tool-factory';
import { WorldGenerator } from '../../../voxel-engine/services/world-generator-logic';

// Mock External Dependencies
// Note: Vitest mocks are relative to the test file, but must match the module imported by the source code.
// Since game-event.ts imports '../../voxel-engine...', and we are deep in services/__tests__,
// we should map the path to where the SOURCE file expects it, OR verify path resolution.
// Actually, vitest matches by Resolved Path.

// Mock External Dependencies
vi.mock('../../../voxel-engine/services/world-generator-logic', () => ({
  WorldGenerator: vi.fn().mockImplementation(function () {
    return { getChunk: vi.fn() };
  }),
}));

const mockIsWalkable = vi.fn();
// Use resolved path matching
vi.mock('../../../voxel-engine/services/utils/physics', () => ({
  PhysicsEngine: vi.fn().mockImplementation(function () {
    return { isWalkable: mockIsWalkable };
  }),
}));

// Mock dynamic import for stream-manager
vi.mock('../../../../utils/llm/stream-manager', () => ({
  streamManager: {
    broadcast: vi.fn(),
  },
}));

import { streamManager } from '../../../../utils/llm/stream-manager';

const mockStrapi = {
  documents: vi.fn(() => ({
    findOne: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  })),
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Game Event Service - State & Validation', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = gameEventFactory({ strapi: mockStrapi as unknown as StrapiInterface });
  });

  describe('getGameState (Replay Logic)', () => {
    it('should reconstruct initial state from room sheets if no events exist', async () => {
      const mockRoom = {
        documentId: 'room-1',
        entity_sheets: [{ documentId: 'hero-1', position: { x: 0, y: 0, z: 0 } }],
      };

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findMany: vi.fn().mockResolvedValue([]), // No events
        findOne: vi.fn().mockResolvedValue(mockRoom),
      });

      const state = await service.getGameState('room-1');

      expect(state.entities['hero-1']).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should update positions based on MOVE events', async () => {
      const mockRoom = {
        documentId: 'room-1',
        entity_sheets: [{ documentId: 'hero-1', position: { x: 0, y: 0, z: 0 } }],
      };

      const events = [
        { type: 'MOVE', payload: { entityId: 'hero-1', from: { x: 0, y: 0, z: 0 }, to: { x: 5, y: 5, z: 0 } } },
        { type: 'MOVE', payload: { entityId: 'hero-1', from: { x: 5, y: 5, z: 0 }, to: { x: 10, y: 10, z: 0 } } },
      ];

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findMany: vi.fn().mockResolvedValue(events),
        findOne: vi.fn().mockResolvedValue(mockRoom),
      });

      const state = await service.getGameState('room-1');

      expect(state.entities['hero-1']).toEqual({ x: 10, y: 10, z: 0 });
    });

    it('should handle SPAWN_ENTITY events', async () => {
      const mockRoom = { documentId: 'room-1', entity_sheets: [] };
      const events = [{ type: 'SPAWN_ENTITY', payload: { entityId: 'goblin-1', position: { x: 3, y: 3, z: 0 } } }];

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findMany: vi.fn().mockResolvedValue(events),
        findOne: vi.fn().mockResolvedValue(mockRoom),
      });

      const state = await service.getGameState('room-1');
      expect(state.entities['goblin-1']).toEqual({ x: 3, y: 3, z: 0 });
    });
  });

  describe('validateMove', () => {
    it('should return valid if physics allows and no collision', async () => {
      mockIsWalkable.mockResolvedValue(true);
      // Mock getGameState to return empty
      service.getGameState = vi.fn().mockResolvedValue({ entities: {} });

      // Room mock for World Generator init
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ world: {}, code: 'seed' }),
      });

      const result = await service.validateMove('room-1', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });

      expect(result.valid).toBe(true);
      expect(mockIsWalkable).toHaveBeenCalled();
    });

    it('should return invalid if blocked by terrain (physics)', async () => {
      mockIsWalkable.mockResolvedValue(false);
      service.getGameState = vi.fn().mockResolvedValue({ entities: {} });
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ world: {}, code: 'seed' }),
      });

      const result = await service.validateMove('room-1', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Blocked by terrain');
    });

    it('should return invalid if blocked by entity collision', async () => {
      mockIsWalkable.mockResolvedValue(true);
      // State has entity at 1,1
      service.getGameState = vi.fn().mockResolvedValue({
        entities: { 'nop-1': { x: 1, y: 1, z: 0 } },
      });
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ world: {}, code: 'seed' }),
      });

      const result = await service.validateMove('room-1', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Destination occupied');
    });
  });

  describe('logEvent', () => {
    it('should create event and broadcast it', async () => {
      const createMock = vi.fn().mockResolvedValue({ id: 1 });
      (mockStrapi.documents as unknown as vi.Mock).mockImplementation((uid) => {
        if (uid === 'api::room.room') {
          return { findMany: vi.fn().mockResolvedValue([{ documentId: 'room-1' }]) };
        }
        if (uid === 'api::game-event.game-event') {
          return {
            findMany: vi.fn().mockResolvedValue([{ turn_number: 10 }]),
            create: createMock,
          };
        }
        return {};
      });

      await service.logEvent('room-1', 'TEST', { foo: 'bar' }, 'actor-1');

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            turn_number: 11, // Incremented
            type: 'TEST',
            actorId: 'actor-1',
          }),
        })
      );

      // Broadcast check
      // Broadcast check
      expect(streamManager.broadcast).toHaveBeenCalledWith('room-1', 'game:events', expect.any(Object));
    });
  });

  describe('inspectTerrain', () => {
    it('should return terrain info for valid coordinates', async () => {
      const mockGetChunk = vi.fn().mockReturnValue({
        tiles: {
          0: {
            10: {
              10: { biome: 'Plains', block: 'Grass' },
            },
          },
        },
      });

      // Mock WorldGenerator
      (WorldGenerator as unknown as vi.Mock).mockImplementation(function () {
        return { getChunk: mockGetChunk };
      });

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ world: { seed: 'test' } }),
      });

      const result = await service.inspectTerrain('room-1', 10, 10, 1);
      expect(result).toBe('Terrain: Plains (Grass)');
    });

    it('should return Void for empty chunks', async () => {
      // Mock WorldGenerator returning undefined chunk or tiles
      (WorldGenerator as unknown as vi.Mock).mockImplementation(function () {
        return { getChunk: vi.fn().mockResolvedValue({}) };
      });

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue({ world: { seed: 'test' } }),
      });

      const result = await service.inspectTerrain('room-1', 99, 99, 1);
      expect(result).toBe('Void at 99,99');
    });
  });

  describe('getGameState (Replay Logic) - Invalid Payloads', () => {
    it('should skip invalid MOVE events without crashing', async () => {
      const events = [
        { type: 'MOVE', payload: { entityId: 'hero-1', from: { x: 0 }, to: 'nowhere' } }, // Invalid
      ];
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findMany: vi.fn().mockResolvedValue(events),
        findOne: vi.fn().mockResolvedValue({ entity_sheets: [] }),
      });

      const state = await service.getGameState('room-1');
      expect(Object.keys(state.entities).length).toBe(0);
      expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid MOVE payload'));
    });

    it('should skip invalid SPAWN_ENTITY events', async () => {
      const events = [
        { type: 'SPAWN_ENTITY', payload: { entityId: 'goblin-1' } }, // Missing position
      ];
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findMany: vi.fn().mockResolvedValue(events),
        findOne: vi.fn().mockResolvedValue({ entity_sheets: [] }),
      });

      const state = await service.getGameState('room-1');
      expect(state.entities['goblin-1']).toBeUndefined();
      expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid SPAWN_ENTITY payload'));
    });
  });
});
