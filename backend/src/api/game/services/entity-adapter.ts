import { Entity, EntitySheet } from '../../../engine/types';
import { StrapiEntitySheet } from './adapters/types';
import { resolveMonsterBlueprint, resolveCharacterBlueprint } from './blueprints';
import { mapStrapiStatsToStatBlock } from './adapters/stats.adapter';
import { mapStrapiActionsToEntityActions } from './adapters/actions.adapter';
import { resolveInventory } from './adapters/inventory.adapter';
import { resolveSpells } from './adapters/spell.adapter';
import { resolveFeatures } from './adapters/features.adapter';

export * from './adapters';
export * from './adapters/types';

export default () => ({
  adapt(input: unknown): Entity {
    // 0. Safety Cast & Validation
    const sheet = input as StrapiEntitySheet;
    if (!sheet || typeof sheet !== 'object') {
      throw new Error('EntityAdapter received invalid input');
    }

    // 1. Resolve Blueprint (The "True" Nature)
    // If no monster/character linked, create a dummy default blueprint (or throw?)
    // Defaulting to basic character if nothing exists to prevent crash.
    const blueprint = sheet.monster
      ? resolveMonsterBlueprint(sheet.monster)
      : sheet.character
        ? resolveCharacterBlueprint(sheet.character)
        : resolveCharacterBlueprint({ documentId: 'dummy', name: 'Unknown Entity' });

    // 2. Resolve Instance Component Overrides (Sheet Layers)
    // Stats: merge sheet stats over blueprint stats
    const stats = mapStrapiStatsToStatBlock(sheet.stats, blueprint.stats as any);

    // Inventory: blueprint inventory + sheet inventory? Or Sheet overrides?
    // Usually Sheet represents CURRENT state, so it replaces blueprint "starting gear".
    // Or we merge. For now: if sheet has inventory, use it. Else blueprint.
    const inventory =
      sheet.inventory && sheet.inventory.length > 0 ? resolveInventory(sheet.inventory) : blueprint.inventory;

    // Spells: Sheet spellbook (prepared/known) >> Blueprint innate spells
    // Logic: If sheet.spellbook exists, use `resolveSpells`.
    // If not, use blueprint.spells.
    // Note: `resolveSpells` returns EntitySpell[]
    const spells = sheet.spellbook ? resolveSpells(sheet.spellbook) : blueprint.spells;

    // Actions: Sheet explicit actions >> Blueprint actions
    const actions =
      sheet.actions && sheet.actions.length > 0
        ? mapStrapiActionsToEntityActions(sheet.actions, stats)
        : blueprint.actions;

    // Features: Adapter logic merges sheet traits + monster features.
    // Our Blueprint already has this logic mostly.
    // Let's reuse `resolveFeatures` if we want "Sheet Traits" + "Blueprint Features".
    // Or use blueprint.features + map(sheet.traits).
    // The existing adapter `resolveFeatures` was specific: class features + traits.
    // Let's use `resolveFeatures(sheet)` manually for now to mix both layers,
    // OR respect strict separation.
    // Existing: features = class features from sheet + traits(sheet+monster).
    // Blueprint: has features.
    // Let's stick strictly to: Blueprint Features + Sheet Traits.
    const blueprintFeatures = blueprint.features;
    // We can assume `resolveFeatures` handles the sheet-part.
    const instanceFeatures = resolveFeatures(sheet);
    // Combine unique by ID?
    const features = [...blueprintFeatures, ...instanceFeatures.features, ...instanceFeatures.traits];
    // De-duplication might be needed but skipping for perf unless critical.

    // 3. Resolve Vitals & State
    const maxHp = sheet.maxHp || blueprint.maxHp;
    const currentHp = sheet.currentHp ?? maxHp;

    let armorClass = sheet.ac ?? sheet.armorClass;
    if (armorClass === undefined) {
      armorClass = blueprint.armorClass;
    }

    const speed = sheet.speed || blueprint.speed;

    // 4. Construct Output Entity
    return {
      id: sheet.documentId,
      name: sheet.name || blueprint.name,
      type: sheet.type || blueprint.type,
      position: sheet.position || { x: 0, y: 0, z: 0 },

      hp: currentHp,
      maxHp,
      armorClass,
      speed,
      level: blueprint.level, // Level is intrinsic to blueprint usually, unless sheet overrides?

      stats,
      equipment: inventory,

      actions,
      features,
      conditions: [], // Runtime only

      resistances: sheet.resistances || blueprint.resistances,
      immunities: sheet.immunities || blueprint.immunities,
      vulnerabilities: sheet.vulnerabilities || blueprint.vulnerabilities,

      color: sheet.color || '#ffffff',
      visionRadius: blueprint.visionRadius,

      // Embed Source for UI inspection
      sheet: {
        ...sheet,
        hp: currentHp,
        maxHp,
        stats,
        inventory,
        actions,
        spells,
        features,
        spellbook: sheet.spellbook,
      } as unknown as EntitySheet,
    };
  },
});
