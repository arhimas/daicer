import { Entity, EntitySheet } from '../../../../engine/types';
import { StrapiEntitySheet } from './types';
import { resolveBaseStats } from './stats.adapter';
import { resolveInventory } from './inventory.adapter';
import { resolveSpells } from './spell.adapter';
import { resolveFeatures } from './features.adapter';
import { resolveProficiencies } from './proficiencies.adapter';
import { resolveActions } from './actions.adapter';

// Named Exports for Testing
export { resolveBaseStats, resolveInventory, resolveSpells, resolveFeatures, resolveActions, resolveProficiencies };

export default () => ({
  adapt(input: unknown): Entity {
    // 0. Safety Cast & Validation
    const sheet = input as StrapiEntitySheet;
    if (!sheet || typeof sheet !== 'object') {
      throw new Error('EntityAdapter received invalid input');
    }

    // 1. Resolve Components via Pure Adapters
    const stats = resolveBaseStats(sheet);
    const inventory = resolveInventory(sheet.inventory);
    const spells = resolveSpells(sheet.spellbook);
    const { features, traits } = resolveFeatures(sheet);
    const { proficiencies, languages } = resolveProficiencies(sheet);
    const actions = resolveActions(sheet, stats);

    // 2. Resolve Vitals (Logic remains in Facade or could be moved to vitals.adapter.ts)
    const maxHp = sheet.maxHp || sheet.monster?.hp || 10;
    const hp = sheet.currentHp ?? maxHp;

    // AC Logic: Sheet Override > Monster AC > 10 + Dex Mod
    let armorClass = sheet.ac ?? sheet.armorClass;
    if (armorClass === undefined) {
      if (sheet.monster?.ac) armorClass = sheet.monster.ac;
      else armorClass = 10 + stats.initiativeBonus;
    }

    // 3. Construct Output Entity
    // This is the "SOTA" hydration moment where we assemble the Rich Object structure
    return {
      id: sheet.documentId,
      name: sheet.name || 'Unknown Entity',
      type: sheet.type || 'monster',
      position: sheet.position || { x: 0, y: 0, z: 0 },

      hp,
      maxHp,
      armorClass,
      speed: sheet.speed || sheet.monster?.speed || 30, // Fallback to monster speed

      // Level Logic: Class sum or Monster CR or 1
      level: sheet.character?.classes?.length
        ? sheet.character.classes.reduce((sum, c) => sum + c.level, 0)
        : sheet.monster?.challenge_rating
          ? Math.floor(sheet.monster.challenge_rating)
          : 1,

      stats,
      // Engine uses 'equipment' for both weapons and items
      equipment: inventory,

      actions,
      features, // Class Features + Racial Traits + Feats

      // Relations
      // Conditions currently start empty, managed by Engine runtime
      conditions: [],

      resistances: sheet.resistances || sheet.monster?.resistances || [],
      immunities: sheet.immunities || sheet.monster?.immunities || [],
      vulnerabilities: sheet.vulnerabilities || sheet.monster?.vulnerabilities || [],

      // Visuals
      color: sheet.color || '#ffffff',
      visionRadius: 30,

      // 4. Embed the source Sheet for detailed UI inspection
      // We explicitly cast the strict/aggregated properties back onto the Sheet
      // to ensure the UI sees the "True" state of the entity.
      sheet: {
        ...sheet,
        hp,
        maxHp,
        stats,
        inventory,
        actions,
        spells,
        proficiencies,
        languages,
        traits,
        features,
        spellbook: sheet.spellbook,
      } as unknown as EntitySheet,
    };
  },
});
