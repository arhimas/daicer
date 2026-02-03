/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestContext } from '@/api/game/services/__tests__/utils/test-utils';
import { findPath } from '@daicer/engine/rules/spatial';

// Mock Dependencies
vi.mock('../../src/engine/rules/spatial', () => ({
  findPath: vi.fn(),
}));

/**
 * FIX: The test context creates a local mockStrapi, but unrelated services imported inside actionEngine
 * might be trying to access the global `strapi` variable if it wasn't strictly injected everywhere.
 * We ensure global 'strapi' is available before modules load.
 */
const mockGlobalStrapi = {
  log: { error: vi.fn(), info: vi.fn(), debug: vi.fn() },
  db: { query: vi.fn() },
  documents: vi.fn(),
};
vi.stubGlobal('strapi', mockGlobalStrapi);

describe('Combat & Movement Mechanics (Stateful)', () => {
  let context: ReturnType<typeof createTestContext>;

  beforeEach(() => {
    vi.clearAllMocks();
    context = createTestContext();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Movement Mechanics', () => {
    it('should persist position update after successful move', async () => {
      const { db, actionEngine } = context;

      // Seed Data
      db.seed('api::entity-sheet.entity-sheet', [
        {
          documentId: 'hero-1',
          name: 'Hero',
          position: { x: 0, y: 0, z: 0 },
          speed: { walk: 30 },
          room: { documentId: 'room-1', config: { chunkSize: 16 } },
        },
      ]);

      // Mock Pathfinding (Success)
      vi.mocked(findPath).mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ]);

      const command = {
        type: 'MOVE',
        payload: { actorId: 'hero-1', targetPosition: { x: 5, y: 0, z: 0 }, mode: 'walk' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);

      // 1. Check Result Success
      expect(results[0].success).toBe(true);

      // 2. Check Persistence (The "Better Way")
      const hero = db.getState('api::entity-sheet.entity-sheet', 'hero-1');
      expect(hero.position).toEqual({ x: 5, y: 0, z: 0 }); // State explicitly updated!
    });

    it('should fail if pathfinding returns empty path (Obstacle)', async () => {
      const { db, actionEngine } = context;

      db.seed('api::entity-sheet.entity-sheet', [
        {
          documentId: 'hero-blocked',
          name: 'Hero',
          position: { x: 0, y: 0, z: 0 },
          speed: { walk: 30 },
          room: { documentId: 'room-1' },
        },
      ]);

      // Mock Blocked Path
      vi.mocked(findPath).mockReturnValue([]);

      const command = {
        type: 'MOVE',
        payload: { actorId: 'hero-blocked', targetPosition: { x: 10, y: 0, z: 0 }, mode: 'walk' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);

      expect(results[0].success).toBe(false);
      expect(results[0].message).toContain('Path blocked');

      // Verify No State Change
      const hero = db.getState('api::entity-sheet.entity-sheet', 'hero-blocked');
      expect(hero.position).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('Combat Interaction', () => {
    beforeEach(() => {
      // Setup Combatants
      const { db } = context;
      db.seed('api::entity-sheet.entity-sheet', [
        {
          documentId: 'attacker-1',
          name: 'Knight',
          position: { x: 0, y: 0, z: 0 },
          stats: { strength: 18 },
          computedActions: [
            {
              id: 'sword-attack',
              name: 'Sword',
              type: 'melee_attack',
              attackBonus: 10,
              damage: [{ diceCount: 1, diceValue: 8, flatBonus: 4, damageType: 'slashing' }],
            },
          ],
        },
        {
          documentId: 'victim-1',
          name: 'Goblin',
          hp: 20,
          maxHp: 20,
          armorClass: 12,
          position: { x: 5, y: 0, z: 0 }, // 5ft away (in range)
        },
      ]);
    });

    it('should apply damage and reduce HP on hit', async () => {
      const { db, actionEngine } = context;

      // Force Hit & Damage
      vi.spyOn(Math, 'random').mockReturnValue(0.8); // High roll

      const command = {
        type: 'ATTACK',
        payload: { actorId: 'attacker-1', targetId: 'victim-1', weaponId: 'sword-attack' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);

      expect(results[0].success).toBe(true);

      // Verify Persistence
      const victim = db.getState('api::entity-sheet.entity-sheet', 'victim-1');
      expect(victim.hp).toBeLessThan(20); // HP Should be reduced
      expect(results[0].events.map((e: any) => e.type)).toContain('DAMAGE_DEALT');
    });

    it('should trigger death event when HP reaches 0', async () => {
      const { db, actionEngine } = context;

      // Update Victim to have 1 HP
      db.seed('api::entity-sheet.entity-sheet', [
        {
          documentId: 'victim-low',
          name: 'Weak Goblin',
          hp: 1,
          maxHp: 20,
          armorClass: 10,
          position: { x: 5, y: 0, z: 0 },
        },
        {
          documentId: 'attacker-1',
          // ... reuse existing props ...
          name: 'Knight',
          computedActions: [{ id: 'punch', type: 'melee_attack', attackBonus: 100, damage: [{ flatBonus: 10 }] }],
        } as any,
      ]);

      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const command = {
        type: 'ATTACK',
        payload: { actorId: 'attacker-1', targetId: 'victim-low', weaponId: 'punch' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);

      const victim = db.getState('api::entity-sheet.entity-sheet', 'victim-low');
      expect(victim.hp).toBe(0);

      const eventTypes = results[0].events.map((e: any) => e.type);
      expect(eventTypes).toContain('ENTITY_DEATH');
    });
  });
});
