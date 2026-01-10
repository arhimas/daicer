import { AbstractBlueprint } from '../../src/engine/types/blueprint';
import { StrapiEntity } from '../adapters/types';
import { mapStrapiStatsToStatBlock } from '../adapters/stats.adapter';
import { mapStrapiActionsToEntityActions } from '../adapters/actions.adapter';
import { resolveInventory } from '../adapters/inventory.adapter';
import { mapStrapiFeaturesToEntityFeatures } from '../adapters/features.adapter';
import { mapStrapiSpellToEntitySpell } from '../adapters/spell.adapter';

export const resolveEntityBlueprint = (entity: StrapiEntity): AbstractBlueprint => {
  const stats = mapStrapiStatsToStatBlock(entity.stats);
  const actions = mapStrapiActionsToEntityActions(entity.actions, stats);
  const featureList = mapStrapiFeaturesToEntityFeatures(entity.features, 'Entity Feature');
  const inventory = resolveInventory(entity.inventory);

  const spells = entity.spells ? entity.spells.map((s) => mapStrapiSpellToEntitySpell(s, 'innate')) : [];

  return {
    name: entity.name,
    type: (entity.type as 'monster' | 'player' | 'npc') || 'monster', // Fallback
    level: entity.level || (entity.challenge_rating ? Math.max(1, Math.floor(entity.challenge_rating)) : 1),
    stats,
    maxHp: entity.hp || 10,
    armorClass: entity.ac || 10 + stats.initiativeBonus,
    speed: entity.speed || 30,
    actions,
    spells,
    features: featureList,
    inventory,
    resistances: entity.resistances || [],
    immunities: entity.immunities || [],
    vulnerabilities: entity.vulnerabilities || [],
    visionRadius: 60, // Standard darkvision assumption or default
    originalData: entity,
  };
};
