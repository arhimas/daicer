import { describe, it, expect } from 'vitest';
import { ActionHydrator, SerializedItem, SerializedSpell } from '@daicer/engine/derivation/ActionHydrator';
import { DerivationContext } from '@daicer/engine/derivation/types';

const mockContext: DerivationContext = {
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  proficiencyBonus: 2,
  spellcastingAbility: 'intelligence',
};

describe('ActionHydrator - Branch Maximization', () => {
  // 1. Versatile Damage Branch
  it('should hydrate versatile weapon into two actions', () => {
    const item: SerializedItem = {
      name: 'Longsword',
      damage_dice: '1d8',
      damage_type: { name: 'Slashing' },
      versatile_damage: '1d10',
      equipment_category: { slug: 'weapon' },
    };

    const actions = ActionHydrator.hydrateFromEquipment(item, mockContext);

    expect(actions).toHaveLength(2);
    expect(actions[0].name).toBe('Longsword');
    expect(actions[1].name).toBe('Longsword (Two-Handed)');
    expect(actions[1].effects[0].dice).toBe('1d10');
  });

  // 2. Spell Action Types (Bonus, Reaction, Default)
  it.each([
    ['bonus action', 'bonus'],
    ['reaction', 'reaction'],
    ['minute', 'action'], // Default fallback
  ])('should map casting time "%s" to action type "%s"', (timeUnit, expectedType) => {
    const spell: SerializedSpell = {
      name: 'Test Spell',
      level: 1,
      casting_config: { time_unit: timeUnit },
    };
    const action = ActionHydrator.hydrateFromSpell(spell, mockContext);
    expect(action.cost.actionType).toBe(expectedType);
  });

  // 3. Range Types (Touch, Self, Ranged)
  it.each([
    ['Touch', 'touch'],
    ['Self', 'self'],
    ['Ranged (60ft)', 'ranged'],
  ])('should map range type "%s" to "%s"', (rangeType, expectedRange) => {
    const spell: SerializedSpell = {
      name: 'Range Spell',
      range_config: { type: rangeType, distance: 60 },
    };
    const action = ActionHydrator.hydrateFromSpell(spell, mockContext);
    expect(action.range.type).toBe(expectedRange);
  });

  // 4. AoE Shapes
  it('should map AoE configuration', () => {
    const spell: SerializedSpell = {
      name: 'Fireball',
      range_config: { aoe_shape: 'Sphere', aoe_size: 20 },
    };
    const action = ActionHydrator.hydrateFromSpell(spell, mockContext);
    expect(action.aoe).toEqual({
      shape: 'sphere',
      size: 20,
      height: undefined,
    });
  });

  // 5. Save Logic & Attributes
  it('should map Save DC and Attribute correctly', () => {
    const spell: SerializedSpell = {
      name: 'Fireball',
      mechanics_config: {
        action_type: 'Dexterity Save',
        save_effect: 'Half',
      },
    };
    const action = ActionHydrator.hydrateFromSpell(spell, mockContext);
    expect(action.save).toEqual({
      attribute: 'dex',
      dc: 10, // 8 + 0 (mod) + 2 (prof)
      effect: 'half',
    });
  });

  // 6. Condition Instances
  it('should map condition effects', () => {
    const spell: SerializedSpell = {
      name: 'Hold Person',
      condition_instances: [{ condition: 'Paralyzed', duration_rounds: 10, chance: 100 }],
    };
    const action = ActionHydrator.hydrateFromSpell(spell, mockContext);
    const effect = action.effects.find((e) => e.type === 'apply_condition');
    expect(effect).toBeDefined();
    expect(effect?.subtype).toBe('Paralyzed');
  });

  // 7. Non-Weapon Equipment Fallback
  it('should return empty array for non-weapon equipment', () => {
    const item: SerializedItem = {
      name: 'Backpack',
      equipment_category: { slug: 'adventuring-gear' },
    };
    const actions = ActionHydrator.hydrateFromEquipment(item, mockContext);
    expect(actions).toHaveLength(0);
  });

  // 8. Finesse Logic (Str vs Dex)
  it('should use Dex for Finesse weapons if Dex > Str', () => {
    const dexContext: DerivationContext = {
      ...mockContext,
      attributes: { ...mockContext.attributes!, dexterity: 18, strength: 10 }, // Dex +4, Str +0
    };
    const item: SerializedItem = {
      name: 'Dagger',
      damage_dice: '1d4',
      properties: [{ slug: 'finesse' }],
    };

    const actions = ActionHydrator.hydrateFromEquipment(item, dexContext);
    expect(actions[0].attack.bonus).toBe(6); // 4 (Dex) + 2 (Prof)
    expect(actions[0].effects[0].paramAttribute).toBe('dex');
  });
});
