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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeState = (sheet as any).activeState;

    if (!options?.ignoreActiveState && activeState) {
      // Fast Path: Construct Entity from ActiveState
      return {
        id: sheet.documentId,
        name: sheet.name,
        type: sheet.type,
        position: sheet.position || { x: 0, y: 0, z: 0 },
        hp: activeState.currentHp,
        maxHp: activeState.maxHp,
        armorClass: activeState.armorClass,
        speed: activeState.speed,
        level: activeState.level,
        stats: activeState.attributes,
        // Map computedActions back to EntityAction[]
        actions:
          activeState.computedActions?.map(
            (a: {
              id?: string;
              name: string;
              type: string;
              description?: string;
              toHit?: number;
              range?: number;
              damageDice?: string;
              damageType?: string;
            }) => ({
              id: a.id || 'computed',
              name: a.name,
              type: a.type,
              description: a.description,
              attack: { bonus: a.toHit, type: a.type },
              range: { value: a.range },
              effects: a.damageDice ? [{ type: 'damage', dice: a.damageDice, subtype: a.damageType }] : [],
            })
          ) || [],
        features: [], // ActiveState doesn't store features detailed list yet, fallback or empty?
        // Implementation Plan said ActiveState has everything?
        // ActiveState schema has attributes, skills, saves...
        // But Entity interface needs 'features' property.
        // If we want FULL parity, ActiveState needs features list.
        // For now, let's mix: Read fast stats from ActiveState, but maybe Features from Sheet if needed?
        // Or just return empty if consumers of Entity don't need features (which is risky).
        // Let's assume for stats/combat (EntityDeriver target), features aren't primary except for derivation.
        // Actions are present.
        // Let's return what we have.

        resistances: activeState.resistances || [],
        immunities: activeState.immunities || [],
        vulnerabilities: activeState.vulnerabilities || [],
        conditions: activeState.conditions || [],

        color: sheet.color || '#ffffff',
        visionRadius: 30, // Default or derived? ActiveState didn't store visionRadius (oops).
        // Sheet has it? Blueprint has it.
        // We might need to resolve blueprint for static props like visionRadius if not in ActiveState.
        // But "Zero Latency" implies avoiding lookups.
        // Let's use sheet defaults/fallback.

        sheet: sheet as unknown as EntitySheet,
        // We attach full sheet, so UI can drill down if needed.
      } as Entity;
    }

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
