import { describe, it, expect } from 'vitest';
import { ActionHydrator } from '../ActionHydrator';
import { DerivationContext } from '../types';

describe('ActionHydrator', () => {
  const mockContext = {
    attributes: { strength: 10, dexterity: 12, constitution: 10, intelligence: 14, wisdom: 10, charisma: 10 },
    stats: { strength: 10 },
    proficiencyBonus: 2,
    spellcastingAbility: 'intelligence'
  } as unknown as DerivationContext;

  describe('hydrateFromEquipment', () => {
    it('should hydrate a simple melee weapon', () => {
      const item = {
        id: '1',
        name: 'Dagger',
        damage_dice: '1d4',
        range_normal: 5,
        properties: [{ slug: 'finesse' }]
      };

      const actions = ActionHydrator.hydrateFromEquipment(item, mockContext);
      
      expect(actions).toHaveLength(1);
      const action = actions[0];
      expect(action.name).toBe('Dagger');
      expect(action.attack?.type).toBe('melee_weapon');
      // Dex 12 (+1) > Str 10 (+0), Finesse -> Dex used
      expect(action.attack?.bonus).toBe(3); // 1 (mod) + 2 (prof)
      expect(action.effects?.[0].flat).toBe(1); // Mod only
    });

    it('should ignore non-weapons', () => {
      const item = { name: 'Chair', type: 'furniture' };
      const actions = ActionHydrator.hydrateFromEquipment(item, mockContext);
      expect(actions).toHaveLength(0);
    });

    it('should handle versatile weapons', () => {
      const item = {
        id: '2',
        name: 'Longsword',
        damage_dice: '1d8',
        versatile_damage: '1d10',
        equipment_category: { slug: 'martial-weapon' } // triggers isWeapon
      };

      const actions = ActionHydrator.hydrateFromEquipment(item, mockContext);
      
      expect(actions).toHaveLength(2);
      expect(actions[0].id).toContain('weapon_2'); // One hand
      expect(actions[1].id).toContain('versatile'); // Two hand
      expect(actions[1].effects?.[0].dice).toBe('1d10');
    });
  });

  describe('hydrateFromSpell', () => {
    it('should hydrate a damage spell (Fireball)', () => {
      const spell = {
        id: 'sp1',
        name: 'Fireball',
        level: 3,
        damage_instances: [
          { effect_type: 'Damage', damage_type: 'fire', dice_count: 8, dice_value: 6 }
        ],
        range_config: { type: 'ranged', distance: 150, aoe_shape: 'sphere', aoe_size: 20 },
        mechanics_config: { action_type: 'Dexterity Save', save_effect: 'Half' }
      };

      const action = ActionHydrator.hydrateFromSpell(spell, mockContext);

      expect(action.name).toBe('Fireball');
      expect(action.cost?.amount).toBe(3); // Level 3 slot
      expect(action.save?.attribute).toBe('dex');
      expect(action.save?.dc).toBe(12); // 8 + 2 (prof) + 2 (Int mod)
      expect(action.aoe?.shape).toBe('sphere');
      expect(action.effects?.[0].dice).toBe('8d6');
    });

    it('should hydrate a ranged attack spell (Fire Bolt)', () => {
      const spell = {
        name: 'Fire Bolt',
        level: 0,
        mechanics_config: { action_type: 'Ranged Spell Attack' },
        range_config: { type: 'ranged', distance: 120 },
        damage_instances: [{ damage_type: 'fire', dice_count: 1, dice_value: 10 }]
      };

      const action = ActionHydrator.hydrateFromSpell(spell, mockContext);

      expect(action.attack?.type).toBe('ranged_spell');
      expect(action.attack?.bonus).toBe(4); // 2 (prof) + 2 (Int mod)
    });
  });
});
