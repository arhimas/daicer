import { EntityAction, StatBlock } from '../../src/engine/types';
import { StrapiEntitySheet, StrapiAction } from './types';

export const mapStrapiActionsToEntityActions = (
  sourceActions: StrapiAction[] | undefined,
  stats: StatBlock
): EntityAction[] => {
  const actions: EntityAction[] = [];

  if (Array.isArray(sourceActions)) {
    actions.push(
      ...sourceActions.map((a) => {
        const damage = a.damage_instances
          ?.filter((d) => d.effect_type === 'Damage')
          .map((d) => ({
            dice: `${d.dice_count}d${d.dice_value}`,
            bonus: d.flat_bonus || 0,
            type: d.damage_type.toLowerCase(),
          }));

        const save =
          a.save?.dc && a.save?.stat
            ? {
                dc: a.save.dc,
                stat: a.save.stat,
                onSave: a.save.success_type || 'none',
              }
            : undefined;

        return {
          id: String(a.documentId),
          name: a.name,
          type: a.type || 'utility',
          toHit: a.toHit,
          damage,
          save,
          area: a.range_config?.aoe_shape
            ? { shape: a.range_config.aoe_shape, size: a.range_config.aoe_size }
            : undefined,
          range: a.range_config?.distance ? String(a.range_config.distance) : undefined,
          description: a.description,
          action_definition: {
            documentId: a.documentId,
            name: a.name,
          },
        };
      })
    );
  }

  // Unarmed Strike Fallback logic could be here OR in the specific resolver?
  // Let's keep it if no actions exist.
  if (actions.length === 0) {
    const strMod = Math.floor((stats.strength - 10) / 2);
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

export const resolveActions = (sheet: StrapiEntitySheet, stats: StatBlock): EntityAction[] => {
  // 1. Explicit Actions from Relation (Sheet > Monster Blueprint)
  const sourceActions = sheet.actions && sheet.actions.length > 0 ? sheet.actions : sheet.monster?.actions;
  return mapStrapiActionsToEntityActions(sourceActions, stats);
};
