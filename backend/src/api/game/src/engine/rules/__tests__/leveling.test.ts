import { resolveLevelUp, getLevelFromXP } from '../leveling';
import { EntitySheet } from '../../types';
import { RuleSet, ClassDefinition } from '../../types/rules';

describe('Leveling Logic', () => {
  const mockRules: RuleSet = {
    xp_table: [0, 300, 900, 2700, 6500],
    proficiency_table: { '1': 2, '2': 2, '3': 2, '4': 2, '5': 3 },
    full_caster_slots: {
      '1': [2],
      '2': [3],
      '3': [4, 2],
    },
  };

  const mockBarbarian: ClassDefinition = {
    name: 'Barbarian',
    hit_die: '1d12',
    progression: [
      { level: 1, features: [] },
      { level: 2, features: [] },
    ],
  };

  const mockWizard: ClassDefinition = {
    name: 'Wizard',
    hit_die: '1d6',
    progression: [
      { level: 1, features: [], spell_slots: [2] },
      { level: 2, features: [], spell_slots: [3] },
      { level: 3, features: [], spell_slots: [4, 2] },
    ],
  };

  test('getLevelFromXP returns correct level', () => {
    expect(getLevelFromXP(0, mockRules)).toBe(1);
    expect(getLevelFromXP(300, mockRules)).toBe(2);
    expect(getLevelFromXP(899, mockRules)).toBe(2);
    expect(getLevelFromXP(900, mockRules)).toBe(3);
  });

  test('resolveLevelUp increments level and HP correctly for Barbarian', () => {
    const sheet: EntitySheet = {
      level: 1,
      maxHp: 14, // 12 + 2 CON
      hp: 14,
      attributes: { Constitution: 14, Strength: 10, Dexterity: 10, Wisdom: 10, Intelligence: 10, Charisma: 10 } as any,
      hitDice: { total: 1, current: 1, die: '1d12' },
      proficiencyBonus: 2,
      xp: 300,
      characterClass: 'Barbarian',
    } as any;

    const newSheet = resolveLevelUp(sheet, mockBarbarian, mockRules);

    expect(newSheet.level).toBe(2);
    // 1d12 avg is 7. CON mod is +2. Gain = 9.
    // Init HP 14. New HP = 23.
    expect(newSheet.maxHp).toBe(23);
    expect(newSheet.hitDice.total).toBe(2);
  });

  test('resolveLevelUp updates spell slots for Wizard', () => {
    const sheet: EntitySheet = {
      level: 1,
      maxHp: 8,
      hp: 8,
      attributes: { Constitution: 14 } as any,
      hitDice: { total: 1, current: 1, die: '1d6' },
      proficiencyBonus: 2,
      experiencePoints: 300,
      characterClass: 'Wizard',
      spellbook: { slots: [{ level: 1, max: 2, current: 0 }] }, // 0/2 slots
    } as any;

    // Simulate leveling to 3 (Double Jump? No, logic is newLevel = current + 1)
    // Let's just go 1->2. Expects [3].
    const level2Sheet = resolveLevelUp(sheet, mockWizard, mockRules);

    expect(level2Sheet.level).toBe(2);
    expect(level2Sheet.spellbook?.slots).toHaveLength(1);
    const l1Slot = level2Sheet.spellbook?.slots[0];
    expect(l1Slot?.max).toBe(3);
    // Existing was 0/2. Gain 1 (3-2). Result 1/3?
    // Logic: current = existing.current + (total - existing.max) --> 0 + (3 - 2) = 1.
    expect(l1Slot?.current).toBe(1);
  });
});
