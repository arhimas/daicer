import { processCollection } from './enrichment-runner';
import { COLLECTION_MAP } from '../constants';
import { WeaponSchema, MagicItemSchema } from '../schemas';
import { updateEntity } from '../../../utils/strapi-client';

export const runItems = async (target: string, limit: number, isDryRun: boolean) => {
  // 1. Equipment
  if (target === 'all' || target === 'equipment') {
    await processCollection({
      uid: COLLECTION_MAP.equipment,
      schema: WeaponSchema,
      promptTemplate: `You are a D&D Rules Engine. Analyze the provided Item/Weapon description and extract its properties.
      - Extract damage dice count and value separately (e.g. 2d6 -> count:2, value:6).
      - Extract damage type (e.g. Piercing).
      - Extract range.`,
      limit,
      isDryRun,
      handler: async (entity, result, client) => {
        let actionId = null;
        if (result.damage_dice_value) {
          const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Slashing');
          const dType = capitalize(result.damage_type || 'slashing');

          const finalDamage = [
            {
              dice_count: result.damage_dice_count || 1,
              dice_value: result.damage_dice_value,
              flat_bonus: 0, // Weapon definition usually has 0 bonus, depends on user stats
              damage_type: dType,
              effect_type: 'Damage',
              timing: 'Instant',
            },
          ];

          const richData = {
            damage: finalDamage,
            range: result.range_normal,
            reach: 5,
          };

          const { getActionDefinitionId } = await import('../action-utils');
          actionId = await getActionDefinitionId(entity.name, 'melee', entity.description || '', richData, client);
        }

        // Link Spells if any
        let spellIds: number[] = [];
        if (result.spells && result.spells.length > 0) {
          const spellPromise = result.spells.map(async (spellName: string) => {
            const sSlug = spellName.toLowerCase().trim();
            const existing = await client.collection('spells').find({
              filters: { name: { $eq: spellName } },
              pagination: { limit: 1 },
            });
            if (existing.data && existing.data.length > 0) return existing.data[0].id;
            return null;
          });
          const resolved = await Promise.all(spellPromise);
          spellIds = resolved.filter((id) => id !== null);
        }

        const res = await updateEntity(COLLECTION_MAP.equipment, entity.documentId || entity.id, {
          // damage_dice: result.damage_dice_string, // Deprecated or keep for legacy? Schema has damage_dice string.
          damage_dice:
            result.damage_dice_string ||
            (result.damage_dice_count ? `${result.damage_dice_count}d${result.damage_dice_value}` : null),
          versatile_damage: result.versatile_damage,
          range_normal: result.range_normal,
          range_long: result.range_long,
          actions: actionId ? [actionId] : [],
          spells: spellIds,
        });
        if (!res) throw new Error('DB Update Failed');
      },
    });
  }

  // 2. Magic Items
  if (target === 'all' || target === 'magic-items') {
    await processCollection({
      uid: COLLECTION_MAP['magic-items'],
      schema: MagicItemSchema,
      promptTemplate: `Analyze the provided Magic Item. Extract rarity, attunement, charges, and active abilities.`,
      limit,
      isDryRun,
      handler: async (entity, result) => {
        const res = await updateEntity(COLLECTION_MAP['magic-items'], entity.documentId || entity.id, {
          rarity: result.rarity,
          requires_attunement: result.requires_attunement,
          attunement_description: result.attunement_description
            ? result.attunement_description.substring(0, 250)
            : null,
          has_charges: result.has_charges,
          max_charges: result.max_charges,
          recharge_formula: result.recharge_formula,
          recharge_trigger: result.recharge_trigger,
        });
        if (!res) throw new Error('DB Update Failed');
      },
    });
  }
};
