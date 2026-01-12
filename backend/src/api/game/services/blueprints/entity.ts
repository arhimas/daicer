import { AbstractBlueprint } from '../../src/engine/types/blueprint';

/**
 * Resolves a Strapi Entity into an Engine Blueprint.
 * Refactored to use Direct Hydration (removing Adapter dependency).
 */
export const resolveEntityBlueprint = (entity: any): AbstractBlueprint => {
  // Direct mapping - The Engine now handles most derivation at runtime.
  // This Blueprint is primarily for initial Spawn properties.

  const stats = entity.stats || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    initiativeBonus: 0,
  };

  return {
    name: entity.name,
    type: entity.type || 'monster',
    level: entity.level || (entity.challenge_rating ? Math.max(1, Math.floor(entity.challenge_rating)) : 1),
    stats: stats,
    maxHp: entity.hp || 10,
    armorClass: entity.ac || 10,
    speed: entity.speed || 30,
    // Actions/Spells/Features are now derived at Runtime by the Engine/EntityDerivation service
    // instead of being baked into the static blueprint here.
    actions: [],
    spells: [],
    features: [],
    inventory: entity.inventory || [],
    resistances: entity.resistances || [],
    immunities: entity.immunities || [],
    vulnerabilities: entity.vulnerabilities || [],
    visionRadius: 60,
    originalData: entity,
  };
};
