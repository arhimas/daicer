import { describe, it, expect } from 'vitest';
import { ActionHydrator, SerializedItem, SerializedSpell } from '@daicer/engine/derivation/ActionHydrator';
import { DerivationContext } from '@daicer/engine/derivation/types';

// Mock Attributes Helper
const createMockContext = (overrides: Partial<DerivationContext> = {}): DerivationContext => ({
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  proficiencyBonus: 2,
  level: 1,
  equipment: [], // Fix: Added missing required property
  ...overrides,
});

describe('ActionHydrator', () => {
  describe('hydrateFromEquipment', () => {
    it('should return empty array if item is not a weapon', () => {
      const item: SerializedItem = { name: 'Potion', type: 'consumable' };
      const context = createMockContext();
      const actions = ActionHydrator.hydrateFromEquipment(item, context);
      expect(actions).toEqual([]);
    });

    it('should hydrate a simple melee weapon (Strength based)', () => {
      const item: SerializedItem = {
        documentId: 'sword1',
        name: 'Longsword',
        damage_dice: '1d8',
        damage_type: { name: 'Slashing' },
        equipment_category: { slug: 'martial-weapon' },
      };
      const context = createMockContext({
        attributes: { strength: 14, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      }); // Mod +2
      const actions = ActionHydrator.hydrateFromEquipment(item, context);

      expect(actions).toHaveLength(1);
      const action = actions[0];
      expect(action.name).toBe('Longsword');
      expect(action.attack?.bonus).toBe(4); // 2 (Mod) + 2 (Prof)
      expect(action.effects?.[0].flat).toBe(2);
      expect(action.range?.type).toBe('melee');
    });

    it('should hydrate a finesse weapon using Dex if higher', () => {
      const item: SerializedItem = {
        name: 'Dagger',
        damage_dice: '1d4',
        properties: [{ slug: 'finesse' }],
      };
      // Str 10 (+0), Dex 16 (+3)
      const context = createMockContext({
        attributes: { strength: 10, dexterity: 16, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      });
      const actions = ActionHydrator.hydrateFromEquipment(item, context);

      expect(actions[0].attack?.bonus).toBe(5); // 3 (Dex) + 2 (Prof)
      expect(actions[0].effects?.[0].paramAttribute).toBe('dex');
    });

    it('should hydrate a ranged weapon (Dex based)', () => {
      const item: SerializedItem = {
        name: 'Longbow',
        damage_dice: '1d8',
        range_normal: 150,
      };
      const context = createMockContext({
        attributes: { strength: 10, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      });
      const actions = ActionHydrator.hydrateFromEquipment(item, context);

      expect(actions[0].range?.type).toBe('ranged');
      expect(actions[0].attack?.type).toBe('ranged_weapon');
      expect(actions[0].effects?.[0].paramAttribute).toBe('dex');
    });

    it('should handle versatile weapons (return 2 actions)', () => {
      const item: SerializedItem = {
        documentId: 'warhammer1',
        name: 'Warhammer',
        damage_dice: '1d8',
        versatile_damage: '1d10',
        equipment_category: { slug: 'martial-weapon' },
      };
      const context = createMockContext();
      const actions = ActionHydrator.hydrateFromEquipment(item, context);

      expect(actions).toHaveLength(2);
      expect(actions[0].name).toBe('Warhammer');
      expect(actions[1].name).toBe('Warhammer (Two-Handed)');
      expect(actions[1].effects?.[0].dice).toBe('1d10');
    });
  });

  describe('hydrateFromSpell', () => {
    it('should hydrate a generic attack spell', () => {
      const spell: SerializedSpell = {
        name: 'Firebolt',
        level: 0,
        mechanics_config: { action_type: 'Ranged Spell Attack' },
        damage_instances: [{ effect_type: 'Damage', damage_type: 'Fire', dice_count: 1, dice_value: 10 }],
      };
      const context = createMockContext({
        spellcastingAbility: 'intelligence',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 16, wisdom: 10, charisma: 10 },
      }); // Int +3

      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.attack?.type).toBe('ranged_spell');
      expect(action.attack?.bonus).toBe(5); // 3 (Int) + 2 (Prof)
      expect(action.effects?.[0].dice).toBe('1d10');
      expect(action.effects?.[0].type).toBe('damage');
    });

    it('should hydrate a save-based spell', () => {
      const spell: SerializedSpell = {
        name: 'Fireball',
        level: 3,
        mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
        damage_instances: [{ effect_type: 'Damage', damage_type: 'Fire', dice_count: 8, dice_value: 6 }],
      };
      const context = createMockContext({
        spellcastingAbility: 'intelligence',
        attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 14, wisdom: 10, charisma: 10 },
      }); // Int +2

      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.save).toBeDefined();
      expect(action.save?.attribute).toBe('dex');
      expect(action.save?.dc).toBe(12); // 8 + 2 (Mod) + 2 (Prof)
      expect(action.save?.effect).toBe('half');
    });

    it('should handle healing spells', () => {
      const spell: SerializedSpell = {
        name: 'Cure Wounds',
        level: 1,
        mechanics_config: { action_type: 'Heal' }, // checking fallback logic mostly
        damage_instances: [
          { effect_type: 'Healing', damage_type: 'Healing', dice_count: 1, dice_value: 8, flat_bonus: 3 },
        ],
      };
      const context = createMockContext();
      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.effects?.[0].type).toBe('healing');
      expect(action.effects?.[0].flat).toBe(3);
    });

    it('should apply conditions', () => {
      const spell: SerializedSpell = {
        name: 'Hold Person',
        level: 2,
        condition_instances: [{ condition: 'Paralyzed', duration_rounds: 10 }],
      };
      const context = createMockContext();
      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.effects).toHaveLength(1);
      expect(action.effects?.[0].type).toBe('apply_condition');
      expect(action.effects?.[0].subtype).toBe('Paralyzed');
    });

    it('should handle casting time and range configs', () => {
      const spell: SerializedSpell = {
        name: 'Misty Step',
        level: 2,
        casting_config: { time_unit: 'Bonus Action' },
        range_config: { type: 'Self' },
      };
      const context = createMockContext();
      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.cost?.actionType).toBe('bonus');
      expect(action.range?.type).toBe('self');
    });

    it('should handle AoE shapes', () => {
      const spell: SerializedSpell = {
        name: 'Cone of Cold',
        level: 5,
        range_config: { type: 'Self', aoe_shape: 'Cone', aoe_size: 60 },
      };
      const context = createMockContext();
      const action = ActionHydrator.hydrateFromSpell(spell, context);

      expect(action.aoe?.shape).toBe('cone');
      expect(action.aoe?.size).toBe(60);
    });
  });
});
