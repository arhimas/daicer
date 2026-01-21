/**
 * Inventory Service
 * Handles item transactions: Dropping (to World), Picking Up (from World), and Death Drops.
 */

import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Drops a specific item from an entity's inventory into the world.
   * Creates a new EntitySheet (type: 'loot') at the entity's position.
   */
  async dropItem(entityId: string, itemComponentId: string): Promise<{ success: boolean; message: string }> {
    // 1. Fetch Source Entity
    const entity = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: entityId,
      populate: ['inventory', 'inventory.item', 'position'],
    });

    if (!entity) throw new Error('Entity not found');

    // 2. Find Item in Inventory
    // Note: itemComponentId matches the ID of the component instance, NOT the Item relation ID
    const inventory = entity.inventory || [];
    const itemIndex = inventory.findIndex(
      (i: { id: number; documentId: string }) => i.id === Number(itemComponentId) || i.documentId === itemComponentId
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    const itemToDrop = inventory[itemIndex];

    // 3. Create Loot Entity
    // We name the pile after the item if it's a single drop
    const itemName = itemToDrop.item?.name || 'Dropped Item';
    const position = entity.position;

    await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: {
        name: itemName,
        type: 'loot',
        position: position, // Copy position
        inventory: [itemToDrop], // Move component data to new entity
        // Default stats/HP for persistence logic if needed
        hp: 1,
        maxHp: 1,
        ac: 10,
        temp_id: `loot_${Date.now()}_${Math.random()}`, // Debug aid
      } as unknown as Record<string, unknown>,
    });

    // 4. Remove from Source
    const newInventory = [...inventory];
    newInventory.splice(itemIndex, 1);

    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: entityId,

      data: { inventory: newInventory } as unknown as Record<string, unknown>,
    });

    return { success: true, message: `Dropped ${itemName}` };
  },

  /**
   * Transfers all items from a Loot entity to the Actor, then destroys the Loot entity.
   */
  async pickupItem(actorId: string, lootEntityId: string): Promise<{ success: boolean; message: string }> {
    // 1. Fetch Actor and Loot
    const [actor, loot] = await Promise.all([
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: actorId,
        populate: ['inventory'],
      }),
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: lootEntityId,
        populate: ['inventory', 'inventory.item'],
      }),
    ]);

    if (!actor || !loot) throw new Error('Actor or Loot entity not found');
    if (loot.type !== 'loot' && loot.type !== 'npc') {
      // Should we allow picking up from dead NPCs? Ideally yes.
      // For now, strict 'loot' check or check inventory existence.
    }

    const lootItems = loot.inventory || [];
    if (lootItems.length === 0) {
      // Empty pile, just delete it?
      await strapi.documents('api::entity-sheet.entity-sheet').delete({ documentId: lootEntityId });
      return { success: false, message: 'Loot pile was empty' };
    }

    // 2. Transfer Items
    // We append loot items to actor inventory
    // Note: We might need to "clean" ids to force new component creation,
    // but Strapi usually handles component assignment by value if ID is stripped
    // or by ID if moving. Safest is to strip ID to clone.
    const itemsToTransfer = lootItems.map((i: { id: number; documentId: string; [key: string]: unknown }) => {
      const { id: _id, documentId: _docId, ...rest } = i;
      return rest;
    });

    const newActorInventory = [...(actor.inventory || []), ...itemsToTransfer];

    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: actorId,

      data: { inventory: newActorInventory } as unknown as Record<string, unknown>,
    });

    // 3. Delete Loot Entity
    await strapi.documents('api::entity-sheet.entity-sheet').delete({
      documentId: lootEntityId,
    });

    return { success: true, message: `Picked up ${lootItems.length} items from ${loot.name}` };
  },

  /**
   * Drops an item at a SPECIFIC coordinate (e.g. for Throwing).
   */
  async dropItemAt(
    entityId: string,
    itemComponentId: string,
    position: { x: number; y: number; z: number }
  ): Promise<{ success: boolean; message: string }> {
    // 1. Fetch Source Entity
    const entity = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: entityId,
      populate: ['inventory', 'inventory.item'],
    });

    if (!entity) throw new Error('Entity not found');

    // 2. Find Item in Inventory
    const inventory = entity.inventory || [];
    const itemIndex = inventory.findIndex(
      (i: { id: number; documentId: string }) => i.id === Number(itemComponentId) || i.documentId === itemComponentId
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    const itemToDrop = inventory[itemIndex];

    // 3. Create Loot Entity at TARGET position
    const itemName = itemToDrop.item?.name || 'Dropped Item';

    await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: {
        name: itemName,
        type: 'loot',
        position: position, // Use provided position
        inventory: [itemToDrop], // Move component data
        hp: 1,
        maxHp: 1,
        ac: 10,
        temp_id: `loot_${Date.now()}_${Math.random()}`,
      } as unknown as Record<string, unknown>,
    });

    // 4. Remove from Source
    const newInventory = [...inventory];
    newInventory.splice(itemIndex, 1);

    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: entityId,
      data: { inventory: newInventory } as unknown as Record<string, unknown>,
    });

    return { success: true, message: `Dropped ${itemName} at ${position.x},${position.y},${position.z}` };
  },

  /**
   * DEATH DROP: Moves ALL items from entity to a new 'Remains' loot entity (or converts current entity to loot?).
   * Current Design: Create new "Loot" entity, clear source inventory.
   * (Alternatively: Change Source Type to 'loot' and kill stats? No, keep Source as 'Dead Body' for rez, create Loot pile for items?)
   *
   * User Request: "drops go to the floor".
   * Optimized Approach: Create a "Loot Pile" at location with all items.
   */
  async dropAll(entityId: string): Promise<{ success: boolean; message: string }> {
    const entity = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: entityId,
      populate: ['inventory', 'inventory.item', 'position'],
    });

    if (!entity) return { success: false, message: 'Entity not found' };

    const inventory = entity.inventory || [];
    if (inventory.length === 0) return { success: true, message: 'Nothing to drop' };

    // Create Loot Pile
    await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: {
        name: `Remains of ${entity.name}`,
        type: 'loot',
        position: entity.position,
        inventory: inventory.map((i: { id: number; documentId: string; [key: string]: unknown }) => {
          const { id: _id, documentId: _docId, ...rest } = i;
          return rest;
        }),
        hp: 1,
        maxHp: 1,
        ac: 10,
        temp_id: `remains_${Date.now()}`,
      } as unknown as Record<string, unknown>,
    });

    // Clear Source Inventory
    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: entityId,

      data: { inventory: [] } as unknown as Record<string, unknown>,
    });

    return { success: true, message: 'Dropped all items' };
  },

  /**
   * Equips an item, handling slot validation and auto-unequipping conflicting items.
   */
  async equipItem(entityId: string, itemComponentId: string, slot: string): Promise<{ success: boolean; message: string }> {
    const entity = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: entityId,
      populate: ['inventory', 'inventory.item', 'inventory.item.equipment_data', 'inventory.item.equipment_data.properties'],
    });

    if (!entity) throw new Error('Entity not found');

    const inventory = entity.inventory || [];
    const itemIndex = inventory.findIndex(
      (i: { id: number; documentId: string }) => i.id === Number(itemComponentId) || i.documentId === itemComponentId
    );

    if (itemIndex === -1) throw new Error('Item not found in inventory');

    const itemToEquip = inventory[itemIndex];
     
    const equipmentData = itemToEquip.item?.equipment_data;
     
    const properties = equipmentData?.properties || [];
    const isTwoHanded = properties.some((p: { slug: string }) => p.slug === 'two-handed');

    // Logic:
    // 1. If equipping 2H: Unequip Main Hand AND Off Hand.
    // 2. If equipping into Off Hand: Unequip existing Off Hand AND 2H Weapon in Main Hand.
    // 3. If equipping into Main Hand: Unequip existing Main Hand AND if new item is 2H, unequip Off Hand.
    
    // Simplification:
    // Iterate all items.
    // Set target item to equipped + slot.
    // If target is 2H -> Set Main Hand. Check Off Hand occupied? Unequip it.
    
    const newInventory = inventory.map((i: any) => {
        // The item itself
        if (i.id === itemToEquip.id || i.documentId === itemToEquip.documentId) {
             return { ...i, isEquipped: true, slot };
        }
        
        // Validation Checks against OTHER items
        if (i.isEquipped) {
            // Case A: Target is 2H Main Hand.
            if (isTwoHanded && slot === 'main_hand') {
                 // Conflict if item is in Main OR Off hand
                 if (i.slot === 'main_hand' || i.slot === 'off_hand') {
                     return { ...i, isEquipped: false };
                 }
            }

            // Case B: Target is Off Hand. 
            if (slot === 'off_hand') {
                // Conflict if item is Off Hand
                if (i.slot === 'off_hand') return { ...i, isEquipped: false };
                
                // Conflict if item is Main Hand AND Two Handed
                if (i.slot === 'main_hand') {
                    const iProps = i.item?.equipment_data?.properties || [];
                    const iIs2H = iProps.some((p: { slug: string }) => p.slug === 'two-handed');
                    if (iIs2H) return { ...i, isEquipped: false };
                }
            }
            
            // Case C: Target is Main Hand (1H).
            if (slot === 'main_hand' && !isTwoHanded) {
                 if (i.slot === 'main_hand') return { ...i, isEquipped: false };
            }
            
            // Case D: Standard Slot Swap (Head, Armor, etc)
            if (i.slot === slot) {
                return { ...i, isEquipped: false }; 
            }
        }

        return i;
    });

    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: entityId,
      data: { inventory: newInventory } as unknown as Record<string, unknown>,
    });

    return { success: true, message: `Equipped ${itemToEquip.item?.name || 'Item'}` };
  },

  /**
   * Calculates total weight of inventory.
   */
  async calculateWeight(entityId: string): Promise<number> {
      // Allow passing full entity to avoid fetch if needed? For now strict ID.
      const entity = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
          documentId: entityId,
          populate: ['inventory', 'inventory.item']
      });

      if (!entity) return 0;
      
      const inventory = entity.inventory || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return inventory.reduce((total: number, entry: any) => {
          const w = entry.item?.weight || 0;
          const q = entry.quantity || 1;
          return total + (w * q);
      }, 0);
  }
});
