import { EntityAction, StatBlock } from '../../../../engine/types';
import { StrapiEntitySheet } from './types';

export const resolveActions = (sheet: StrapiEntitySheet, stats: StatBlock): EntityAction[] => {
  const actions: EntityAction[] = [];

  // 1. Explicit Actions from Relation (Sheet > Monster Blueprint)
  const sourceActions = sheet.actions && sheet.actions.length > 0 ? sheet.actions : sheet.monster?.actions || [];

  if (Array.isArray(sourceActions)) {
    actions.push(
      ...sourceActions.map((a) => ({
        id: String(a.documentId),
        name: a.name,
        type: a.type || 'utility',
        toHit: a.toHit,

        // Deep Hydration of Damage Array
        damage: a.damage?.map((d) => ({
          dice: d.dice,
          bonus: d.bonus || 0,
          type: d.type,
        })),

        // Deep Hydration of Save
        save: a.save?.dc && a.save?.stat ? { dc: a.save.dc, stat: a.save.stat, onSave: a.save.onSave } : undefined,

        area: a.area,
        range: a.range ? String(a.range) : undefined,
        description: a.description,

        // Retain link to definition for detailed lookups
        action_definition: a.action_definition
          ? {
              documentId: a.action_definition.documentId,
              name: a.action_definition.name,
            }
          : undefined,
      }))
    );
  }

  // 2. Unarmed Strike Fallback
  // If no actions exist (common for new characters), provide a default interaction.
  if (actions.length === 0) {
    const strMod = Math.floor((stats.strength - 10) / 2);
    // Proficiency (2) is a standard baseline for lvl 1
    const toHit = 2 + strMod;

    actions.push({
      id: 'action-unarmed',
      name: 'Unarmed Strike',
      type: 'melee_attack',
      toHit,
      damage: [{ dice: '1', bonus: strMod, type: 'bludgeoning' }],
      description: 'Standard unarmed strike',
    });
  }

  return actions;
};
