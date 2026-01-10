import { describe, it, expect } from 'vitest';
import { resolveActions, StrapiEntitySheet, StrapiAction } from '../entity-adapter';

describe('Action Computation Logic', () => {
  const baseStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    passivePerception: 10,
    initiativeBonus: 0,
  };

  const mockSheet = (actions: StrapiAction[]): StrapiEntitySheet => ({
    documentId: 'doc_1',
    name: 'Test',
    type: 'monster',
    actions,
  });

  describe('Field Preservation', () => {
    it('preserves complex damage objects', () => {
      const complexDamage = [
        { dice: '2d6', type: 'fire', bonus: 2 },
        { dice: '1d4', type: 'radiant', bonus: 0 },
      ];
      const sheet: any = {
        actions: [
          {
            documentId: 'a1',
            name: 'Fire Strike',
            damage_instances: [
              { dice_count: 2, dice_value: 6, damage_type: 'fire', flat_bonus: 2, effect_type: 'Damage' },
              { dice_count: 1, dice_value: 4, damage_type: 'radiant', flat_bonus: 0, effect_type: 'Damage' },
            ],
          },
        ],
      };

      const res = resolveActions(mockSheet(sheet.actions), baseStats);
      expect(res[0].damage).toEqual(complexDamage);
    });

    it('preserves save configuration', () => {
      const save = { stat: 'dexterity', dc: 15, onSave: 'half' };
      const sheet: any = {
        actions: [
          {
            documentId: 'a2',
            name: 'Trap',
            save: { stat: 'dexterity', dc: 15, success_type: 'half' },
          },
        ],
      };

      const res = resolveActions(mockSheet(sheet.actions), baseStats);
      expect(res[0].save).toEqual(save);
    });
  });

  describe('Unarmed Logic Scaling', () => {
    // 50 Tests for Unarmed scaling
    for (let i = 0; i < 50; i++) {
      const str = i; // 0 to 49
      const mod = Math.floor((str - 10) / 2);
      it(`calculates unarmed for Strength ${str} (Mod ${mod})`, () => {
        const stats = { ...baseStats, strength: str };
        const res = resolveActions(mockSheet([]), stats);
        // Default 2 prof + mod
        expect(res[0].toHit).toBe(2 + mod);
        expect(res[0].damage?.[0].bonus).toBe(mod);
      });
    }
  });
});
