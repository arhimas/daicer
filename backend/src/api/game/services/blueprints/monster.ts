import { AbstractBlueprint } from '../../src/engine/types/blueprint';
import { StrapiMonster } from '../adapters/types';
import { mapStrapiStatsToStatBlock } from '../adapters/stats.adapter';
import { mapStrapiActionsToEntityActions } from '../adapters/actions.adapter';
import { resolveInventory } from '../adapters/inventory.adapter';
import { mapStrapiFeaturesToEntityFeatures } from '../adapters/features.adapter';
import { mapStrapiSpellToEntitySpell } from '../adapters/spell.adapter';

export const resolveMonsterBlueprint = (monster: StrapiMonster): AbstractBlueprint => {
  const stats = mapStrapiStatsToStatBlock(monster.stats);
  const actions = mapStrapiActionsToEntityActions(monster.actions, stats);
  const featureList = mapStrapiFeaturesToEntityFeatures(monster.features, 'Monster Feature');
  const inventory = resolveInventory(monster.inventory);

  const spells = monster.spells ? monster.spells.map((s) => mapStrapiSpellToEntitySpell(s, 'innate')) : [];

  return {
    name: monster.name,
    type: 'monster',
    level: monster.challenge_rating ? Math.max(1, Math.floor(monster.challenge_rating)) : 1,
    stats,
    maxHp: monster.hp || 10,
    armorClass: monster.ac || 10 + stats.initiativeBonus,
    speed: monster.speed || 30,
    actions,
    spells,
    features: featureList,
    inventory,
    resistances: monster.resistances || [],
    immunities: monster.immunities || [],
    vulnerabilities: monster.vulnerabilities || [],
    visionRadius: 60, // Standard darkvision assumption or default
    originalData: monster,
  };
};
