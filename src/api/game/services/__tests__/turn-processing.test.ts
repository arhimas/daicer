import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import turnProcessingFactory from '../turn-processing';

// 1. Mocks for Dynamic Imports
const { mockEntropySystem, mockEntropyConstructor } = vi.hoisted(() => {
  const mockSystem = {
    advanceTurn: vi.fn(),
    state: { conditions: [] },
  };
  
  const MockEntropy = class {
    constructor() {
      return mockSystem;
    }
  };

  return {
    mockEntropySystem: mockSystem,
    mockEntropyConstructor: MockEntropy,
  };
});

const mockGenerateMapImage = vi.fn();

vi.mock('../../src/engine/entropy', () => ({
  EntropySystem: mockEntropyConstructor,
}));

vi.mock('../map-visualization', () => ({
  generateMapImage: (...args: any[]) => mockGenerateMapImage(...args),
}));

// 2. Mocks for Strapi Services
const mockNarrativeEngine = {
  generateNarrativeResponse: vi.fn(),
};
const mockTurnPersistence = {
  persistTurn: vi.fn(),
  clearPlayerActions: vi.fn(),
  updateCharacterPosition: vi.fn(),
};
const mockActionEngine = {
  dispatch: vi.fn(),
};
const mockGameLedger = {
  logEvent: vi.fn(),
};
const mockSpawnService = {
  spawnMonster: vi.fn(),
  spawnCharacter: vi.fn(),
};
const mockBiomeSpawnService = {
  populateChunk: vi.fn(),
};
const mockVoxelEngine = {
  getChunk: vi.fn(),
};
const mockUploadService = {
  upload: vi.fn(),
};
const mockNarratorService = {
  processAction: vi.fn(),
};
const mockTurnProcessingService = {
  executeDeterministicTurn: vi.fn(),
  submitAction: vi.fn(),
  processTurn: vi.fn(),
};

// 3. Mocks for Documents
const mockDocuments = {
  findOne: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
};

const mockStrapi = {
  service: vi.fn((uid) => {
    switch (uid) {
      case 'api::game.narrative-engine': return mockNarrativeEngine;
      case 'api::game.turn-persistence': return mockTurnPersistence;
      case 'api::game.action-engine': return mockActionEngine;
      case 'api::game.game-ledger': return mockGameLedger;
      case 'api::game.spawn-service': return mockSpawnService;
      case 'api::game.biome-spawn-service': return mockBiomeSpawnService;
      case 'api::voxel-engine.voxel-engine': return mockVoxelEngine;
      case 'api::narrator.narrator': return mockNarratorService;
      case 'api::game.turn-processing': return mockTurnProcessingService;
      default: return {};
    }
  }),
  documents: vi.fn(() => mockDocuments),
  plugin: vi.fn((uid) => {
    if (uid === 'upload') return { service: () => mockUploadService };
    return {};
  }),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
} as any;

describe('Turn Processing Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = turnProcessingFactory({ strapi: mockStrapi });
  });

  describe('submitAction', () => {
    it('should submit action for player', async () => {
      mockDocuments.findMany.mockResolvedValue([{
        documentId: 'room-1',
        roomId: 'room-code',
        players: [{ user: { id: 'u1' }, action: null }],
      }]);
      mockDocuments.update.mockResolvedValue({});

      await service.submitAction('room-code', 'attack', { id: 'u1' });

      expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ action: 'attack', isReady: true })
          ])
        })
      }));
    });

    it('should handle debug mode', async () => {
      await service.submitAction('room-code', 'cmd', { id: 'u1' }, 'debug');
      expect(mockNarratorService.processAction).toHaveBeenCalled();
    });

    it('should throw if room not found', async () => {
      mockDocuments.findMany.mockResolvedValue([]);
      await expect(service.submitAction('room-code', 'act', { id: 'u1' })).rejects.toThrow('Room not found');
    });
  });

  describe('executeDeterministicTurn', () => {
    it('should process move actions', async () => {
      mockDocuments.findOne.mockResolvedValue({
        documentId: 'room-1',
        entity_sheets: [{ documentId: 'hero', id: 'hero', position: { x: 0, y: 0, z: 0 } }],
        world: {},
        exploredTiles: [],
        exploredChunks: [],
      });
      mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' } });

      const actions = [{
        type: 'move',
        entityId: 'hero',
        payload: { x: 1, y: 0, z: 0 }
      }];

      await service.executeDeterministicTurn('room-1', actions);

      expect(mockTurnPersistence.updateCharacterPosition).toHaveBeenCalledWith('hero', 1, 0, 0);
      expect(mockTurnPersistence.persistTurn).toHaveBeenCalled();
    });

    it('should prevent collision', async () => {
      mockDocuments.findOne.mockResolvedValue({
        documentId: 'room-1',
        entity_sheets: [
          { documentId: 'hero', id: 'hero', position: { x: 0, y: 0 } },
          { documentId: 'orc', id: 'orc', position: { x: 1, y: 0 } }
        ],
      });
      mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' } });

      const actions = [{
        type: 'move',
        entityId: 'hero',
        payload: { x: 1, y: 0, z: 0 }
      }];

      await service.executeDeterministicTurn('room-1', actions);

      expect(mockTurnPersistence.updateCharacterPosition).not.toHaveBeenCalled();
      expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Collision detected'));
    });

    // Exploration test - New Chunk
    it('should trigger biome spawn on new chunk', async () => {
       mockDocuments.findOne.mockResolvedValue({
        documentId: 'room-1',
        entity_sheets: [{ documentId: 'hero', id: 'hero', position: { x: 0, y: 0 } }],
        world: {},
        exploredTiles: [],
        exploredChunks: [], // Empty chunks
      });
      mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' } });
      // Moving to 10,10. Chunk size 16. Still chunk 0,0.
      // Let's move far?
      // No, x=10 is inside chunk 0 (0-15).
      // Wait, exploredChunks "0,0" is NOT in the set.
      // So moving anywhere should trigger exploration.
      // The logic checks RADIUS. from targetX, targetY.
      // If we move to 0,0 -> we explore 0,0.
      mockVoxelEngine.getChunk.mockResolvedValue({ tiles: [] }); // Empty tiles

      const actions = [{
        type: 'move',
        entityId: 'hero',
        payload: { x: 0, y: 0 }
      }];

      await service.executeDeterministicTurn('room-1', actions);

      expect(mockBiomeSpawnService.populateChunk).toHaveBeenCalled();
      expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ exploredChunks: expect.arrayContaining(['0,0']) })
      }));
    });

    it('should process attack actions', async () => {
        mockDocuments.findOne.mockResolvedValue({
            documentId: 'room-1', entity_sheets: []
        });
        mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' } });

        const actions = [{
            type: 'attack',
            entityId: 'hero',
            payload: { targetId: 'orc' }
        }];

        await service.executeDeterministicTurn('room-1', actions);
        expect(mockActionEngine.dispatch).toHaveBeenCalled();
    });

    it('should process spawn actions', async () => {
        mockDocuments.findOne.mockResolvedValue({
            documentId: 'room-1', entity_sheets: []
        });
        mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' } });

        const actions = [{
            type: 'spawn',
            payload: { entityType: 'monster', id: 'goblin', position: {x:0,y:0} }
        }];

        await service.executeDeterministicTurn('room-1', actions);
        expect(mockSpawnService.spawnMonster).toHaveBeenCalledWith('room-1', 'goblin', {x:0,y:0});
    });
  });

  describe('processTurn (Legacy)', () => {
      it('should handle entropy and narrative', async () => {
          mockEntropySystem.advanceTurn.mockReturnValue({ newEvent: { visibility: 'all' } });
          mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({
              overall_summary: 'Summary',
              messages: [],
              commands: [],
              metadata: {}
          });
          mockTurnPersistence.persistTurn.mockResolvedValue({
              turn: { documentId: 'turn-1' },
              room: { documentId: 'room-1' }
          });
          mockDocuments.findOne.mockResolvedValue({ // Room fetch
              documentId: 'room-1',
              entity_sheets: [],
              exploredTiles: [],
          });

          await service.processTurn('room-1', 'desc', [], [], 'en', {}, [], '', '', {});

          expect(mockEntropySystem.advanceTurn).toHaveBeenCalled();
          expect(mockGameLedger.logEvent).toHaveBeenCalled(); // Entropy event
          expect(mockNarrativeEngine.generateNarrativeResponse).toHaveBeenCalled();
          expect(mockTurnPersistence.persistTurn).toHaveBeenCalled();
      });

      it('should generate map image if chunk provided', async () => {
          mockEntropySystem.advanceTurn.mockReturnValue(null);
          // Return valid objects for uploads
          mockUploadService.upload.mockResolvedValue({ id: 'img-1' });
          mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({ overall_summary: 'Summary' });
          mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' }, room: { documentId: 'room-1' } });
          mockDocuments.findOne.mockResolvedValue({
              documentId: 'room-1',
              entity_sheets: [],
          });
          mockGenerateMapImage.mockResolvedValue(Buffer.from('img'));

          await service.processTurn('room-1', 'desc', [], [], 'en', {}, [], '', '', { tiles: [] }); // Chunk provided

          expect(mockGenerateMapImage).toHaveBeenCalled();
          expect(mockUploadService.upload).toHaveBeenCalled();
          expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
              documentId: 'turn-1',
              data: { contextImage: 'img-1' }
          }));
      });
  });
});
