import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

import { FeatureHydrator } from '../../../../services/mechanics/feature-hydrator';

// Helper to access Strapi global safely if needed or type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let strapi: any;

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    validateInventorySlots(data);

    // In create, we might not have all relations populated in 'data', so we might skip or try best effort.
    // Usually creation sends IDs. If we want auto-hydration on create, we'd need to fetch the related entities (class, race) by ID.
    // For now, let's focus on Update, or simple hydration if possible.
    // But let's defer complex hydration to "afterCreate" or require an update flow.
    // ACTUALLY: Best pattern is handling it here if we can resolve relations.
    // Given the complexity of resolving relations from IDs in beforeCreate, we will rely on a subsequent update or the user sending correct data.
    // However, for robustness, we'll try to process if we have the data.
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;
    validateInventorySlots(data);

    // Only run expensive hydration if relevant fields changed
    const relevantFields = ['inventory', 'stats', 'level', 'class', 'race', 'attributes'];
    const needsUpdate = relevantFields.some((key) => key in data);

    if (needsUpdate && where && where.documentId) {
      await updateDerivedData(event);
    }
  },

  async afterCreate(event) {
    const { result } = event;
    try {
      if (result && result.documentId) {
        await strapi.service('api::game.active-state-service').deriveAndPersist(result.documentId);
      }
    } catch (err) {
      strapi.log.error('ActiveState derivation failed', err);
      throw new ApplicationError('ActiveState Derivation Failed: ' + (err as Error).message);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    try {
      if (result && result.documentId) {
        await strapi.service('api::game.active-state-service').deriveAndPersist(result.documentId);
      }
    } catch (err) {
      strapi.log.error('ActiveState derivation failed', err);
      throw new ApplicationError('ActiveState Derivation Failed: ' + (err as Error).message);
    }
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateInventorySlots(data: any) {
  if (!data.inventory || !Array.isArray(data.inventory)) {
    return;
  }

  const slots = new Set();

  for (const item of data.inventory) {
    // Skip if item doesn't have a slot or is in backpack
    if (!item.slot || item.slot === 'backpack') {
      continue;
    }

    if (slots.has(item.slot)) {
      throw new ApplicationError(`You cannot have more than one item equipped in the ${item.slot} slot.`);
    }

    slots.add(item.slot);
  }
}

import { EntityDeriver, Equipment } from '../../../game/src/engine'; // Ensure Index exports Equipment or import from types
import { Attributes } from '../../../game/src/engine/derivation/types';

async function updateDerivedData(event) {
  const { where, data } = event.params;

  // 1. Fetch current full state from DB for context
  const current = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
    documentId: where.documentId,
    populate: {
      class: { populate: ['features'] },
      race: { populate: ['features'] },
      stats: true,
      inventory: { populate: ['item'] },
      features: true,
      structuredActions: true,
    },
  });

  if (!current) return;

  // 2. Prepare Context for Deriver
  // Merge data over current
  const level = data.level ?? current.level ?? 1;
  const rawStats = data.stats || current.stats || {};
  const attributes: Attributes = {
    strength: rawStats.strength || 10,
    dexterity: rawStats.dexterity || 10,
    constitution: rawStats.constitution || 10,
    intelligence: rawStats.intelligence || 10,
    wisdom: rawStats.wisdom || 10,
    charisma: rawStats.charisma || 10,
  };

  const inventory = data.inventory || current.inventory || [];

  // 2b. Resolve Equipment for Deriver
  const equippedInventory = inventory.filter((i: { isEquipped: boolean; item: unknown }) => i.isEquipped);
  const equipmentForDeriver: Equipment[] = [];

  if (equippedInventory.length > 0) {
    // If inventory items are relations and already populated (if we populated deep enough)
    // Strapi v5 populate is deep?
    // Let's prefer fetching Equipment definitions by ID or Name if relations aren't fully expanded.
    // For robustness:
    for (const invEntry of equippedInventory) {
      if (invEntry.item) {
        // If item is object (populated relation), use it. Else fetch by ID/Name.
        let equipDef = invEntry.item;
        if (typeof equipDef !== 'object') {
          // Try to find by Name (legacy/test support) or ID
          // We try findFirst with name filter first as "Longsword" is clearly a name.
          // If we wanted to be strict about IDs, we'd use findOne, but for now restore flexibility.
          const found = await strapi.documents('api::equipment.equipment').findFirst({
            filters: { name: equipDef }, // Assume string is Name
            populate: ['equipment_category', 'damage_type', 'properties'],
          });
          if (found) {
            equipDef = found;
          } else {
            // If not found by name, could it be an ID?
            // Try findOne as fallback? Or assume it was a Name and fail?
            // Let's try findOne if name search fails.
            try {
              equipDef = await strapi.documents('api::equipment.equipment').findOne({
                documentId: equipDef,
                populate: ['equipment_category', 'damage_type', 'properties'],
              });
            } catch {
              equipDef = null;
            }
          }
        } else {
          // Ensure nested fields are present, if not, refetch might be safer but let's assume populate worked if possible.
          // Actually `populate: { inventory: { populate: ['item'] } }` above might not map deep fields of item.
          if (!equipDef.equipment_category) {
            equipDef = await strapi.documents('api::equipment.equipment').findOne({
              documentId: equipDef.documentId,
              populate: ['equipment_category', 'damage_type', 'properties'],
            });
          }
        }
        if (equipDef) {
          // Clone and attach isEquipped status for Deriver
          equipmentForDeriver.push({ ...equipDef, isEquipped: true });
        }
      }
    }
  }

  // 3. Run Deriver
  const derived = EntityDeriver.derive({
    attributes,
    level,
    equipment: equipmentForDeriver,
    race: { speed: current.race?.speed || 30 }, // Or fetch new race if data.race changed
    // Classes support? EntitySheet has 'class' relation (singular or plural??)
    // The schema says `class` (singular). spawn-service mapped `classes` (plural) from Character Blueprint.
    // EntitySheet seems to support SINGLE class for now in schema?
    // Checking schema.json: "class": { "type": "relation", "target": "api::class.class" } -> One to One?
    // Implementation Plan mentions Multiclass support.
    // If EntitySheet only has one class relation, we are limited.
    // But let's stick to what we have.
    hitDie: 8, // TODO: Fetch from class relation
  });

  // 4. Update Event Data
  event.params.data.hp = derived.hp; // Update derived hp
  event.params.data.maxHp = derived.maxHp;
  event.params.data.armorClass = derived.ac;
  event.params.data.speed = derived.speed.walk;
  event.params.data.structuredActions = derived.structuredActions;

  // Preserve Hydration of features logic (legacy/separate)
  let classData = current.class;
  if (data.class && data.class !== current.class?.documentId) {
    classData = await strapi.documents('api::class.class').findOne({ documentId: data.class, populate: ['features'] });
  }
  let raceData = current.race;
  if (data.race && data.race !== current.race?.documentId) {
    raceData = await strapi.documents('api::race.race').findOne({ documentId: data.race, populate: ['features'] });
  }

  const featuresInput = {
    characterLevel: level,
    classFeatures: (classData?.features || []).map((f: { name: string; description?: string; level?: number }) => ({
      name: f.name,
      description: f.description || '',
      level: f.level || 1,
    })),
    raceFeatures: (raceData?.features || []).map((f: { name: string; description?: string }) => ({
      name: f.name,
      description: f.description || '',
    })),
  };

  event.params.data.features = FeatureHydrator.hydrateFeatures(featuresInput);
}
