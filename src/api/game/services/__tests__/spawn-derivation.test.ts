/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect } from 'vitest';
import { EntityDeriver } from '../../src/engine/derivation';
import { DerivationContext } from '../../src/engine/derivation/types';

describe('EntityDeriver Action Derivation', () => {
  it('should derive melee attack from sword', () => {
    const context: DerivationContext = {
      attributes: { strength: 16, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Longsword',
          damage_dice: '1d8',
          damage_type: { name: 'slashing' },
          range_normal: 5,
          isEquipped: true,
        },
      ],
    };

    const result = EntityDeriver.derive(context);
    const actions = result.structuredActions;

    expect(actions).toBeDefined();
    expect(actions).toHaveLength(1);
    expect(actions[0].name).toBe('Longsword');
    expect(actions[0].attack?.type).toBe('melee_weapon');
    expect(actions[0].range?.value).toBe(5);
    // Str 16 -> +3 mod. ToHit: +3 + 2 = +5. Damage: +3.
    expect(actions[0].attack?.bonus).toBe(5);
    expect(actions[0].effects?.[0].flat).toBe(3);
    expect(actions[0].effects?.[0].dice).toBe('1d8');
  });

  it('should derive ranged attack from bow using DEX', () => {
    const context: DerivationContext = {
      attributes: { strength: 10, dexterity: 16, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Shortbow',
          damage_dice: '1d6',
          damage_type: { name: 'piercing' },
          range_normal: 80,
          range_long: 320,
          isEquipped: true,
        },
      ],
    };

    const result = EntityDeriver.derive(context);
    const actions = result.structuredActions;

    expect(actions).toHaveLength(1);
    expect(actions[0].attack?.type).toBe('ranged_weapon');
    expect(actions[0].range?.value).toBe(80);
    // Dex 16 -> +3 mod.
    expect(actions[0].attack?.bonus).toBe(5);
  });

  it('should fallback to Unarmed Strike if no weapons', () => {
    const context: DerivationContext = {
      attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [],
    };

    const result = EntityDeriver.derive(context);
    expect(result.structuredActions).toHaveLength(1);
    expect(result.structuredActions[0].name).toBe('Unarmed Strike');
    expect(result.structuredActions[0].attack?.type).toBe('melee_weapon');
  });
});
