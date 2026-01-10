import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoist Mocks
const { mockFindPath, mockResolveAttack } = vi.hoisted(() => ({
  mockFindPath: vi.fn(),
  mockResolveAttack: vi.fn(),
}));

// 2. Mock Strapi Factories
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, cfg: any) => cfg,
  },
}));

// 3. Mock Engine Rules
vi.mock('../../src/engine/rules/spatial', () => ({
  findPath: mockFindPath,
}));

vi.mock('../../src/engine/rules/combat', () => ({
  resolveAttack: mockResolveAttack,
  ActionType: { Attack: 'attack' },
}));

// 4. Import Service Logic
import actionEngineFactory from '../action-engine';

// 5. Mock Strapi Globals
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    update: mockUpdate,
    create: mockCreate,
  }),
});

describe('Action Engine Service', () => {
  const service = actionEngineFactory({ strapi: (globalThis as unknown).strapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleMove', () => {
    it('should move actor and update DB', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'actor-1',
        room: { documentId: 'room-1' },
        position: { x: 0, y: 0, z: 0 },
        speed: 30,
      });
      mockFindMany.mockResolvedValueOnce([]);
      mockFindPath.mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ]);

      const result = await service.dispatch({
        type: 'MOVE',
        id: 'cmd-1',
        timestamp: 123,
        payload: { actorId: 'actor-1', targetPosition: { x: 5, y: 0, z: 0 } },
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'actor-1',
          data: expect.objectContaining({ position: { x: 5, y: 0, z: 0 } }),
        })
      );
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'ENTITY_MOVED' }),
        })
      );
    });

    it('should fail if path blocked', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'actor-1',
        room: { documentId: 'room-1' },
        position: { x: 0, y: 0, z: 0 },
      });
      mockFindMany.mockResolvedValueOnce([{ documentId: 'obs-1', position: { x: 1, y: 0, z: 0 } }]);

      // Force FAILURE by returning empty path
      mockFindPath.mockReturnValue([]);

      const result = await service.dispatch({
        type: 'MOVE',
        id: 'cmd-2',
        timestamp: 123,
        payload: { actorId: 'actor-1', targetPosition: { x: 5, y: 0, z: 0 } },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Path blocked');
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('handleAttack', () => {
    it('should deal damage and update target HP', async () => {
      mockFindOne
        .mockResolvedValueOnce({
          documentId: 'actor-1',
          actions: [{ documentId: 'act-1', attack_bonus: 5, damage_instances: [{ dice_count: 1, dice_value: 6 }] }],
          room: { documentId: 'room-1' },
        })
        .mockResolvedValueOnce({
          documentId: 'target-1',
          hp: 10,
          maxHp: 10,
          armorClass: 10,
        });

      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.dispatch({
        type: 'ATTACK',
        id: 'cmd-3',
        timestamp: 123,
        payload: { actorId: 'actor-1', targetId: 'target-1', weaponId: 'act-1' },
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'target-1',
          data: expect.objectContaining({ hp: expect.any(Number) }),
        })
      );
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'ATTACK_RESULT' }),
        })
      );
      randomSpy.mockRestore();
    });
  });
});
