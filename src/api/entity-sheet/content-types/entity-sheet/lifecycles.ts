import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

import { FeatureHydrator } from '@/services/mechanics/feature-hydrator';
import { InventorySchema, type InventoryItem } from '@/types/Inventory';
import { EntityDeriver, Equipment } from '@/api/game/src/engine'; // Ensure Index exports Equipment or import from types
import { EntityStats } from '@daicer/engine/derivation/types';

import type { Core } from '@strapi/strapi';

interface LifecycleEvent {
  action: string;
  model: { uid: string };
  params: {
    data?: Record<string, unknown>; // Data can be partial
    where?: { documentId?: string; id?: number | string };
  };
  result?: {
    documentId?: string;
    id?: number | string;
  };
}

// Helper to access Strapi global safely if needed or type
declare let strapi: Core.Strapi;

export default {
  async beforeCreate(event: LifecycleEvent) {
    const { data } = event.params;
    if (data) validateInventorySlots(data);

    // In create, we might not have all relations populated in 'data', so we might skip or try best effort.
    // Usually creation sends IDs. If we want auto-hydration on create, we'd need to fetch the related entities (class, race) by ID.
    // For now, let's focus on Update, or simple hydration if possible.
    // But let's defer complex hydration to "afterCreate" or require an update flow.
    // ACTUALLY: Best pattern is handling it here if we can resolve relations.
    // Given the complexity of resolving relations from IDs in beforeCreate, we will rely on a subsequent update or the user sending correct data.
    // However, for robustness, we'll try to process if we have the data.
  },

  async beforeUpdate(event: LifecycleEvent) {
    const { data, where } = event.params;
    if (data) validateInventorySlots(data);

    // Only run expensive hydration if relevant fields changed
    const relevantFields = ['inventory', 'stats', 'level', 'class', 'race', 'attributes'];
    const needsUpdate = data && relevantFields.some((key) => key in data);

    if (needsUpdate && where && where.documentId) {
      await updateDerivedData(event);
    }
  },

  async afterCreate(event: LifecycleEvent) {
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

  async afterUpdate(event: LifecycleEvent) {
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

// Validates inventory slots using strict Zod schema
function validateInventorySlots(data: { inventory?: unknown }) {
  if (!data.inventory || !Array.isArray(data.inventory)) {
    return;
  }

  // Parse against Zod Schema to ensure structure
  const result = InventorySchema.safeParse(data.inventory);

  if (!result.success) {
    // If schema validation fails, log warning but maybe allow loose data if legacy?
    // For strictness, we throw.
    const issues = result.error.issues.map((i) => i.message).join(', ');
    throw new ApplicationError(`Invalid Inventory Structure: ${issues}`);
  }

  const items = result.data;
  const slots = new Set<string>();

  for (const item of items) {
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

async function updateDerivedData(event: LifecycleEvent) {
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

  const attributes: EntityStats = {
    strength: rawStats.strength || 10,
    dexterity: rawStats.dexterity || 10,
    constitution: rawStats.constitution || 10,
    intelligence: rawStats.intelligence || 10,
    wisdom: rawStats.wisdom || 10,
    charisma: rawStats.charisma || 10,
    passivePerception: 10, // Default
    initiativeBonus: 0, // Default
  };

  const inventory = data.inventory || current.inventory || [];
  const inventoryResult = InventorySchema.safeParse(inventory);
  const validatedInventory = inventoryResult.success ? inventoryResult.data : [];

  // 2b. Resolve Equipment for Deriver
  const equippedInventory = validatedInventory.filter((i: InventoryItem) => i.isEquipped);
  const equipmentForDeriver: Equipment[] = [];

  if (equippedInventory.length > 0) {
    for (const invEntry of equippedInventory) {
      if (invEntry.item) {
        let equipDef: unknown = invEntry.item;

        // If item is just ID/Name string, fetch it
        if (typeof equipDef !== 'object') {
          const found = await strapi.documents('api::equipment.equipment').findFirst({
            filters: { name: equipDef as string }, // Assume string is Name
            populate: ['equipment_category', 'damage_type', 'properties'],
          });

          if (found) {
            equipDef = found;
          } else {
            // Fallback ID fetch
            try {
              equipDef = await strapi.documents('api::equipment.equipment').findOne({
                documentId: String(equipDef),
                populate: ['equipment_category', 'damage_type', 'properties'],
              });
            } catch {
              equipDef = null;
            }
          }
        } else if (equipDef) {
          // It's an object, check if deeply populated
          const ed = equipDef as { equipment_category?: unknown; documentId: string };
          if (!ed.equipment_category) {
            equipDef = await strapi.documents('api::equipment.equipment').findOne({
              documentId: ed.documentId,
              populate: ['equipment_category', 'damage_type', 'properties'],
            });
          }
        }

        if (equipDef) {
          // Clone and attach isEquipped status for Deriver
          equipmentForDeriver.push({ ...(equipDef as object), isEquipped: true } as Equipment);
        }
      }
    }
  }

  // 3. Run Deriver
  const derived = EntityDeriver.derive({
    stats: attributes,
    attributes,
    proficiencyBonus: 2, // Default
    level,
    equipment: equipmentForDeriver,
    race: { speed: current.race?.speed || 30 }, // Or fetch new race if data.race changed
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
    classData = await strapi
      .documents('api::class.class')
      .findOne({ documentId: data.class as string, populate: ['features'] });
  }
  let raceData = current.race;
  if (data.race && data.race !== current.race?.documentId) {
    raceData = await strapi
      .documents('api::race.race')
      .findOne({ documentId: data.race as string, populate: ['features'] });
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
