/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveAttack, validateAttack, CombatPositions, resolveGrapple } from '@/api/game/src/engine/rules/combat';
import { resolveSpell, validateSpellCast } from '@/api/game/src/engine/rules/magic';
import { ActionType } from '@/api/game/src/engine/rules/actions';
import { Entity } from '@daicer/engine/types';

// Mock dependencies
vi.mock('@daicer/engine/rules/dice', () => ({
  roll: vi.fn(() => ({ total: 15, rolls: [15] })),
  parseDiceString: vi.fn(() => ({ count: 1, sides: 6, bonus: 0 })),
}));

// Mock FeatureRegistry
vi.mock('@daicer/engine/mechanics/registry/FeatureRegistry', () => ({
  FeatureRegistry: {
    get: vi.fn(),
    register: vi.fn(),
  },
  CombatContext: {},
}));

vi.mock('@daicer/engine/rules/conditions', () => ({
  getConditionModifiers: vi.fn(() => ({})),
  hasCondition: vi.fn(() => false),
  ConditionType: { Prone: 'prone' },
}));

import { getConditionModifiers, hasCondition } from '@daicer/engine/rules/conditions';

import { roll } from '@daicer/engine/rules/dice';

describe('Engine Rules', () => {
  describe('Combat', () => {
    const mockAttacker: any = {
      id: 'atk',
      stats: { strength: 10, dexterity: 10 },
      actions: [
        {
          id: 'sword',
          type: 'melee',
          toHit: 5,
          damage: [{ dice: '1d6', type: 'slashing', bonus: 2 }],
          reach: 5,
          name: 'Sword',
        },
        { id: 'bow', type: 'ranged', toHit: 5, range: { long: 100 }, name: 'Bow' },
      ],
      conditions: [],
    };
    const mockTarget: any = {
      id: 'tgt',
      armorClass: 15,
      conditions: [],
      stats: {},
      defenses: [], // Simplified
    };

    const positions: CombatPositions = {
      attacker: { x: 0, y: 0, z: 0 },
      target: { x: 5, y: 0, z: 0 }, // 5ft away
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should validate melee attack in range', () => {
      const result = validateAttack(
        mockAttacker,
        mockTarget,
        { type: ActionType.Attack, actionId: 'sword' },
        positions
      );
      expect(result.valid).toBe(true);
    });

    it('should invalid melee attack out of range', () => {
      const farPos = { ...positions, target: { x: 10, y: 0, z: 0 } }; // 10ft
      const result = validateAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'sword' }, farPos);
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/range/);
    });

    it('should validate ranged attack', () => {
      const farPos = { ...positions, target: { x: 50, y: 0, z: 0 } };
      const result = validateAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'bow' }, farPos);
      expect(result.valid).toBe(true);
    });

    it('should resolve a hit', () => {
      // Roll 15 + 5 = 20 vs AC 15 -> Hit
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 20, rolls: [15] } as any) // Attack
        .mockReturnValueOnce({ total: 6, rolls: [4] } as any); // Damage

      const result = resolveAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'sword' });
      expect(result.hit).toBe(true);
      expect(result.verdict).toBe('Hit');
      expect(result.damageTotal).toBeGreaterThan(0);
    });

    it('should resolve a miss', () => {
      // Roll 5 + 5 = 10 vs AC 15 -> Miss
      vi.mocked(roll).mockReturnValueOnce({ total: 10, rolls: [5] } as any);

      const result = resolveAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'sword' });
      expect(result.hit).toBe(false);
      expect(result.verdict).toBe('Miss');
    });

    it('should resolve a critical hit', () => {
      // Roll 20 -> Crit
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 25, rolls: [20] } as any) // Attack
        .mockReturnValueOnce({ total: 12, rolls: [6, 6] } as any); // Damage

      const result = resolveAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'sword' });
      expect(result.isCritical).toBe(true);
      expect(result.verdict).toBe('Critical Hit!');
    });

    it('should handle advantage', () => {
      // Roll 1: 5, Roll 2: 15. Expect 15.
      // We need to mock implementation of roll to return sequence?
      // Or rely heavily on the mockReturnValueOnce sequence.
      // Logic calls roll() twice.

      vi.mocked(roll)
        .mockReturnValueOnce({ total: 10, rolls: [5] } as any)
        .mockReturnValueOnce({ total: 20, rolls: [15] } as any)
        .mockReturnValueOnce({ total: 5, rolls: [3] } as any); // Damage

      const result = resolveAttack(mockAttacker, mockTarget, {
        type: ActionType.Attack,
        actionId: 'sword',
        advantage: true,
      });
      expect(result.attackRoll.total).toBe(20);
    });
    it('should handle Prone condition (Melee Advantage)', () => {
      vi.mocked(hasCondition).mockImplementation((e, c) => c === 'prone');

      // Melee attack on Prone target -> Advantage
      // Roll 1: 5, Roll 2: 15 -> 15 (Hit vs AC 15)
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 10, rolls: [5] } as any) // Roll 1
        .mockReturnValueOnce({ total: 20, rolls: [15] } as any) // Roll 2
        .mockReturnValueOnce({ total: 5, rolls: [3] } as any); // Damage

      const result = resolveAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'sword' });
      expect(result.attackRoll.total).toBe(20);
      expect(result.hit).toBe(true);
    });

    it('should handle Prone condition (Ranged Disadvantage)', () => {
      vi.mocked(hasCondition).mockImplementation((e, c) => c === 'prone');

      // Ranged attack on Prone target -> Disadvantage
      // Roll 1: 15, Roll 2: 5 -> 5 (Miss)
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 20, rolls: [15] } as any)
        .mockReturnValueOnce({ total: 10, rolls: [5] } as any);

      const result = resolveAttack(mockAttacker, mockTarget, { type: ActionType.Attack, actionId: 'bow' });
      expect(result.attackRoll.total).toBe(10);
      expect(result.hit).toBe(false);
    });

    it('should resolve grapple', () => {
      // Mock rolls for grapple
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 15, rolls: [15] } as any) // Attacker
        .mockReturnValueOnce({ total: 10, rolls: [10] } as any); // Target

      const result = resolveGrapple(mockAttacker, mockTarget);

      expect(result.success).toBe(true);
      expect(result.verdict).toBe('Grappled!');
    });

    it('should fail grapple on tie or lower', () => {
      vi.mocked(roll)
        .mockReturnValueOnce({ total: 10, rolls: [10] } as any) // Attacker
        .mockReturnValueOnce({ total: 15, rolls: [15] } as any); // Target

      const result = resolveGrapple(mockAttacker, mockTarget);
      expect(result.success).toBe(false);
    });

    const mockSpellCaster: any = {
      id: 'wiz',
      structuredActions: [{ id: 'fireball', sourceType: 'spell', level: 3, originalRange: '150 ft', aoe: true }],
      spellbook: {
        slots: [{ level: 3, current: 1, max: 2 }],
        spellSaveDc: 15,
      },
    };

    it('should validate cast', () => {
      const res = validateSpellCast(
        mockSpellCaster,
        { type: ActionType.CastSpell, actionId: 'fireball' },
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 }
      );
      expect(res.valid).toBe(true);
    });

    it('should fail validation if no slots', () => {
      const noSlots = JSON.parse(JSON.stringify(mockSpellCaster));
      noSlots.spellbook.slots[0].current = 0;
      const res = validateSpellCast(
        noSlots,
        { type: ActionType.CastSpell, actionId: 'fireball' },
        { x: 0, y: 0, z: 0 }
      );
      expect(res.valid).toBe(false);
    });

    it('should resolve spell and consume slot', () => {
      const res = resolveSpell(mockSpellCaster, { type: ActionType.CastSpell, actionId: 'fireball' });
      expect(res.slotConsumed).toBe(3);
      expect(mockSpellCaster.spellbook.slots[0].current).toBe(0); // Mutated in place by implementation?
    });
  });
});
