
import { ActionHydrator, SerializedItem, SerializedSpell } from '../ActionHydrator';
import { DerivationContext } from '../types';

describe('ActionHydrator', () => {

  const mockContext: DerivationContext = {
    stats: {
      strength: 16, // +3
      dexterity: 14, // +2
      constitution: 14,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      passivePerception: 10,
      initiativeBonus: 0
    },
    attributes: { // Redundant but testing fallback
       strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 10, charisma: 10
    },
    proficiencyBonus: 2,
    level: 1,
    spellcastingAbility: 'intelligence',
    equipment: []
  };

  describe('hydrateFromEquipment', () => {
    it('should return empty actions for non-weapons', () => {
        const item: SerializedItem = { name: 'Potion', type: 'consumable' };
        const result = ActionHydrator.hydrateFromEquipment(item, mockContext);
        expect(result).toHaveLength(0);
    });

    it('should hydrate a simple melee weapon', () => {
        const item: SerializedItem = { 
            name: 'Longsword', 
            type: 'weapon', 
            damage_dice: '1d8', 
            damage_type: { name: 'Slashing' },
            equipment_category: { slug: 'martial-weapon' }
        };
        const result = ActionHydrator.hydrateFromEquipment(item, mockContext);
        expect(result).toHaveLength(1); // No versatile property set on input item
        
        const action = result[0];
        expect(action.name).toBe('Longsword');
        expect(action.attack?.bonus).toBe(5); // +3 STR +2 PROF
        expect(action.effects?.[0].flat).toBe(3); // +3 STR
    });

    it('should handle finesse weapons using DEX if better', () => {
        const dexContext = { ...mockContext, attributes: { ...mockContext.attributes, dexterity: 18, strength: 10 } }; 
        // DEX 18 (+4), STR 10 (+0)
        
        const item: SerializedItem = { 
            name: 'Dagger', 
            damage_dice: '1d4', 
            properties: [{ slug: 'finesse' }] 
        };
        
        const result = ActionHydrator.hydrateFromEquipment(item, dexContext);
        expect(result[0].attack?.bonus).toBe(6); // +4 DEX +2 PROF
        expect(result[0].effects?.[0].flat).toBe(4);
    });

    it('should generate versatile action if present', () => {
        const item: SerializedItem = { 
            name: 'Longsword', 
            damage_dice: '1d8', 
            versatile_damage: '1d10',
            equipment_category: { slug: 'weapon' }
        };
        const result = ActionHydrator.hydrateFromEquipment(item, mockContext);
        expect(result).toHaveLength(2);
        expect(result[1].name).toContain('Two-Handed');
        expect(result[1].effects?.[0].dice).toBe('1d10');
    });
  });

  describe('hydrateFromSpell', () => {
      it('should hydrate a basic attack spell', () => {
          const spell: SerializedSpell = {
              name: 'Fire Bolt',
              level: 0,
              mechanics_config: { action_type: 'Ranged Spell Attack' },
              range_config: { type: 'Ranged', distance: 120 },
              damage_instances: [{ effect_type: 'Damage', damage_type: 'Fire', dice_count: 1, dice_value: 10 }]
          };
          
          const result = ActionHydrator.hydrateFromSpell(spell, mockContext); // INT 10 (+0) -> Attack +2
          expect(result.attack?.bonus).toBe(2);
          expect(result.range.type).toBe('ranged');
          expect(result.effects![0].subtype).toBe('Fire');
      });

      it('should hydrate a save spell', () => {
        const spell: SerializedSpell = {
            name: 'Fireball',
            level: 3,
            mechanics_config: { action_type: 'Dexterity Save', save_effect: 'Half' },
            damage_instances: [{ effect_type: 'Damage', damage_type: 'Fire', dice_count: 8, dice_value: 6 }]
        };
        
        const result = ActionHydrator.hydrateFromSpell(spell, mockContext); // INT 10 (+0) -> DC 8+0+2=10
        expect(result.save?.attribute).toBe('dex');
        expect(result.save?.dc).toBe(10);
        expect(result.save?.effect).toBe('half');
    });
  });
});
