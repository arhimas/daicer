import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnProcessingFactory from '../turn-processing';

// Mock dependencies
const mockNarrativeEngine = {
  generateNarrativeResponse: vi.fn(),
};
const mockTurnPersistence = {
  persistTurn: vi.fn(),
  clearPlayerActions: vi.fn(),
  updateCharacterPosition: vi.fn(),
};
const mockGameBroadcaster = {
  startProcessing: vi.fn(),
  broadcastNewMessage: vi.fn(),
  broadcastGameUpdate: vi.fn(),
  broadcastTurnComplete: vi.fn(),
  broadcastEntitiesUpdate: vi.fn(),
  broadcastTurnStart: vi.fn(),
  broadcastTurnEnd: vi.fn(),
};
const mockActionEngine = {
  dispatch: vi.fn(),
  validate: vi.fn(),
};
const mockSpawnService = {
  spawnMonster: vi.fn(),
  spawnCharacter: vi.fn(),
};
const mockEntityAdapter = {
  adapt: vi.fn((s) => ({ id: s.documentId, name: s.name })),
};

const mockStrapi = {
  service: vi.fn((uid) => {
    switch (uid) {
      case 'api::game.narrative-engine':
        return mockNarrativeEngine;
      case 'api::game.turn-persistence':
        return mockTurnPersistence;
      case 'api::game.game-broadcaster':
        return mockGameBroadcaster;
      case 'api::game.action-engine':
        return mockActionEngine;
      case 'api::game.spawn-service':
        return mockSpawnService;
      case 'api::game.entity-adapter':
        return mockEntityAdapter;
      case 'api::game.turn-processing':
        // Circular reference for executeDeterministicTurn call within processTurn
        // We need to return the service itself or a mock of it?
        // In processTurn, it calls generic executeDeterministicTurn via strapi.service
        // We will mock this specifically in processTurn tests, or allow recursion if using actual implementation.
        // For unit testing the factory, we might need to handle this carefully.
        return { executeDeterministicTurn: vi.fn() };
      default:
        return {};
    }
  }),
  documents: vi.fn(() => ({
    findOne: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  })),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  plugin: vi.fn(() => ({
    service: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ id: 'img-123' }),
    })),
  })),
};

describe('Turn Processing Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = turnProcessingFactory({ strapi: mockStrapi });

    // Default mock return
    mockTurnPersistence.persistTurn.mockResolvedValue({
      turn: { documentId: 'turn-1', turnNumber: 5, narrative: 'Stuff happened' },
      message: { documentId: 'msg-1', content: 'Narrative content', timestamp: 123 },
      room: { documentId: 'room-1', roomId: 'ROOM-1', entity_sheets: [] },
      snapshot: {},
    });
  });

  describe('executeDeterministicTurn', () => {
    it('should move an entity involved in a valid move action', async () => {
      // Setup Room
      const mockRoom = {
        documentId: 'room-1',
        roomId: 'ROOM-1',
        entity_sheets: [
          { documentId: 'hero-1', id: 'hero-1', name: 'Hero', position: { x: 0, y: 0, z: 0 } },
          { documentId: 'orc-1', id: 'orc-1', name: 'Orc', position: { x: 10, y: 10, z: 0 } },
        ],
        exploredTiles: [],
      };

      const findOneMock = vi.fn().mockResolvedValue(mockRoom);
      const updateMock = vi.fn().mockResolvedValue({});
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: findOneMock,
        update: updateMock,
        findMany: vi.fn(),
      });

      mockActionEngine.validate.mockReturnValue({ valid: true });
      mockGameBroadcaster.broadcastTurnStart.mockResolvedValue(undefined as unknown as void);
      mockGameBroadcaster.broadcastTurnEnd.mockResolvedValue(undefined as unknown as void);
      mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({ summary: 'A turn happened.' });

      const deterministicActions: unknown[] = [{ type: 'MOVE' }];
      // Setup Actions
      const actions = [{ type: 'move', entityId: 'hero-1', payload: { x: 1, y: 0, z: 0 } }];

      // Execute
      const result = await service.executeDeterministicTurn('room-1', actions);

      // Assertions
      expect(result.success).toBe(true);

      // Verify Collision did NOT trigger (implied by success)
      expect(mockStrapi.log.warn).not.toHaveBeenCalled();

      // Verify Persistence Update
      expect(mockTurnPersistence.updateCharacterPosition).toHaveBeenCalledWith('hero-1', 1, 0, 0);

      // Verify Broadcast
      expect(mockGameBroadcaster.broadcastEntitiesUpdate).toHaveBeenCalled();

      // Verify result structure (turnId comes from persistTurn mock which defaults to undefined if not mocked return)
      // Wait, we didn't mock persistTurn return.
    });

    it('should block movement if destination is occupied by another entity', async () => {
      // Setup Room: Hero at 0,0. Orc at 1,0.
      const mockRoom = {
        documentId: 'room-1',
        roomId: 'ROOM-1',
        entity_sheets: [
          { documentId: 'hero-1', id: 'hero-1', name: 'Hero', position: { x: 0, y: 0, z: 0 } },
          { documentId: 'orc-1', id: 'orc-1', name: 'Orc', position: { x: 1, y: 0, z: 0 } },
        ],
      };

      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockRoom),
        update: vi.fn(),
        findMany: vi.fn(),
      });

      // Action: Hero tries to move to 1,0 (Orc position)
      const actions = [{ type: 'move', entityId: 'hero-1', payload: { x: 1, y: 0, z: 0 } }];

      await service.executeDeterministicTurn('room-1', actions);

      // Assertions
      // warn should be called
      expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Collision detected'));
      // persistence should NOT be called
      expect(mockTurnPersistence.updateCharacterPosition).not.toHaveBeenCalled();
    });

    it('should process spawn actions correctly', async () => {
      const mockRoom = { documentId: 'room-1', roomId: 'ROOM-1', entity_sheets: [] };
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({ findOne: vi.fn().mockResolvedValue(mockRoom) });

      const actions = [
        { type: 'spawn', payload: { entityType: 'monster', id: 'goblin-template', position: { x: 5, y: 5, z: 0 } } },
      ];

      await service.executeDeterministicTurn('room-1', actions);

      expect(mockSpawnService.spawnMonster).toHaveBeenCalledWith('room-1', 'goblin-template', { x: 5, y: 5, z: 0 });
    });

    it('should update exploration when moving', async () => {
      const mockRoom = {
        documentId: 'room-1',
        entity_sheets: [{ documentId: 'hero-1', position: { x: 0, y: 0, z: 0 } }],
        exploredTiles: ['0,0'],
      };

      const updateMock = vi.fn().mockResolvedValue({});
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn().mockResolvedValue(mockRoom),
        update: updateMock,
        findMany: vi.fn(),
      });

      // Move far enough to reveal new tiles
      const actions = [{ type: 'move', entityId: 'hero-1', payload: { x: 2, y: 0, z: 0 } }];

      await service.executeDeterministicTurn('room-1', actions);

      expect(updateMock).toHaveBeenCalled();
      const updateCall = updateMock.mock.calls[0];
      const data = updateCall[0].data;
      expect(data.exploredTiles.length).toBeGreaterThan(1); // Should add more tiles
    });
  });

  describe('processTurn', () => {
    // Mock return values for complex deps
    beforeEach(() => {
      mockTurnPersistence.persistTurn.mockResolvedValue({
        turn: { documentId: 'turn-1', turnNumber: 5, narrative: 'Stuff happened' },
        message: { documentId: 'msg-1', content: 'Narrative content', timestamp: 123 },
        room: { documentId: 'room-1', roomId: 'ROOM-1', entity_sheets: [] },
        snapshot: {},
      });
      mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({
        overall_summary: 'Turn Summary',
        player_perspectives: {},
        commands: [],
        metadata: { ragContext: true },
      });
      // Mock executeDeterministicTurn to be a no-op or spy
      const mockExecute = vi.fn();
      mockStrapi.service.mockImplementation((uid) => {
        if (uid === 'api::game.turn-processing') return { executeDeterministicTurn: mockExecute };
        if (uid === 'api::game.game-broadcaster') return mockGameBroadcaster;
        if (uid === 'api::game.narrative-engine') return mockNarrativeEngine;
        if (uid === 'api::game.turn-persistence') return mockTurnPersistence;
        if (uid === 'api::game.action-engine') return mockActionEngine;
        if (uid === 'api::game.entity-adapter') return mockEntityAdapter;
        return {};
      });
    });

    it('should orchestrate the full turn pipeline', async () => {
      const players = [{ userId: 'u1', action: 'MOVE:1,2' }];
      const messages = [{ sender: 'u1', text: 'I move' }];

      // Run
      const result = await service.processTurn('room-1', 'World Desc', messages, players, 'en');

      // Verify Flow
      expect(mockGameBroadcaster.startProcessing).toHaveBeenCalledWith('room-1');
      // executeDeterministicTurn called implicitly via service mock?
      // Wait, inside processTurn: await strapi.service('api::game.turn-processing').executeDeterministicTurn(...)
      // We verified the mock setup returns a mock function.

      expect(mockNarrativeEngine.generateNarrativeResponse).toHaveBeenCalled();
      expect(mockTurnPersistence.persistTurn).toHaveBeenCalled();
      expect(mockTurnPersistence.clearPlayerActions).toHaveBeenCalled();
      expect(mockGameBroadcaster.broadcastNewMessage).toHaveBeenCalled(); // DM Narrative
      expect(mockGameBroadcaster.broadcastTurnComplete).toHaveBeenCalled();

      expect(result.metadata.ragContext).toBe(true);
    });

    it('should dispatch deterministic commands if narrative generates them', async () => {
      mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({
        overall_summary: '',
        commands: [{ type: 'ATTACK' }],
      });

      await service.processTurn('room-1', '', [], [], 'en');

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [{ type: 'ATTACK' }]);
    });
  });
});
