import { AbstractBlueprint } from '../../../../engine/types/blueprint';
import { StrapiCharacter } from '../adapters/types';
import { mapStrapiStatsToStatBlock } from '../adapters/stats.adapter';
import { mapStrapiActionsToEntityActions } from '../adapters/actions.adapter';
import { resolveInventory } from '../adapters/inventory.adapter';
import { mapStrapiSpellToEntitySpell } from '../adapters/spell.adapter';

export const resolveCharacterBlueprint = (character: StrapiCharacter): AbstractBlueprint => {
  const stats = mapStrapiStatsToStatBlock(character.stats);
  const actions = mapStrapiActionsToEntityActions(character.actions, stats);
  const inventory = resolveInventory(character.inventory);

  const totalLevel = character.classes?.reduce((sum, c) => sum + (c.level || 1), 0) || 1;

  // Approximation for Base HP if not explicit: (avg d8 (5) + conMod) * level
  const conMod = Math.floor((stats.constitution - 10) / 2);
  const estHpPerLevel = 5 + conMod;
  const maxHp = Math.max(1, estHpPerLevel * totalLevel);

  // Spells often come from spellbook on sheet, but if character has innate spells:
  const spells = character.spells ? character.spells.map((s) => mapStrapiSpellToEntitySpell(s, 'known')) : [];

  return {
    name: character.name,
    type: 'player', // Characters are typically players
    level: totalLevel,
    stats,
    maxHp,
    armorClass: 10 + stats.initiativeBonus, // Default unarmored
    speed: character.race?.speed || 30, // Race speed or default
    actions,
    spells,
    features: [], // Character features usually complex to derive without deep population, leaving empty for now
    inventory,
    resistances: [], // Racial traits might key this later
    immunities: [],
    vulnerabilities: [],
    visionRadius: 30,
    originalData: character,
  };
};
