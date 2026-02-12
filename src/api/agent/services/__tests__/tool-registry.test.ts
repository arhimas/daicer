import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import toolRegistryFactory from '../tool-registry';

// Mock dependencies
const mockActionEngine = {
  dispatch: vi.fn(),
};

const mockSpawnService = {
  spawn: vi.fn(),
};

const mockTurnProcessing = {
  submitAction: vi.fn(),
};

const mockGameEventService = {
  inspectTerrain: vi.fn(),
};

const mockVoxelService = {
  getChunk: vi.fn(),
};

const mockDocuments = {
  findOne: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
};

const mockDbConnection = {
  raw: vi.fn(),
};

const mockGenerateMapImage = vi.fn();
const mockGenerateEmbedding = vi.fn();

// Mock dynamic imports
vi.mock('../../../game/services/map-visualization', () => ({
  generateMapImage: (...args: any[]) => mockGenerateMapImage(...args),
}));

vi.mock('../../../../services/embedding-service', () => ({
  embeddingService: {
    generateEmbedding: (...args: any[]) => mockGenerateEmbedding(...args),
  },
}));

const mockStrapi = {
  service: vi.fn((uid) => {
    switch (uid) {
      case 'api::game.action-engine':
        return mockActionEngine;
      case 'api::game.spawn-service':
        return mockSpawnService;
      case 'api::game.turn-processing':
        return mockTurnProcessing;
      case 'api::game-event.game-event':
        return mockGameEventService;
      case 'api::voxel-engine.voxel-engine':
        return mockVoxelService;
      default:
        return {};
    }
  }),
  documents: vi.fn(() => mockDocuments),
  db: {
    connection: mockDbConnection,
  },
} as any;

describe('Tool Registry Service', () => {
  let toolRegistry: any;

  beforeEach(() => {
    vi.clearAllMocks();
    toolRegistry = toolRegistryFactory({ strapi: mockStrapi });
  });

  describe('Basic Functionality', () => {
    it('should register and retrieve tools', () => {
      const tools = toolRegistry.getTools();
      expect(tools.length).toBeGreaterThan(0);
      expect(toolRegistry.hasTool('perform_attack')).toBe(true);
    });

    it('should throw if tool not found', async () => {
      await expect(toolRegistry.execute('non_existent', 'room-1', {}, {})).rejects.toThrow('Tool non_existent not registered');
    });
  });

  describe('Action Tools', () => {
    it('perform_attack should dispatch ATTACK command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('perform_attack', 'room-1', {
        attackerId: 'hero',
        targetId: 'orc',
        actionName: 'Sword',
      }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({
          type: 'ATTACK',
          payload: { actorId: 'hero', targetId: 'orc', weaponId: 'Sword' },
        }),
      ]);
    });

    it('move_entity should dispatch MOVE command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('move_entity', 'room-1', {
        entityId: 'hero',
        path: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
      }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({
          type: 'MOVE',
          payload: {
            actorId: 'hero',
            targetPosition: { x: 1, y: 0, z: 0 },
            path: expect.any(Array),
            mode: 'walk',
          },
        }),
      ]);
    });

    it('spawn_entity should call SpawnService', async () => {
      mockSpawnService.spawn.mockResolvedValue({ success: true });
      await toolRegistry.execute('spawn_entity', 'room-1', {
        blueprintId: 'orc',
        type: 'monster',
        position: { x: 10, y: 10, z: 0 },
      }, {});

      expect(mockSpawnService.spawn).toHaveBeenCalledWith('room-1', {
        blueprintId: 'orc',
        type: 'monster',
        position: { x: 10, y: 10, z: 0 },
      });
    });

    it('perform_action (Unified) should queue action via TurnProcessing', async () => {
      mockTurnProcessing.submitAction.mockResolvedValue(true);
      await toolRegistry.execute('perform_action', 'room-1', {
        actorId: 'hero',
        actionId: 'dash',
        targetId: 'orc',
      }, {});

      expect(mockTurnProcessing.submitAction).toHaveBeenCalledWith(
        'room-1',
        expect.stringContaining('"type":"DO_ACTION"'),
        expect.anything(),
        undefined
      );
    });

    it('cast_spell should dispatch CAST_SPELL command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('cast_spell', 'room-1', {
        type: 'cast_spell',
        actionId: 'spell-action-1',
        spellId: 'fireball',
        // actorId is stripped by schema, so it defaults to 'unknown' in current impl
        // targetIds is the correct field name
        targetIds: ['group'],
      }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({
          type: 'CAST_SPELL',
          // actorId falls back to 'unknown' due to schema stripping
          payload: expect.objectContaining({ spellId: 'fireball', actorId: 'unknown' }),
        }),
      ]);
    });

    it('interact_object should dispatch INTERACT command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('interact_object', 'room-1', {
        actorId: 'hero',
        targetId: 'door',
        interactionType: 'open',
      }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({
          type: 'INTERACT',
          payload: { actorId: 'hero', targetId: 'door', interactionType: 'open' },
        }),
      ]);
    });

    it('modify_terrain should dispatch MODIFY_TERRAIN command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('modify_terrain', 'room-1', {
        actorId: 'dm',
        center: { x: 0, y: 0, z: 0 },
        radius: 5,
        type: 'water',
      }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({ type: 'MODIFY_TERRAIN' }),
      ]);
    });

    it('long_rest should dispatch LONG_REST command', async () => {
      mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
      await toolRegistry.execute('long_rest', 'room-1', { actorId: 'hero' }, {});

      expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [
        expect.objectContaining({ type: 'LONG_REST', payload: { actorId: 'hero' } }),
      ]);
    });

    it('drop_item should dispatch DROP_ITEM command', async () => {
        mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
        await toolRegistry.execute('drop_item', 'room-1', { entityId: 'hero', itemComponentId: 'item-1' }, {});

        expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [expect.objectContaining({ type: 'DROP_ITEM'})]);
    });

    it('pickup_item should dispatch PICKUP_ITEM command', async () => {
        mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
        await toolRegistry.execute('pickup_item', 'room-1', { actorId: 'hero', targetId: 'item-1' }, {});
        expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [expect.objectContaining({ type: 'PICKUP_ITEM'})]);
    });

    it('throw_item should dispatch THROW_ITEM command', async () => {
        mockActionEngine.dispatch.mockResolvedValue([{ success: true }]);
        await toolRegistry.execute('throw_item', 'room-1', { actorId: 'hero', itemComponentId: 'rock', targetPosition: {x:10, y:10, z:0} }, {});
        expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [expect.objectContaining({ type: 'THROW_ITEM'})]);
    });
  });

  describe('Information Tools', () => {
    it('get_available_actions should require entity', async () => {
      mockDocuments.findOne.mockResolvedValue({
        documentId: 'hero',
        inventory: [],
        stats: {},
        level: 5,
      });

      const actions = await toolRegistry.execute('get_available_actions', 'room-1', { entityId: 'hero' }, {});
      expect(Array.isArray(actions)).toBe(true);
    });

    it('search_monsters should exact match or contain', async () => {
        mockDocuments.findMany.mockResolvedValue([{ name: 'Orc', hp: 10 }]);
        const res = await toolRegistry.execute('search_monsters', 'room-1', { query: 'Orc' }, {});
        expect(res).toContain('Orc');
    });

    it('search_spells should return spell info', async () => {
        mockDocuments.findMany.mockResolvedValue([{ name: 'Fireball', level: 3 }]);
        const res = await toolRegistry.execute('search_spells', 'room-1', { query: 'Fire' }, {});
        expect(res).toContain('Fireball');
    });

    it('search_classes should return class info', async () => {
        mockDocuments.findMany.mockResolvedValue([{ name: 'Fighter', hit_die: 10 }]);
        const res = await toolRegistry.execute('search_classes', 'room-1', { query: 'Fight' }, {});
        expect(res).toContain('Fighter');
    });

    it('search_races should return race info', async () => {
        mockDocuments.findMany.mockResolvedValue([{ name: 'Human', size: 'Medium' }]);
        const res = await toolRegistry.execute('search_races', 'room-1', { query: 'Hum' }, {});
        expect(res).toContain('Human');
    });

    it('retrieve_knowledge should query db', async () => {
        mockGenerateEmbedding.mockResolvedValue([0.1, 0.2]);
        mockDbConnection.raw.mockResolvedValue({ rows: [{ title: 'DND', content: 'Rules' }] });
        const res = await toolRegistry.execute('retrieve_knowledge', 'room-1', { query: 'Help' }, {});
        expect(mockGenerateEmbedding).toHaveBeenCalledWith('Help');
        expect(mockDbConnection.raw).toHaveBeenCalled();
        expect(res).toContain('Rules');
    });

    it('inspect_map should call GameEventService', async () => {
        mockGameEventService.inspectTerrain.mockResolvedValue('Grass');
        const res = await toolRegistry.execute('inspect_map', 'room-1', { x: 0, y: 0 }, {});
        expect(mockGameEventService.inspectTerrain).toHaveBeenCalled();
        expect(res).toBe('Grass');
    });

    it('list_entities should list entities from strapi', async () => {
        mockDocuments.findMany.mockResolvedValue([{ documentId: 'e1', name: 'Goblin', position: {x:0,y:0,z:0}, currentHp: 5, maxHp: 10 }]);
        const res = await toolRegistry.execute('list_entities', 'room-1', {}, {});
        expect(res).toContain('Goblin');
    });

    it('get_map_image should generate image', async () => {
        mockDocuments.findOne.mockResolvedValue({
            documentId: 'room-1',
            entity_sheets: [{ documentId: 'hero', name: 'Hero', type: 'player', position: {x:0,y:0}, currentHp: 10, maxHp: 10 }],
            exploredTiles: [],
            config: {},
        });
        mockVoxelService.getChunk.mockResolvedValue({}); // Mock chunk
        mockGenerateMapImage.mockResolvedValue(Buffer.from('fake-image'));

        const res = await toolRegistry.execute('get_map_image', 'room-1', { x: 0, y: 0 }, {});
        expect(mockGenerateMapImage).toHaveBeenCalled();
        expect(res).toHaveProperty('base64');
    });
  });

  describe('World State Tools', () => {
      it('set_time should update room time', async () => {
          mockDocuments.findOne.mockResolvedValue({ world: { time: 0 } });
          mockDocuments.update.mockResolvedValue({});
          await toolRegistry.execute('set_time', 'room-1', { time: 100 }, {});
          expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
              data: expect.objectContaining({ world: expect.objectContaining({ time: 100 }) })
          }));
      });

      it('get_time should return formatted time', async () => {
          mockDocuments.findOne.mockResolvedValue({ world: { time: 3660 } }); // 1h 1m
          const res = await toolRegistry.execute('get_time', 'room-1', {}, {});
          expect(res).toHaveProperty('formatted', '01:01');
      });

      it('set_entropy should update condition', async () => {
          mockDocuments.findOne.mockResolvedValue({ entropyState: { conditions: [{ key: 'Rain', currentValue: 'None' }] } });
          await toolRegistry.execute('set_entropy', 'room-1', { key: 'Rain', value: 'Heavy' }, {});
          expect(mockDocuments.update).toHaveBeenCalled();
      });

      it('get_entropy should return state', async () => {
          mockDocuments.findOne.mockResolvedValue({ entropyState: { conditions: [] } });
          const res = await toolRegistry.execute('get_entropy', 'room-1', {}, {});
          expect(res).toHaveProperty('conditions');
      });

      it('set_weather should use set_entropy', async () => {
           mockDocuments.findOne.mockResolvedValue({ entropyState: { conditions: [{ key: 'Local Weather', currentValue: 'Sunny' }] } });
           await toolRegistry.execute('set_weather', 'room-1', { weather: 'Rainy' }, {});
           expect(mockDocuments.update).toHaveBeenCalled();
      });
  });
});
