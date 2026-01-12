import { AbstractBlueprint } from '../../src/engine/types/blueprint';

/**
 * Resolves a Strapi Character into an Engine Blueprint.
 * Refactored to use Direct Hydration (removing Adapter dependency).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveCharacterBlueprint = (character: any): AbstractBlueprint => {
  const stats = character.stats || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    initiativeBonus: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLevel = character.classes?.reduce((sum: number, c: any) => sum + (c.level || 1), 0) || 1;

  // Approximation for Base HP if not explicit: (avg d8 (5) + conMod) * level
  // Note: strapi keys might be fullname or abbr. Assuming schema matches 'stats' component keys.
  const con = stats.con || stats.constitution || 10;
  const conMod = Math.floor((con - 10) / 2);
  const estHpPerLevel = 5 + conMod;
  const maxHp = Math.max(1, estHpPerLevel * totalLevel);

  return {
    name: character.name,
    type: 'player',
    level: totalLevel,
    stats: stats,
    maxHp: maxHp,
    armorClass: 10,
    speed: character.race?.speed || 30,
    actions: [],
    spells: [],
    features: [],
    inventory: character.inventory || [],
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    visionRadius: 30,
    originalData: character,
  };
};
