/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import actionEngineFactory from '../action-engine';

// Mock Dependencies
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
              speed: { walk: 30 },
              room: { config: { chunkSize: 16 } },
              stats: { strength: 18, dexterity: 10 }, // High strength to assist hit
              computedActions: [
                {
                  id: 'action-sword',
                  name: 'Longsword',
                  type: 'melee_attack',
                  range: 5,
                  attackBonus: 10,
                  damage: [{ diceCount: 1, diceValue: 1, flatBonus: 5 }],
                },
              ],
            };
          if (documentId === 'target-1')
            return {
              documentId: 'target-1',
              hp: 10,
              maxHp: 10,
              armorClass: 10, // Low AC to ensure hit
              position: { x: 5, y: 0, z: 0 },
              computedActions: [],
            };
          return null;
        }),
        findMany: vi.fn(async () => []),
        update: vi.fn(),
        create: vi.fn(),
      })),
      service: vi.fn().mockReturnValue({
        dropItem: vi.fn(async () => ({ success: true })),
        handleModifyTerrain: vi.fn(async () => ({
          success: true,
          message: 'Modified',
          events: [],
          stateDiff: { updates: [] },
        })),
      }),
    };

    // Global Strapi
    vi.stubGlobal('strapi', mockStrapi);

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

      const results = await actionEngine.dispatch('room-1', [command], true); // dryRun=true
      const result = results[0];

      expect(result.success).toBe(true);
      if (result.stateDiff?.updates) {
        expect(result.stateDiff.updates).toHaveLength(1);
        expect(result.stateDiff.updates[0].data.position).toEqual(expect.objectContaining({ x: 3 }));
      }

      // Verify NO DB calls
      expect(mockStrapi.documents('api::entity-sheet.entity-sheet').update).not.toHaveBeenCalled();
    });
  });

  describe('Attack Command', () => {
    it('should use computedActions and resolve damage', async () => {
      const command = {
        type: 'ATTACK',
        payload: { actorId: 'actor-1', targetId: 'target-1', weaponId: 'Longsword' },
      };

      // Ensure Attack Roll is High
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const results = await actionEngine.dispatch('room-1', [command], true);
      const result = results[0];

      if (!result.success) {
        console.error('Attack Test Failed:', result.message);
      }

      expect(result.success).toBe(true);
      expect(result.message).toMatch(/Dealt|Hit/);

      // Check Events: ATTACK_RESULT, DAMAGE_DEALT
      const eventTypes = result.events.map((e: any) => e.type);
      expect(eventTypes).toContain('ATTACK_RESULT');
      expect(eventTypes).toContain('DAMAGE_DEALT');

      // Verify State Diff (HP Update)
      const hpUpdate = result.stateDiff.updates.find(
        (u: any) => u.documentId === 'target-1' && u.data.hp !== undefined
      );
      expect(hpUpdate).toBeDefined();
      expect(hpUpdate.data.hp).toBe(4); // 10 - 6 = 4

      spy.mockRestore();
    });
  });
});
