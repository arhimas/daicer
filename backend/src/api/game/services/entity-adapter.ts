import { Entity, EntitySheet } from '../src/engine/types';
import { StrapiEntitySheet } from './adapters/types';
import { resolveEntityBlueprint, resolveCharacterBlueprint } from './blueprints';
import { mapStrapiStatsToStatBlock } from './adapters/stats.adapter';
import { mapStrapiActionsToEntityActions } from './adapters/actions.adapter';
import { resolveInventory } from './adapters/inventory.adapter';
import { resolveSpells } from './adapters/spell.adapter';
import { resolveFeatures } from './adapters/features.adapter';

export * from './adapters';
export * from './adapters/types';

export default () => ({
  adapt(input: unknown, options?: { ignoreActiveState?: boolean }): Entity {
    // 0. Safety Cast & Validation
    const sheet = input as StrapiEntitySheet;
    // Unified Entity Sheet (Single Truth)
    // We no longer merge "ActiveState" because EntitySheet IS the ActiveState.

    if (!sheet || typeof sheet !== 'object') {
      throw new Error('EntityAdapter received invalid input');
    }

    // 1. Resolve Blueprint (The "True" Nature)
    // If no monster/character linked, create a dummy default blueprint (or throw?)
    // Defaulting to basic character if nothing exists to prevent crash.
    const blueprint = sheet.entity
      ? resolveEntityBlueprint(sheet.entity)
      : sheet.character
        ? resolveCharacterBlueprint(sheet.character)
        : resolveCharacterBlueprint({ documentId: 'dummy', name: 'Unknown Entity' });

    // 2. Resolve Instance Component Overrides (Sheet Layers)
    // Stats: merge sheet stats over blueprint stats
    const stats = mapStrapiStatsToStatBlock(sheet.stats, blueprint.stats as unknown as Record<string, number>);

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
    const tempHp = sheet.tempHp || 0;

    let armorClass = sheet.ac ?? sheet.armorClass;
    if (armorClass === undefined) {
      armorClass = blueprint.armorClass;
    }

    const speed = sheet.speed || blueprint.speed;

    // Use Computed Actions if available (derived from derivation service)
    // otherwise fallback to sheet explicit actions (manual) or blueprint
    let finalActions = actions;
    if (sheet.computedActions && sheet.computedActions.length > 0) {
      finalActions = sheet.computedActions.map((a) => ({
        id: String(a.id),
        name: a.name,
        type: a.type || 'utility',
        description: a.description,
        attack: { bonus: a.toHit || 0, type: a.type || 'melee' },
        range: { value: a.range || 5 },
        effects: a.damageDice ? [{ type: 'damage', dice: a.damageDice, subtype: a.damageType }] : [],
      }));
    }

    // Map Computed Skills/Saves to dictionaries for easier usage?
    // Entity interface doesn't explicitly have 'skills' yet in the adapter return type.
    // But we should likely add them if we want to use them.
    // For now we map defenses.
    const defenses = sheet.defenses || [];
    const resistances = defenses.filter((d) => d.modifier === 'resistance').map((d) => d.damageType);
    const immunities = defenses.filter((d) => d.modifier === 'immunity').map((d) => d.damageType);
    const vulnerabilities = defenses.filter((d) => d.modifier === 'vulnerability').map((d) => d.damageType);

    // 4. Construct Output Entity
    return {
      id: sheet.documentId,
      name: sheet.name || blueprint.name,
      type: sheet.type || blueprint.type,
      position: sheet.position || { x: 0, y: 0, z: 0 },

      hp: currentHp,
      tempHp,
      maxHp,
      armorClass,
      speed,
      level: sheet.level || blueprint.level,

      initiative: sheet.initiativeBonus || 0, // Entity interface might need 'initiative'
      passivePerception: sheet.passivePerception || 10,

      stats,
      equipment: inventory,

      actions: finalActions,
      features,
      conditions: [], // Runtime only

      resistances: [...(sheet.resistances || []), ...resistances],
      immunities: [...(sheet.immunities || []), ...immunities],
      vulnerabilities: [...(sheet.vulnerabilities || []), ...vulnerabilities],

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
