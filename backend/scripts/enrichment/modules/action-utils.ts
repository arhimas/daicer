import { updateEntity } from '../../utils/strapi-client';

const actionCache = new Map<string, number>();

export const getActionDefinitionId = async (
  name: string,
  type: string,
  description: string,
  richData: any, // Pass extracted damage/range data to populate the entity
  client: any
): Promise<number | null> => {
  if (!name) return null;
  const slug = name.toLowerCase().trim();
  if (actionCache.has(slug)) return actionCache.get(slug) || null;

  try {
    // Try to find existing definition
    const existing = await client.collection('actions').find({
      filters: { name: { $eq: name } },
      pagination: { limit: 1 },
    });

    if (existing.data && existing.data.length > 0) {
      const id = existing.data[0].id;
      actionCache.set(slug, id);
      return id;
    }

    // Create new Action Definition with Rich Data
    const payload: any = {
      name: name,
      type: ['melee_weapon', 'melee'].includes(type)
        ? 'melee'
        : ['ranged_weapon', 'ranged'].includes(type)
          ? 'ranged'
          : type,
      description: description,
    };

    // Populate Optional Components (Best Effort for initial definition)
    if (richData.damage && richData.damage.length > 0) {
      payload.damage_instances = richData.damage;
    }
    if (richData.range || richData.reach) {
      payload.range_config = {
        type: richData.range && richData.range > 5 ? 'Ranged (Feet)' : 'Touch',
        distance: richData.range || richData.reach || 5,
      };
    }
    if (richData.save) {
      payload.save = richData.save;
    }
    if (richData.properties) {
      // Maybe store properties in description or a simplified config
    }

    const created = await client.collection('actions').create(payload);

    if (created && created.data) {
      const id = created.data.id;
      actionCache.set(slug, id);
      return id;
    }
  } catch (e) {
    console.warn(`[ActionUtils] Failed to find/create Action Definition for ${name}:`, e);
  }
  return null;
};

const spellCache = new Map<string, number>();

export const getSpellDefinitionId = async (name: string, client: any): Promise<number | null> => {
  if (!name) return null;
  const slug = name.toLowerCase().trim();
  if (spellCache.has(slug)) return spellCache.get(slug) || null;

  try {
    const existing = await client.collection('spells').find({
      filters: { name: { $eq: name } },
      pagination: { limit: 1 },
    });

    if (existing.data && existing.data.length > 0) {
      const id = existing.data[0].id;
      spellCache.set(slug, id);
      return id;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
};

const equipmentCache = new Map<string, number>();

export const getEquipmentDefinitionId = async (name: string, client: any): Promise<number | null> => {
  if (!name) return null;
  const slug = name.toLowerCase().trim();
  if (equipmentCache.has(slug)) return equipmentCache.get(slug) || null;

  try {
    const existing = await client.collection('equipments').find({
      filters: { name: { $eq: name } },
      pagination: { limit: 1 },
    });

    if (existing.data && existing.data.length > 0) {
      const id = existing.data[0].id;
      equipmentCache.set(slug, id);
      return id;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
};
