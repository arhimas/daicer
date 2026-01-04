import { describe, it, expect } from 'vitest';
import { EntityDeriver } from '@daicer/engine';
import { DerivationContext } from '@daicer/engine';

describe('EntityDeriver Action Derivation', () => {
  it('should derive melee attack from sword', () => {
    const context: DerivationContext = {
      attributes: { str: 16, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Longsword',
          damage_dice: '1d8',
          damage_type: { name: 'slashing' },
          range_normal: 5,
        },
      ],
    };

    const result = EntityDeriver.derive(context);
    const actions = result.structuredActions;

    expect(actions).toBeDefined();
    expect(actions).toHaveLength(1);
    expect(actions[0].name).toBe('Longsword');
    expect(actions[0].type).toBe('melee');
    expect(actions[0].reach).toBe(5);
    // Str 16 -> +3 mod. ToHit: +3 + 2 = +5. Damage: +3.
    expect(actions[0].toHit).toBe(5);
    expect(actions[0].damage[0].bonus).toBe(3);
    expect(actions[0].damage[0].dice).toBe('1d8');
  });

  it('should derive ranged attack from bow using DEX', () => {
    const context: DerivationContext = {
      attributes: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [
        {
          name: 'Shortbow',
          damage_dice: '1d6',
          damage_type: { name: 'piercing' },
          range_normal: 80,
          range_long: 320,
        },
      ],
    };

    const result = EntityDeriver.derive(context);
    const actions = result.structuredActions;

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('ranged');
    expect(actions[0].reach).toBe(80);
    // Dex 16 -> +3 mod.
    expect(actions[0].toHit).toBe(5);
  });

  it('should fallback to Unarmed Strike if no weapons', () => {
    const context: DerivationContext = {
      attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      level: 1,
      proficiencyBonus: 2,
      equipment: [],
    };

    const result = EntityDeriver.derive(context);
    expect(result.structuredActions).toHaveLength(1);
    expect(result.structuredActions[0].name).toBe('Unarmed Strike');
    expect(result.structuredActions[0].type).toBe('melee');
  });
});
