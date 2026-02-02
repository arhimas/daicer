import { z } from 'zod';

// Based on src/components/game/inventory-item.json
export const InventoryItemSchema = z.object({
  id: z.number().optional(), // Component ID
  quantity: z.number().default(1),
  slot: z
    .enum([
      'backpack',
      'main_hand',
      'off_hand',
      'armor',
      'head',
      'feet',
      'neck',
      'hands',
      'cloak',
      'ring_1',
      'ring_2',
      'accessory',
    ])
    .default('backpack'),
  isEquipped: z.boolean().default(false),
  // User feedback: "nothing is none never and we have item on strapi"
  // Implies the item relation is mandatory for a valid inventory component entry.
  item: z.union([
    z.string(), // ID or Name reference (Legacy/Simple)
    z.number(), // ID reference
    z
      .object({
        // Populated Relation (api::item.item)
        documentId: z.string(),
        id: z.number().optional(),
        name: z.string(),
        equipment_category: z.any().optional(),
        damage_type: z.any().optional(),
        properties: z.any().optional(),
      })
      .passthrough(),
  ]),
});

export const InventorySchema = z.array(InventoryItemSchema);

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
