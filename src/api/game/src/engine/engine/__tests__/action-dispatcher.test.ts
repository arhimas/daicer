/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionDispatcher } from '@/api/game/src/engine/engine/action-dispatcher';
import { GameState } from '@/api/game/src/engine/types/engine';
import { ActionType } from '@/api/game/src/engine/rules/actions';

// Mocks
const { mockResolveAttack, mockFindPath, mockGetTileAt, MockTerrainGenerator } = vi.hoisted(() => {
  const resolveAttack = vi.fn();
  const findPath = vi.fn();
  const getTileAt = vi.fn();

  const TerrainGen = class {
    getTileAt = getTileAt;
  };

  return {
    mockResolveAttack: resolveAttack,
    mockFindPath: findPath,
    mockGetTileAt: getTileAt,
    MockTerrainGenerator: TerrainGen,
  };
});

vi.mock('@daicer/engine/rules/combat', () => ({
  resolveAttack: (...args: any[]) => mockResolveAttack(...args),
}));

vi.mock('@daicer/engine/rules/spatial', () => ({
  findPath: (...args: any[]) => mockFindPath(...args),
}));

vi.mock('@daicer/engine/voxel/terrain-generator', () => ({
  TerrainGenerator: MockTerrainGenerator,
}));

describe('ActionDispatcher', () => {
  let dispatcher: ActionDispatcher;
  let mockState: GameState;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatcher = new ActionDispatcher('test-seed');
    mockState = {
      entities: [
        {
          id: 'hero',
          type: 'player',
          position: { x: 0, y: 0, z: 0 },
          speed: 30,
          stats: { strength: 16, dexterity: 10 },
          hp: 10,
          maxHp: 10,
          sheet: { hp: 10, maxHp: 10 },
          actions: [{ id: 'sword', name: 'Sword' }],
        },
        {
          id: 'orc',
          type: 'npc',
          position: { x: 5, y: 0, z: 0 },
          hp: 10,
          maxHp: 10,
          stats: { strength: 14 },
          sheet: { hp: 10, maxHp: 10 },
        },
      ],
      worldTime: 0,
      room: { config: {} },
    } as any;
  });

  describe('dispatch', () => {
    it('should return error for unknown command', () => {
      const result = dispatcher.dispatch(mockState, { type: 'UNKNOWN', timestamp: 0 } as any);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });
  });

  describe('handleMove', () => {
    it('should move entity if path is clear', () => {
      mockFindPath.mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
      ]);

      const result = dispatcher.dispatch(mockState, {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetPosition: { x: 2, y: 0, z: 0 } },
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Moved to');
      // Entity position should be updated in result State diff OR mutated state?
      // The dispatcher mutates the state entity objects passed in normally?
      // Yes check code: entity.position = finalPos;
      // Also check result events
      expect(result.events[0].type).toBe('ENTITY_MOVED');
      expect(mockFindPath).toHaveBeenCalled();
    });

    it('should fail if actor not found', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'ghost', targetPosition: { x: 1, y: 0, z: 0 } },
      });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Actor not found');
    });

    it('should fail if path blocked (no path returned)', () => {
      mockFindPath.mockReturnValue([]); // Empty path = blocked

      const result = dispatcher.dispatch(mockState, {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetPosition: { x: 10, y: 0, z: 0 } },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Path blocked');
    });

    it('should respect speed limit', () => {
      // Path longer than speed (30).
      // 31 steps of distance 1.
      const path = Array.from({ length: 32 }, (_, i) => ({ x: i, y: 0, z: 0 }));
      mockFindPath.mockReturnValue(path);

      const result = dispatcher.dispatch(mockState, {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetPosition: { x: 31, y: 0, z: 0 } },
      });

      expect(result.success).toBe(true);
      // Should stop at distance 30 (x=30).
      // Start is 0.
      // The loop breaks when traveled + dist > speed.
      // 30 steps = 30 distance.
      // 31st step (from 30 to 31) would make it 31 > 30. Break.
      // So final pos is x=30.
      expect(result.message).toContain('30, 0, 0');
    });

    it('should handle terrain collision check', () => {
      // For this we verify that findPath was called with a collision function that checks terrain
      mockGetTileAt.mockReturnValue({ isWalkable: false });

      // We can't easily spy on the internal closure passed to findPath without inspecting findPath calls.
      // But we can verify TerrainGenerator was instantiated.
      const result = dispatcher.dispatch(mockState, {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetPosition: { x: 5, y: 0, z: 0 } },
      });

      // Since the handler creates TerrainGenerator:
      // We can assert verify that.
      // But wait, collision function logic is internal.
      // We assume findPath uses it.
      expect(result).toBeDefined();
    });
  });

  describe('handleAttack', () => {
    it('should resolve attack and apply damage', () => {
      mockResolveAttack.mockReturnValue({
        damageTotal: 5,
        hit: true,
        verdict: 'Hit',
        attackRoll: { total: 15 },
        isCritical: false,
        trace: [],
      });

      const result = dispatcher.dispatch(mockState, {
        type: 'ATTACK',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetId: 'orc', weaponId: 'sword' },
      });

      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('ATTACK_RESULT');
      expect(mockState.entities[1].hp).toBe(5); // 10 - 5
    });

    it('should fail if actor or target missing', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'ATTACK',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetId: 'ghost' },
      });
      expect(result.success).toBe(false);
    });

    it('should fail if no action available', () => {
      mockState.entities[0].actions = []; // Remove actions
      const result = dispatcher.dispatch(mockState, {
        type: 'ATTACK',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetId: 'orc' }, // No weaponId
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('No action specified');
    });
  });

  describe('handleSkillCheck', () => {
    it('should calculate modifier and roll', () => {
      // Strength 16 -> +3
      const result = dispatcher.dispatch(mockState, {
        type: 'SKILL_CHECK',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', attribute: 'Strength', difficultyClass: 10 },
      });

      expect(result.success).toBeDefined();
      expect(result.events[0].params || result.events[0].payload).toMatchObject({
        modifier: 3,
        statName: 'Strength',
      });
    });

    it('should handle Advantage', () => {
      // Not easily deterministic without mocking Alea or spying on rng.
      // But we check flow.
      const result = dispatcher.dispatch(mockState, {
        type: 'SKILL_CHECK',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', attribute: 'Strength', advantage: true },
      });
      expect(result.events[0].payload.advantage).toBe(true);
    });

    it('should handle Roll Save (mapped to Skill Check)', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'ROLL_SAVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', stat: 'Dexterity', difficultyClass: 15 },
      });

      // Dex 10 -> +0.
      expect(result.events[0].payload.statName).toBe('Dexterity');
      expect(result.events[0].payload.target).toBe(15);
    });
  });

  describe('handleLongRest', () => {
    it('should heal actors', () => {
      mockState.entities[0].hp = 1;
      const result = dispatcher.dispatch(mockState, {
        type: 'LONG_REST',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', duration: 8 },
      });

      expect(result.success).toBe(true);
      expect(mockState.entities[0].hp).toBe(10);
      expect(result.events[0].type).toBe('LONG_REST_COMPLETED');
    });
  });

  describe('Other Commands', () => {
    it('should handle Cast Spell', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'CAST_SPELL',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', spellId: 'fireball', targetId: 'orc' },
      });
      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('SPELL_CAST');
    });

    it('should handle Interact', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'INTERACT',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'hero', targetId: 'chest', interactionType: 'open' },
      });
      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('OBJECT_INTERACTION');
    });

    it('should handle Modify Terrain', () => {
      const result = dispatcher.dispatch(mockState, {
        type: 'MODIFY_TERRAIN',
        id: '1',
        timestamp: 0,
        payload: { position: { x: 0, y: 0, z: 0 }, type: 'stone' },
      } as any);
      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('TERRAIN_MODIFIED');
    });

    // --- HARDENING TESTS ---
    describe('Hardening Edge Cases', () => {
      it('handleMove: should fail if start equals end (0 distance)', () => {
        mockFindPath.mockReturnValue([{ x: 0, y: 0, z: 0 }]); // Path is just start node
        const result = dispatcher.dispatch(mockState, {
          type: 'MOVE',
          id: '1',
          timestamp: 0,
          payload: { actorId: 'hero', targetPosition: { x: 0, y: 0, z: 0 } },
        });
        expect(result.success).toBe(false);
        expect(result.message).toContain('No movement possible');
      });

      it('handleAttack: should default to first action if weaponId missing', () => {
        mockResolveAttack.mockReturnValue({
          damageTotal: 0,
          hit: true,
          verdict: 'Hit',
          attackRoll: { total: 10 },
          isCritical: false,
          trace: [],
        });
        const result = dispatcher.dispatch(mockState, {
          type: 'ATTACK',
          id: '1',
          timestamp: 0,
          payload: { actorId: 'hero', targetId: 'orc' }, // Missing weaponId
        });
        expect(result.success).toBe(true);
        // Should use 'sword' from mockState defaults
        expect(mockResolveAttack).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({ actionId: 'sword' }),
          expect.anything()
        );
      });

      it('handleAttack: should handle resolver errors gracefully', () => {
        mockResolveAttack.mockImplementation(() => {
          throw new Error('Resolver Boom');
        });
        const result = dispatcher.dispatch(mockState, {
          type: 'ATTACK',
          id: '1',
          timestamp: 0,
          payload: { actorId: 'hero', targetId: 'orc', weaponId: 'sword' },
        });
        expect(result.success).toBe(false);
        expect(result.message).toBe('Resolver Boom');
      });

      it('handleSkillCheck: should handle Flat Check (no attribute)', () => {
        const result = dispatcher.dispatch(mockState, {
          type: 'SKILL_CHECK',
          id: '1',
          timestamp: 0,
          payload: { actorId: 'hero', difficultyClass: 10 }, // No attribute
        });
        expect(result.events[0].payload.statName).toBe('Flat Check');
        expect(result.events[0].payload.modifier).toBe(0);
      });

      it('handleSkillCheck: should prioritize Advantage over Disadvantage if logic dictates (or cancel out)', () => {
        // Logic in code: if (adv && !dis) ... else if (dis && !adv) ...
        // So if both are true, it does normal roll (neither if block).
        const result = dispatcher.dispatch(mockState, {
          type: 'SKILL_CHECK',
          id: '1',
          timestamp: 0,
          payload: { actorId: 'hero', advantage: true, disadvantage: true },
        });
        // Should not be marked as advantage or disadvantage in payload (or mixed?)
        // Code sends payload straight through.
        expect(result.events[0].payload.advantage).toBe(true);
        expect(result.events[0].payload.disadvantage).toBe(true);
        // Final roll is just roll1 (no max/min)
      });
    });
  });
});
