import { AbstractBlueprint } from '../../src/engine/types/blueprint';

/**
 * Resolves a Strapi Entity into an Engine Blueprint.
 * Refactored to use Direct Hydration (removing Adapter dependency).
 * Handles generic 'Entity' type (Player, Monster, etc.)
 *
 * @param entity - The raw Strapi entity to resolve.
 * @returns The hydrated AbstractBlueprint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveEntityBlueprint = (entity: any): AbstractBlueprint => {
  const stats = entity.stats || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    initiativeBonus: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalLevel = entity.classes?.reduce((sum: number, c: any) => sum + (c.level || 1), 0) || entity.level || 1;

  // Approximation for Base HP if not explicit: (avg d8 (5) + conMod) * level
  // Note: strapi keys might be fullname or abbr. Assuming schema matches 'stats' component keys.
  const con = stats.con || stats.constitution || 10;
  const conMod = Math.floor((con - 10) / 2);
  const estHpPerLevel = 5 + conMod;

  let maxHp = entity.hp || entity.maxHp;
  if (!maxHp) {
      maxHp = Math.max(1, estHpPerLevel * totalLevel);
  }

  return {
    name: entity.name,
    type: (entity.type || 'player').toLowerCase(), // 'Player', 'Monster' -> 'player', 'monster'
    level: totalLevel,
    stats: stats,
    maxHp: maxHp,
    armorClass: entity.ac || 10,
    speed: entity.race?.speed || entity.speed || 30,
    actions: entity.actions || [],
    spells: entity.spells || [],
    features: entity.features || [],
    inventory: entity.inventory || [],
    resistances: entity.resistances || [],
    immunities: entity.immunities || [],
    vulnerabilities: entity.vulnerabilities || [],
    visionRadius: entity.visionRadius || 30, // Default vision
    originalData: entity,
  };
};
