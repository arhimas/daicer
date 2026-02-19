import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _validateAttack, resolveAttack, resolveGrapple, _CombatPositions } from '@/api/game/src/engine/rules/combat';
import { Entity, ActionType } from '@daicer/engine/types';
import { _ConditionType } from '@/api/game/src/rules/conditions';
import { _DamageType } from '@/api/game/src/mechanics/damage/DamageType';

// Mocks
const { mockRoll, mockParseDiceString, mockGetConditionModifiers, mockHasCondition, MockDamageInstance, mockFeatureRegistry } = vi.hoisted(() => {
  const roll = vi.fn();
  const parseDice = vi.fn();
  const getCond = vi.fn();
  const hasCond = vi.fn();
  const registry = {
    get: vi.fn(),
    register: vi.fn(),
  };

  const DamageInst = class {
    constructor(public amount: number, public type: string, public source: string) {}
    resolveAgainst(_target: any) {
        return { finalAmount: this.amount, logic: [] }; 
    }
  };

  return {
    mockRoll: roll,
    mockParseDiceString: parseDice,
    mockGetConditionModifiers: getCond,
    mockHasCondition: hasCond,
    MockDamageInstance: DamageInst,
    mockFeatureRegistry: registry
  };
});

vi.mock('@daicer/engine/rules/dice', () => ({
  roll: (...args: any[]) => mockRoll(...args),
  parseDiceString: (...args: any[]) => mockParseDiceString(...args),
}));

vi.mock('@daicer/engine/rules/conditions', () => ({
  getConditionModifiers: (...args: any[]) => mockGetConditionModifiers(...args),
  hasCondition: (...args: any[]) => mockHasCondition(...args),
  ConditionType: { Prone: 'Prone' } // Mock enum
}));

vi.mock('@daicer/engine/mechanics/damage/DamageInstance', () => ({
  DamageInstance: MockDamageInstance
}));

vi.mock('@daicer/engine/mechanics/registry/FeatureRegistry', () => ({
  FeatureRegistry: mockFeatureRegistry
}));

// Helper to create entity
const createEntity = (id: string, name: string): Entity => ({
  id,
  type: 'player',
  name,
  position: { x: 0, y: 0, z: 0 },
  hp: 10,
  maxHp: 10,
  armorClass: 15,
  speed: 30,
  stats: { strength: 10, dexterity: 10 },
  actions: [
    {
      id: 'sword',
      name: 'Sword',
      type: 'melee',
      toHit: 5,
      damage: [{ dice: '1d6', bonus: 2, type: 'slashing' }],
      range: { type: 'melee', value: 5 },
    },
    {
        id: 'bow',
        name: 'Bow',
        type: 'ranged',
        toHit: 5,
        damage: [{ dice: '1d8', bonus: 2, type: 'piercing' }],
        range: { type: 'ranged', value: 60, long: 120 },
      }
  ],
  features: [],
  conditions: [],
} as any);

describe('Combat Rules SOTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockParseDiceString.mockImplementation((_s) => ({ count: 1, sides: 6, bonus: 0 }));
    mockGetConditionModifiers.mockReturnValue({});
    mockHasCondition.mockReturnValue(false);
  });

  describe('resolveAttack', () => {
    it('should throw if action is invalid', () => {
      const p1 = createEntity('p1', 'Hero');
      const t1 = createEntity('t1', 'Orc');
      expect(() => resolveAttack(p1, t1, { actionId: 'unknown', type: ActionType.Attack })).toThrow();
    });

    it('should resolve a standard hit', () => {
      const p1 = createEntity('p1', 'Hero');
      const t1 = createEntity('t1', 'Orc'); // AC 15

      // Mock Roll: To Hit
      // Action +5. We need 10 to hit AC 15.
      // Roll Returns { total: 10+5=15, rolls: [10] }
      mockRoll.mockReturnValueOnce({ total: 15, rolls: [10] }); // To Hit
      
      // Mock Roll: Damage
      // 1d6+2.
      mockRoll.mockReturnValueOnce({ total: 6, rolls: [4] }); // Damage (4+2)
      
      const result = resolveAttack(p1, t1, { actionId: 'sword', type: ActionType.Attack });

      expect(result.hit).toBe(true);
      expect(result.damageTotal).toBe(6);
      expect(result.verdict).toBe('Hit');
    });

    it('should resolve a miss', () => {
        const p1 = createEntity('p1', 'Hero');
        const t1 = createEntity('t1', 'Orc');
  
        // Mock Roll: To Hit
        // Roll 2 -> Total 7. Miss AC 15.
        mockRoll.mockReturnValueOnce({ total: 7, rolls: [2] });
        
        const result = resolveAttack(p1, t1, { actionId: 'sword', type: ActionType.Attack });
  
        expect(result.hit).toBe(false);
        expect(result.damageTotal).toBe(0);
        expect(result.verdict).toBe('Miss');
      });

    it('should handle Advantage from Conditions (Prone vs Melee)', () => {
        const p1 = createEntity('p1', 'Hero');
        const t1 = createEntity('t1', 'Orc');
        
        // Target is Prone
        mockHasCondition.mockImplementation((e, c) => c === 'Prone');
        
        // Advantage means 2 rolls. Take Max.
        // Roll 1: 2 (Miss). Roll 2: 15 (Hit).
        mockRoll
            .mockReturnValueOnce({ total: 7, rolls: [2] }) // Roll 1
            .mockReturnValueOnce({ total: 20, rolls: [15] }); // Roll 2 (+5)
            
        mockRoll.mockReturnValueOnce({ total: 6, rolls: [4] }); // Damage

        const result = resolveAttack(p1, t1, { actionId: 'sword', type: ActionType.Attack });
        
        // Should trigger Advantage logic
        expect(result.hit).toBe(true);
        expect(result.trace.find(s => s.modifiers?.some(m => m.source === 'Advantage'))).toBeDefined();
    });

    it('should handle Feature Injection (Sneak Attack)', () => {
        const p1 = createEntity('p1', 'Rogue');
        p1.features = [{ name: 'Sneak Attack' }];
        
        const t1 = createEntity('t1', 'Orc');

        // Mock Registry: Sneak Attack Handler
        mockFeatureRegistry.get.mockReturnValue({
            canApply: () => true,
            applyDamageBonus: () => ({ amount: 10, type: 'precision', dice: '2d6' })
        });
        
        // Rolls:
        mockRoll.mockReturnValueOnce({ total: 20, rolls: [15] }); // Hit
        mockRoll.mockReturnValueOnce({ total: 5, rolls: [3] }); // Weapon Damage
        mockRoll.mockReturnValueOnce({ total: 7, rolls: [3,4] }); // Bonus Dice Roll (if dice provided)

        mockParseDiceString.mockReturnValue({ count: 2, sides: 6 });

        const result = resolveAttack(p1, t1, { actionId: 'sword', type: ActionType.Attack });
        
        expect(result.hit).toBe(true);
        // Damage: 5 (Weapon) + 17 (Bonus? No. logic says `rollTotal += res.total`).
        // logic: `let rollTotal = bonus.amount;` -> 10. `rollTotal += res.total` -> 10 + 7 = 17.
        // Total = 5 + 17 = 22.
        expect(result.damageTotal).toBe(22);
        expect(result.trace.some(t => t.description === 'Feature: Sneak Attack')).toBe(true);
    });
  });

  describe('resolveGrapple', () => {
      it('should rely on athletics rolls', () => {
        const p1 = createEntity('p1', 'Hero'); // Str 10 -> +0
        const t1 = createEntity('t1', 'Orc'); // Str 10 -> +0
        
        // mockRoll needs to support calls from within resolveGrapple which uses 'roll' helper?
        // Yes, resolveGrapple imports 'roll' from dice.
        // We mocked 'roll'.
        
        // Attacker Roll
        mockRoll.mockReturnValueOnce({ total: 15, rolls: [15] });
        // Target Roll
        mockRoll.mockReturnValueOnce({ total: 10, rolls: [10] });
        
        const result = resolveGrapple(p1, t1);
        expect(result.success).toBe(true);
        expect(result.verdict).toBe('Grappled!');
      });
  });
});
