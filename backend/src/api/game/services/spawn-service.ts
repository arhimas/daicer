/**
 * Spawn Service
 * Handles instantiation of Characters and Monsters into the game world.
 */

import { EntityDeriver } from '@daicer/engine';

export default ({ strapi }) => ({
  /**
   * Spawn a monster into a room by creating a CharacterSheet
   */
  async spawnMonster(
    roomId: string | number,
    monsterId: string | number,
    position: { x: number; y: number; z: number }
  ) {
    // 1. Fetch Monster Blueprint
    const monster = await strapi.documents('api::monster.monster').findOne({
      documentId: monsterId as string, // Try documentId first
      populate: ['stats', 'structuredActions', 'structuredActions.damage'],
    });

    // Fallback if not string or not found via documentId (though documents API prefers documentId uses standard findOne)
    // If monsterId is numeric ID, we might need a filter.
    // Assuming backend receives documentId from frontend.

    if (!monster) {
      // Try finding by numeric id if monsterId is number?
      // strapi.documents usually uses documentId.
      throw new Error(`Monster blueprint not found: ${monsterId}`);
    }

    // 2. Fetch Room to ensure existence
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId as string,
    });
    if (!room) throw new Error('Room not found');

    // 3. Create Character Sheet
    // Use monster stats
    const hp = monster.hp || 10;
    const maxHp = monster.hp || 10;

    // Parse speed? Monster speed is JSON usually e.g. "30 ft" or { walk: 30 }.
    // We'll store it as is or parse if needed.
    // CharacterSheet doesn't have a specific 'speed' field, it might be in 'stats' component or we rely on 'monster' relation.

    // Check for collision
    const existing = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: {
        room: { documentId: room.documentId },
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
      },
      limit: 1,
    });

    if (existing.length > 0) {
      throw new Error(`Position ${position.x},${position.y},${position.z} is occupied by ${existing[0].name}`);
    }

    const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: {
        name: monster.name,
        type: 'monster',
        monster: monster.documentId,
        room: room.documentId,
        currentHp: hp,
        maxHp: maxHp,
        level: 1, // Default
        experience: monster.xp || 0,
        position: position,
        // Stats component can be populated from monster.stats if structures match
        stats: monster.stats,
        structuredActions: monster.structuredActions,

        // We can add appearance/inventory stubs
      },
      status: 'published',
    });

    return newSheet;
  },

  /**
   * Spawn a character from blueprint
   */
  async spawnCharacter(
    roomId: string | number,
    characterId: string | number,
    position: { x: number; y: number; z: number },
    ownerId?: string
  ) {
    const character = await strapi.documents('api::character.character').findOne({
      documentId: characterId as string,
      populate: [
        'baseStats',
        'race',
        'class',
        'equipment',
        'equipment.item',
        'equipment.item.damage_type',
        'equipment.item.equipment_category',
        'equipment.item.properties',
      ],
    });

    if (!character) throw new Error('Character blueprint not found');

    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId as string,
    });
    if (!room) throw new Error('Room not found');

    // Parse Hit Die from Class (e.g., "1d8" -> 8)
    let hitDie = 8;
    if (character.class?.hit_die) {
      const parts = character.class.hit_die.split('d');
      if (parts.length === 2) {
        hitDie = parseInt(parts[1], 10);
      }
    }

    // Prepare Derivation Context
    // Map Strapi 'baseStats' (full names) to Engine 'Attributes' (short names)
    // Strapi: strength, dexterity, constitution, intelligence, wisdom, charisma
    // Engine: str, dex, con, int, wis, cha
    const baseStats = character.baseStats || {};
    const attributes = {
      str: baseStats.strength || 10,
      dex: baseStats.dexterity || 10,
      con: baseStats.constitution || 10,
      int: baseStats.intelligence || 10,
      wis: baseStats.wisdom || 10,
      cha: baseStats.charisma || 10,
    };

    // Extract actual equipment items from the inventory-item component wrapper
    // EntityDeriver expects Equipment objects (with damage_dice, etc), not the { item: ... } wrapper
    // We also likely want to filter by 'isEquipped' to only grant actions for equipped items
    const equipmentForDeriver =
      character.equipment?.filter((entry) => entry.isEquipped && entry.item).map((entry) => entry.item) || [];

    // Calculate Stats
    const derived = EntityDeriver.derive({
      attributes: attributes,
      level: 1,
      proficiencyBonus: 2, // Level 1 default
      equipment: equipmentForDeriver,
      hitDie: hitDie,
      race: {
        speed: character.race?.speed,
      },
    });

    // Check for collision
    const existing = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: {
        room: { documentId: room.documentId },
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
        },
      },
      limit: 1,
    });

    if (existing.length > 0) {
      throw new Error(`Position ${position.x},${position.y},${position.z} is occupied by ${existing[0].name}`);
    }

    const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: {
        name: character.name,
        type: ownerId ? 'player' : 'npc', // Player if owned, else NCP
        owner: ownerId, // Assign owner relation
        character: character.documentId,
        room: room.documentId,
        currentHp: derived.hp,
        maxHp: derived.maxHp,
        level: 1,
        experience: 0,
        position: position,
        stats: (() => {
          if (!character.baseStats) return undefined;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = character.baseStats;
          return rest;
        })(),
        race: character.race?.documentId,
        class: character.class?.documentId,
        // speed: derived.speed,
        structuredActions: derived.structuredActions,
        appearance: character.appearance,
        backstory: character.backstory,
        inventory:
          character.equipment?.map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = item;
            return rest;
          }) || [],
      },
      status: 'published',
    });

    return newSheet;
  },
});
