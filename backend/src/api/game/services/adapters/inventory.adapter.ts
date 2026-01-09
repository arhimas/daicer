import { EntityItem } from '../../../../engine/types';
import { StrapiInventoryItem } from './types';

export const resolveInventory = (inventory?: StrapiInventoryItem[]): EntityItem[] => {
  if (!inventory || !Array.isArray(inventory)) return [];

  return inventory.map((entry) => {
    // Robust ID generation for frontend keys
    const id = entry.id ? String(entry.id) : `inv_${Math.random().toString(36).substring(2, 9)}`;

    return {
      id,
      quantity: entry.quantity || 1,
      slot: entry.slot || 'backpack',
      isEquipped: !!entry.isEquipped,

      // Deep Hydration of the Item Definition
      item: entry.item
        ? {
            documentId: entry.item.documentId,
            name: entry.item.name,
            description: entry.item.description,
            // Future SOTA: Add weight, value, rarity mapping here if engine supports it
          }
        : undefined,
    };
  });
};
