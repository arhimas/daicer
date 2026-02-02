import { describe, it, expect } from 'vitest';
import { validateSpellCast, resolveSpell } from '../magic';
import { ActionType } from '../../types';

// Mock types since Magic module depends on EntitySheetSchema which is Zod.
// We construct a valid object matching the interface
const createCaster = (slotsCur = 2, slotsMax = 2): any => ({
  name: 'Wizard',
  spellbook: {
    slots: [{ level: 1, current: slotsCur, max: slotsMax }],
    knownSpells: ['magic_missile'],
    spellSaveDc: 14,
    concentratingOn: null,
  },
  structuredActions: [
    {
      id: 'magic_missile',
      name: 'Magic Missile',
      sourceType: 'spell',
      level: 1,
      range: { type: 'ranged', value: 120 },
    },
    {
      id: 'burning_hands',
      name: 'Burning Hands',
      sourceType: 'spell',
      level: 1,
      range: { type: 'self', value: 15 },
      aoe: { shape: 'cone', size: 15 }, // Inferred size from name
    },
    {
      id: 'cantrip',
      name: 'Firebolt',
      sourceType: 'spell',
      level: 0,
      range: { type: 'ranged', value: 120 },
    },
  ],
});

describe('Magic Rules', () => {
  describe('validateSpellCast', () => {
    it('should validate valid cast', () => {
      const caster = createCaster(2);
      const intent = { actionId: 'magic_missile', type: ActionType.CastSpell };
      const res = validateSpellCast(caster, intent, { x: 0, y: 0, z: 0 });
      expect(res.valid).toBe(true);
      expect(res.slotLevel).toBe(1);
    });

    it('should fail if no slots', () => {
      const caster = createCaster(0);
      const intent = { actionId: 'magic_missile', type: ActionType.CastSpell };
      const res = validateSpellCast(caster, intent, { x: 0, y: 0, z: 0 });
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('No Level 1');
    });

    it('should allow cantrips without slots', () => {
      const caster = createCaster(0);
      const intent = { actionId: 'cantrip', type: ActionType.CastSpell };
      const res = validateSpellCast(caster, intent, { x: 0, y: 0, z: 0 });
      expect(res.valid).toBe(true);
    });

    it('should check range', () => {
      const caster = createCaster(2);
      const intent = { actionId: 'magic_missile', type: ActionType.CastSpell };

      // Valid Range (120)
      const res1 = validateSpellCast(caster, intent, { x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 });
      expect(res1.valid).toBe(true);

      // Invalid Range
      const res2 = validateSpellCast(caster, intent, { x: 0, y: 0, z: 0 }, { x: 130, y: 0, z: 0 });
      expect(res2.valid).toBe(false);
    });
  });

  describe('resolveSpell', () => {
    it('should consume slot for leveled spell', () => {
      const caster = createCaster(2);
      const intent = { actionId: 'magic_missile', type: ActionType.CastSpell };

      const result = resolveSpell(caster, intent);
      expect(result.slotConsumed).toBe(1);
      expect(caster.spellbook.slots[0].current).toBe(1); // Modifies input state? Or return change?
      // Implementation modifies state: "slot.current--".
      // This implies side effect on the passed object.
    });

    it('should not consume slot for cantrip', () => {
      const caster = createCaster(0);
      const intent = { actionId: 'cantrip', type: ActionType.CastSpell };
      const result = resolveSpell(caster, intent);
      expect(result.slotConsumed).toBe(0);
    });

    it('should handle concentration', () => {
      // Mock a concentration spell action
      const caster = createCaster(1);
      caster.structuredActions.push({
        id: 'blur',
        name: 'Blur',
        sourceType: 'spell',
        level: 2,
        range: 'Self',
        concentration: true,
      });
      // Add lvl 2 slot
      caster.spellbook.slots.push({ level: 2, current: 1, max: 1 });

      const intent = { actionId: 'blur', type: ActionType.CastSpell };
      const result = resolveSpell(caster, intent);

      expect(result.newConcentrationId).toBe('blur');
      expect(caster.spellbook.concentratingOn).toBe('blur');
    });

    it('should break previous concentration', () => {
      const caster = createCaster(1);
      caster.spellbook.concentratingOn = 'old_spell';
      caster.structuredActions.push({
        id: 'blur',
        name: 'Blur',
        sourceType: 'spell',
        level: 2,
        range: 'Self',
        concentration: true,
      });
      caster.spellbook.slots.push({ level: 2, current: 1, max: 1 });

      const intent = { actionId: 'blur', type: ActionType.CastSpell };
      const result = resolveSpell(caster, intent);

      expect(result.brokenConcentrationId).toBe('old_spell');
      expect(result.newConcentrationId).toBe('blur');
    });

    it('should detect AoE', () => {
      const caster = createCaster(1);
      const intent = { actionId: 'burning_hands', type: ActionType.CastSpell };
      const result = resolveSpell(caster, intent);
      expect(result.isAoE).toBe(true);
    });
  });
});
