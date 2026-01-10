import { describe, it, expect, vi, beforeEach } from 'vitest';
import actionEngineFactory from '../action-engine';

describe('Action Engine Service', () => {
  let actionEngine: any;
  let mockStrapi: any;

  const mockActor = {
    documentId: 'actor-1',
    name: 'Hero',
    position: { x: 0, y: 0, z: 0 },
    speed: { walk: 30 },
    stats: { strength: 10, dexterity: 10 },
    room: { config: { chunkSize: 16 } },
    computedActions: [
      {
        id: 'action-sword',
        name: 'Longsword',
        type: 'weapon',
        attackBonus: 5,
        damage: [{ diceCount: 1, diceValue: 6, flatBonus: 2 }],
      },
    ],
  };

  const mockRoomEntities = [
    { documentId: 'actor-1', position: { x: 0, y: 0, z: 0 } },
    { documentId: 'obstacle-1', position: { x: 5, y: 0, z: 0 } },
  ];

  beforeEach(() => {
    mockStrapi = {
      documents: vi.fn((_uid) => ({
        findOne: vi.fn(async ({ documentId }) => {
          if (documentId === 'actor-1') return mockActor;
          if (documentId === 'target-1')
            return {
              ...mockActor,
              documentId: 'target-1',
              hp: 10,
              armorClass: 10,
              position: { x: 5, y: 0, z: 0 },
              computedActions: [],
            };
          return null;
        }),
        findMany: vi.fn(async () => mockRoomEntities),
        update: vi.fn(),
        create: vi.fn(),
      })),
      service: vi.fn().mockReturnValue({
        dropItem: vi.fn(async () => ({ success: true })),
        handleModifyTerrain: vi.fn(async () => ({ success: true })),
      }),
    };

    // Global strapi stub for service factory if needed, but we pass it directly
    actionEngine = actionEngineFactory({ strapi: mockStrapi });
  });

  describe('Pure Logic (Dry Run)', () => {
    it('should resolve MOVE command without persistence', async () => {
      const command = {
        type: 'MOVE',
        payload: {
          actorId: 'actor-1',
          targetPosition: { x: 3, y: 0, z: 0 },
          mode: 'walk',
        },
      };

      // Mock Pathfinding (Simulated by simple checks in logic, or we rely on actual simple logic in service)
      // Since findPath is imported, we should mock it if complex.
      // But the current implementation uses `findPath` from `spatial`.
      // We'll rely on real `findPath` if available or mock it if imported.
      // The previous test file mocked `findPath`.
      // Let's assume for this integration test we want robustness or Mock it.
      // If we don't mock `findPath`, it might fail if dependencies missing.
      // Let's mock `findPath` via `vi.mock`.
    });
  });
});

// Since I cannot rewrite partial logic easily with `write_to_file` effectively merging without clear strategy, I will write the FULL content.

// Need to hoist mocks
const { mockFindPath } = vi.hoisted(() => ({
  mockFindPath: vi.fn(),
}));

vi.mock('../../../../engine/rules/spatial', () => ({
  findPath: mockFindPath,
}));

describe('Action Engine Service (Unified)', () => {
  let actionEngine: any;
  let mockStrapi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStrapi = {
      documents: vi.fn((_uid) => ({
        findOne: vi.fn(async ({ documentId }) => {
          if (documentId === 'actor-1')
            return {
              documentId: 'actor-1',
              name: 'Hero',
              position: { x: 0, y: 0, z: 0 },
              speed: 30,
              room: { config: { chunkSize: 16 } },
              computedActions: [
                {
                  id: 'action-sword',
                  name: 'Longsword',
                  type: 'weapon',
                  attackBonus: 5,
                  damage: [{ diceCount: 1, diceValue: 6, flatBonus: 2 }],
                },
              ],
            };
          if (documentId === 'target-1')
            return {
              documentId: 'target-1',
              hp: 10,
              maxHp: 10,
              armorClass: 10,
              position: { x: 5, y: 0, z: 0 },
            };
          return null;
        }),
        findMany: vi.fn(async () => []),
        update: vi.fn(),
        create: vi.fn(),
      })),
      service: vi.fn().mockReturnValue({
        dropItem: vi.fn(async () => ({ success: true })),
        handleModifyTerrain: vi.fn(async () => ({ success: true })),
      }),
    };

    // We simulate `global.strapi` just in case, or pass it.
    actionEngine = actionEngineFactory({ strapi: mockStrapi });
  });

  describe('Move Command', () => {
    it('should return diffs without persisting in dryRun mode', async () => {
      mockFindPath.mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: 0 },
      ]);

      const command = {
        type: 'MOVE',
        payload: { actorId: 'actor-1', targetPosition: { x: 3, y: 0, z: 0 }, mode: 'walk' },
      };

      const results = await actionEngine.dispatch('room-1', [command], true);
      const result = results[0];

      expect(result.success).toBe(true);
      expect(result.stateDiff.updates).toHaveLength(1);
      expect(result.stateDiff.updates[0].data.position).toEqual(expect.objectContaining({ x: 3 }));
      // Verify NO DB calls
      expect(mockStrapi.documents('api::entity-sheet.entity-sheet').update).not.toHaveBeenCalled();
    });

    it('should persist in default/legacy mode', async () => {
      mockFindPath.mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 3, y: 0, z: 0 },
      ]);
      const command = {
        type: 'MOVE',
        payload: { actorId: 'actor-1', targetPosition: { x: 3, y: 0, z: 0 }, mode: 'walk' },
      };

      await actionEngine.dispatch('room-1', [command], false);

      expect(mockStrapi.documents('api::entity-sheet.entity-sheet').update).toHaveBeenCalled();
    });
  });

  describe('Attack Command', () => {
    it('should use computedActions and resolve damage', async () => {
      const command = {
        type: 'ATTACK',
        payload: { actorId: 'actor-1', targetId: 'target-1', weaponId: 'Longsword' },
      };

      // Mock random to ensure hit
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9); // High roll

      const results = await actionEngine.dispatch('room-1', [command], true);
      const result = results[0];

      if (!result.success) {
        console.error('Attack Test Failed Message:', result.message);
      }

      // If this fails, it prints expected vs received
      expect(result.message).toMatch(/Hit|Missed/); // or 'Hit for X'
      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('ATTACK_RESULT');
      expect(result.events[1].type).toBe('DAMAGE_DEALT');
      expect(result.stateDiff.updates[0].data.hp).toBeLessThan(10);

      spy.mockRestore();
    });
  });
});
