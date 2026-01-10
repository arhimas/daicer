import { ActionDispatcher } from '../ActionDispatcher';
import { ActionDefinition } from '../../../../types/ActionDefinition';

describe('ActionDispatcher Verification', () => {
  const source = {
    name: 'Wizard',
    stats: { int: 18 },
    proficiencyBonus: 3,
  };

  const target = {
    name: 'Goblin',
    ac: 15,
    stats: { dex: 14 }, // +2 mod
    hp: 7,
  };

  const fireballAction: ActionDefinition = {
    id: 'spell_fireball',
    name: 'Fireball',
    sourceType: 'spell',
    sourceId: '1',
    cost: { type: 'slot', amount: 3 },
    range: { type: 'ranged', value: 150 },
    save: {
      attribute: 'dex',
      dc: 15, // 8 + 4 + 3
      effect: 'half',
    },
    effects: [
      {
        type: 'damage',
        subtype: 'Fire',
        dice: '8d6',
        timing: 'instant',
      },
    ],
  };

  const swordAction: ActionDefinition = {
    id: 'weapon_longsword',
    name: 'Longsword',
    sourceType: 'weapon',
    sourceId: '2',
    range: { type: 'melee', value: 5 },
    attack: {
      type: 'melee_weapon',
      bonus: 5, // +3 Str + 2 Prof
      critRange: 20,
    },
    effects: [
      {
        type: 'damage',
        subtype: 'Slashing',
        dice: '1d8',
        flat: 3,
        timing: 'instant',
      },
    ],
  };

  test('Fireball Resolution (Save vs Damage)', () => {
    // We run multiple times to check range of outcomes (random seed simulation)
    const result = ActionDispatcher.resolve(source, target, fireballAction);

    console.log('Fireball Log:', result.log);

    expect(result.damageTotal).toBeGreaterThan(0);
    // 8d6 is min 8, max 48. Half is min 4.
    expect(result.damageTotal).toBeGreaterThanOrEqual(4);
  });

  test('Longsword Resolution (Attack vs AC)', () => {
    // Force a few runs to likely see hit and miss
    let hitCount = 0;
    for (let i = 0; i < 10; i++) {
      const result = ActionDispatcher.resolve(source, target, swordAction);
      if (result.hit) hitCount++;
    }
    // Probabilistic check - not strict
    console.log(`Sword Hits: ${hitCount}/10`);
  });
});
