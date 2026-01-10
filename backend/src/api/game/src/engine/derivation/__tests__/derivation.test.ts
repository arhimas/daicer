import { EntityDeriver } from '../index';
import { DerivationContext } from '../types';

describe('EntityDeriver', () => {
  const baseAttributes = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  it('calculates modifiers correctly', () => {
    expect(EntityDeriver.calculateModifier(10)).toBe(0);
    expect(EntityDeriver.calculateModifier(12)).toBe(1);
    expect(EntityDeriver.calculateModifier(9)).toBe(-1);
    expect(EntityDeriver.calculateModifier(20)).toBe(5);
  });

  it('derives unarmored defense correctly', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, dexterity: 14 }, // +2
      level: 1,
      proficiencyBonus: 2,
      equipment: [],
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    expect(derived.ac).toBe(12);
  });

  it('derives armor class with light armor', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, dexterity: 14 }, // +2
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Leather Armor',
          equipment_category: { slug: 'light-armor' },
          armor_class_base: 11,
          armor_class_dex_bonus: true,
        },
      ],
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    expect(derived.ac).toBe(13); // 11 + 2
  });

  it('should calculate Proficiency Bonus based on total level (Multiclass)', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes },
      classes: [
        { name: 'Fighter', level: 3 },
        { name: 'Rogue', level: 2 },
      ], // Total 5
      equipment: [],
    };

    const derived = EntityDeriver.derive(context);
    expect(derived.level).toBe(5);
    expect(derived.proficiencyBonus).toBe(3); // Level 5-8 is +3
  });

  it('should derive weapon actions from equipment', () => {
    const context: DerivationContext = {
      attributes: {
        strength: 16,
        dexterity: 12,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10, // STR +3, DEX +1
      },
      level: 1, // PB +2
      equipment: [
        {
          name: 'Longsword',
          equipment_category: { slug: 'weapon' },
          damage_dice: '1d8',
          damage_type: { name: 'slashing' },
          isEquipped: true, // Updated from equipped
        },
      ],
    };

    const derived = EntityDeriver.derive(context);
    const sword = derived.structuredActions.find((a: Record<string, unknown>) => a.name === 'Longsword');

    expect(sword).toBeDefined();
    expect(sword.attack?.type).toBe('melee_weapon');
    expect(sword.attack?.bonus).toBe(3 + 2); // STR +3, PB +2 = +5
    expect(sword.effects?.[0].flat).toBe(3); // STR +3
  });

  it('should merge innate actions with weapon actions (Hybrid)', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes },
      level: 1,
      equipment: [
        {
          name: 'Dagger',
          equipment_category: { slug: 'weapon' },
          damage_dice: '1d4',
          damage_type: { name: 'piercing' },
          properties: [{ name: 'Finesse', slug: 'finesse' }],
          isEquipped: true, // Updated from equipped
        },
      ],
      innateActions: [{ name: 'Fire Breath', type: 'actions', description: 'Roarrr' }],
    };

    const derived = EntityDeriver.derive(context);
    expect(derived.structuredActions).toHaveLength(2);
    expect(derived.structuredActions.some((a: Record<string, unknown>) => a.name === 'Dagger')).toBe(true);
    expect(derived.structuredActions.some((a: Record<string, unknown>) => a.name === 'Fire Breath')).toBe(true);
  });

  it('derives armor class with medium armor (capped)', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, dexterity: 16 }, // +3
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Scale Mail',
          equipment_category: { slug: 'medium-armor' },
          armor_class_base: 14,
          armor_class_dex_bonus: true,
        },
      ],
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    expect(derived.ac).toBe(16); // 14 + 2 (capped)
  });

  it('derives hp correctly at level 1', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, constitution: 14 }, // +2
      level: 1,
      proficiencyBonus: 2,
      equipment: [],
      hitDie: 10,
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    expect(derived.hp).toBe(12); // 10 + 2
  });

  it('derives hp correctly at higher levels', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, constitution: 14 }, // +2
      level: 3,
      proficiencyBonus: 2,
      equipment: [],
      hitDie: 10, // avg 6
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    // L1: 10 + 2 = 12
    // L2: 6 + 2 = 8
    // L3: 6 + 2 = 8
    // Total: 28
    expect(derived.hp).toBe(28);
  });

  it('calculates speed with penalties', () => {
    const context: DerivationContext = {
      attributes: { ...baseAttributes, strength: 8 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Chain Mail',
          equipment_category: { slug: 'heavy-armor' },
          str_minimum: 13,
        },
      ],
      race: { speed: 30 },
    };
    const derived = EntityDeriver.derive(context);
    expect(derived.speed.walk).toBe(20); // 30 - 10 penalty
  });
});
