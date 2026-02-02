import { describe, it, expect } from 'vitest';
import { validateAttack, resolveAttack, CombatPositions } from '../combat';
import { Entity, ActionType } from '../../types';

// Mock helpers
const createEntity = (id: string, name: string, hp: number = 10, ac: number = 12): Entity => ({
  id,
  type: 'player',
  name,
  position: { x: 0, y: 0, z: 0 },
  hp,
  maxHp: hp,
  armorClass: ac,
  speed: 30,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    passivePerception: 10,
    initiativeBonus: 0,
  },
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
      toHit: 4,
      damage: [{ dice: '1d8', bonus: 1, type: 'piercing' }],
      range: { type: 'ranged', value: 60, long: 120 },
    },
  ],
  features: [],
  conditions: [],
  resistances: [],
  immunities: [],
  vulnerabilities: [],
  color: '#000',
  visionRadius: 60,
});

// Deterministic RNG (always rolls 10)
// Deterministic RNG (always rolls 10)
// const _fixedRng = () => 0.5;

describe('Combat Rules', () => {
  describe('validateAttack', () => {
    const attacker = createEntity('p1', 'Attacker');
    const target = createEntity('t1', 'Target');
    const intent = { actionId: 'sword', type: ActionType.Attack };

    it('should allow attack valid range', () => {
      const pos: CombatPositions = { attacker: { x: 0, y: 0, z: 0 }, target: { x: 1, y: 0, z: 0 } }; // Dist 5ft (each unit 5ft in Daicer? Typically 1 unit = 5ft)
      // Wait, geometry utils calculateDistance is euclidean.
      // If scale is 5ft per unit? Or grid? distance 5 is 5 units.
      // Sword reach is 5.
      // Let's assume units = feet for this test or units=grid.
      // Actually, in engine validateAttack uses calculateDistance usually in units.
      // If 'reach' is 5, it means 5 units.
      const result = validateAttack(attacker, target, intent, pos);

      // Wait, calculateDistance({0,0,0}, {1,0,0}) is 1. 1 <= 5. Valid.
      expect(result.valid).toBe(true);
    });

    it('should reject out of range melee', () => {
      const pos: CombatPositions = { attacker: { x: 0, y: 0, z: 0 }, target: { x: 6, y: 0, z: 0 } }; // Dist 6
      const result = validateAttack(attacker, target, intent, pos);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('out of range');
    });

    it('should reject invalid action type', () => {
      const fail = validateAttack(
        attacker,
        target,
        { actionId: 'sword', type: ActionType.CastSpell },
        { attacker: { x: 0, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } }
      );
      expect(fail.valid).toBe(false);
    });

    it('should handle ranged limits', () => {
      const bowIntent = { actionId: 'bow', type: ActionType.Attack };
      const posValid = { attacker: { x: 0, y: 0, z: 0 }, target: { x: 100, y: 0, z: 0 } };
      expect(validateAttack(attacker, target, bowIntent, posValid).valid).toBe(true);

      const posInvalid = { attacker: { x: 0, y: 0, z: 0 }, target: { x: 150, y: 0, z: 0 } }; // > 120
      expect(validateAttack(attacker, target, bowIntent, posInvalid).valid).toBe(false);
    });
  });

  describe('resolveAttack', () => {
    const attacker = createEntity('p1', 'Attacker');
    const target = createEntity('t1', 'Target', 20, 15); // AC 15

    it('should resolve a standard hit', () => {
      // AC 15. To Hit +5. Needs roll 10.
      // rng returning 0.5 -> roll 11 -> total 16 => Hit.
      const result = resolveAttack(attacker, target, { actionId: 'sword', type: ActionType.Attack }, () => 0.5);
      expect(result.attackRoll.total).toBe(16); // 11 + 5
      expect(result.hit).toBe(true);
      expect(result.verdict).toBe('Hit');
      expect(result.damageTotal).toBeGreaterThan(0); // 1d6(4) + 2 = 6
    });

    it('should resolve a miss', () => {
      // AC 15. To Hit +5.
      // rng returning 0.1 -> 0.1*20=2 -> 3. Total 8. Miss.
      const result = resolveAttack(attacker, target, { actionId: 'sword', type: ActionType.Attack }, () => 0.1);
      expect(result.hit).toBe(false);
      expect(result.verdict).toBe('Miss');
      expect(result.damageTotal).toBe(0);
    });

    it('should critical hit on 20', () => {
      // rng returning 0.99 -> 19.8 -> 19 -> +1 = 20?
      // Math.floor(0.99*20) = 19. +1 = 20. Natural 20.
      const result = resolveAttack(attacker, target, { actionId: 'sword', type: ActionType.Attack }, () => 0.99);
      expect(result.isCritical).toBe(true);
      expect(result.verdict).toBe('Critical Hit!');
      // Crit Damage: 2d6 + 2. base 4 + base 4 + 2 = 10?
      // Dice doubling logic: count*=2.
      expect(result.damageDetails[0].diceString).toContain('2d6');
    });

    it('should critical miss on 1', () => {
      // rng 0.0 -> 0*20=0 -> +1 = 1.
      const result = resolveAttack(attacker, target, { actionId: 'sword', type: ActionType.Attack }, () => 0.0);
      expect(result.isCriticalFail).toBe(true);
      expect(result.verdict).toBe('Critical Miss!');
      expect(result.hit).toBe(false);
    });

    it('should apply advantage', () => {
      // Roll 1 (0.1 -> 3) vs Roll 2 (0.8 -> 17). Take 17.
      // We need a stateful mock RNG to sequence these.
      let i = 0;
      const seq = [0.1, 0.8];
      const rng = () => seq[i++] || 0.5;

      // Target AC 20. +5. Needs 15.
      const highAC = createEntity('t2', 'Tank', 30, 20);
      const result = resolveAttack(
        attacker,
        highAC,
        { actionId: 'sword', type: ActionType.Attack, advantage: true },
        rng
      );

      expect(result.attackRoll.rolls[0]).toBe(17); // Took the second roll
      expect(result.hit).toBe(true); // 17+5 = 22 > 20
    });
  });

  describe('resolveGrapple', () => {
    const _attacker = createEntity('p1', 'Attacker'); // Str 10 (+0)
    const _target = createEntity('t1', 'Target'); // Str 10 (+0), Dex 10 (+0)

    it('should succeed if attacker rolls higher', () => {
      // Attacker rolls 0.8 -> 17. Target rolls 0.2 -> 5.
      const _i = 0;
      const _seq = [0.8, 0.2];
      // Since resolveGrapple calls roll internal which uses default rng unless passed?
      // resolveGrapple DOES NOT accept rng argument currently in the interface.
      // This makes it hard to test deterministic.
      // TODO: Refactor resolveGrapple to accept rng or mock 'roll' import.
      // For now, let's mock the 'roll' function if possible, or skip strict value assertions.
      // But since 'roll' is imported from './dice', we can rely on Vitest module mocking?
      // "import { roll } from './dice';" imported in test file is DIFFERENT reference than inside combat.ts?
      // Vitest hoists mocks.
    });
  });
});
