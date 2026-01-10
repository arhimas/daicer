/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Spawn Service
 * Handles instantiation of Characters and Monsters into the game world.
 */

import { EntityDeriver, StatBlock } from '../src/engine';

export default ({ strapi }) => ({
  /**
   * Spawn a monster into a room by creating a CharacterSheet
   */
  async spawnMonster(
    roomId: string | number,
    monsterId: string | number,
    position: { x: number; y: number; z: number }
  ) {
    // 1. Fetch Entity Blueprint
    const monster = await strapi.documents('api::entity.entity').findOne({
      documentId: monsterId as string, // Try documentId first
      populate: [
        'stats',
        'actions', // Relation to api::action
        'actions.damage_instances',
        'features', // Relation
        'inventory', // Component (Renamed from equipment_items)
        'inventory.item',
        'inventory.item.equipment_data', // New Component for stats
        'inventory.item.equipment_data.damage_type',
        'inventory.item.equipment_data.properties',
        'proficiencies', // Relation
        'languages', // Relation
        'traits', // Relation
      ],
    });

    if (!monster) {
      throw new Error(`Monster blueprint not found: ${monsterId}`);
    }

    // 2. Fetch Room from documentId OR roomId field
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: { $eq: roomId as string } }, { roomId: { $eq: roomId as string } }],
      },
      limit: 1,
    });
    const room = rooms[0];

    if (!room) {
      console.error(`[SpawnService] Room not found. Input ID: ${roomId}`);
      throw new Error(`Room not found: ${roomId}`);
    }

    console.info(
      `[SpawnService] Found Room for Monster Spawn: ${room.documentId} (Name: ${room.name}, Locale: ${room.locale})`
    );

    // 3. Create Entity Sheet
    // Use monster stats
    const stats: Partial<StatBlock> = monster.stats || {};

    // Extract actual equipment items
    const equipmentForDeriver =
      monster.inventory
        ?.filter((entry: { isEquipped: boolean; item: any }) => entry.isEquipped && entry.item)
        .map((entry: { item: any }) => {
          const item = entry.item;
          const eqData = item.equipment_data || {};
          return {
            ...item,
            ...eqData, // Flatten equipment_data
            equipment_category: { slug: item.type }, // Shim for legacy compatibility
            isEquipped: true,
          };
        }) || [];

    const derived = EntityDeriver.derive({
      attributes: {
        str: stats.strength || 10,
        dex: stats.dexterity || 10,
        con: stats.constitution || 10,
        int: stats.intelligence || 10,
        wis: stats.wisdom || 10,
        cha: stats.charisma || 10,
      },
      level: monster.level || Math.max(1, Math.floor(monster.challenge_rating || 1)),
      isMonster: true,
      equipment: equipmentForDeriver,
      innateActions: [], // JSON structuredActions deprecated. We rely on relations now.
      race: {
        speed: monster.speed, // Pass explicit speed if any
      },
      // Override derivation with authoritative blueprint values if present
      ac: monster.ac,
      hp: monster.hp,
      maxHp: monster.hp,
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

    try {
      console.info(`[SpawnService] Creating EntitySheet... Room ID: ${room.documentId}`);

      // Map Actions from Monster Relations to EntitySheet Relations
      // The monster.actions is a relation to api::action
      // We strictly link them via relation now.
      // Map Actions from Monster Relations to EntitySheet Relations
      // The monster.actions is a relation to api::action
      // We strictly link them via relation now.
      const mappedActions = (monster.actions || [])
        .filter((a: any) => a && a.documentId)
        .map((action: any) => action.documentId);

      console.info(`[SpawnService] Mapped Actions IDs: ${JSON.stringify(mappedActions)}`);

      const sheetData: any = {
        name: monster.name,
        type: 'monster',
        entity: monster.documentId,
        room: room.documentId,
        hp: derived.hp,
        maxHp: derived.maxHp,
        ac: derived.ac, // Mapped to ac (or armorClass in schema)
        armorClass: derived.ac,
        speed: { walk: (typeof monster.speed === 'number' ? monster.speed : 0) || derived.speed.walk },
        level: derived.level,
        experience: monster.xp || 0,
        position: position,
        stats: monster.stats, // Component
        actions: mappedActions,
        inventory: (monster.inventory || []).map((entry: any) => ({
          item: entry.item?.documentId,
          quantity: entry.quantity ?? 1,
          slot: entry.slot ?? 'backpack',
          isEquipped: entry.isEquipped ?? false,
        })),
        features: monster.features?.map((f: any) => f.documentId), // Relation ID list
        traits: monster.traits?.map((t: any) => t.documentId), // Relation ID list
        proficiencies: monster.proficiencies?.map((p: any) => p.documentId), // Relation ID list
        languages: monster.languages?.map((l: any) => l.documentId), // Relation ID list
        // attributes: removed as not in schema
        initiative: 0,
        proficiencyBonus: derived.proficiencyBonus || 2,
      };

      const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
        data: sheetData,
        status: 'published',
      });
      console.info(`[SpawnService] EntitySheet Created: ${newSheet.documentId}`);
      return newSheet;
    } catch (err) {
      console.error('[SpawnService] Creation Error:', err);
      throw err;
    }
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
        'stats',
        'race',
        'race.proficiencies',
        'race.traits',
        'race.speed', // json
        'classes',
        'classes.class',
        'classes.class.proficiencies',
        'classes.class.features', // Component in Class
        'inventory', // Renamed from equipment_items
        'inventory.item',
        'inventory.item.equipment_data', // New component
        'inventory.item.equipment_data.damage_type',
        'inventory.item.equipment_data.properties',
        'actions', // Relation
        'spells', // Relation (top level?) or Component? Character schema has `spells` relation.
        // Wait, character schema had 'spell_config'. Let's check logic.
        // Plan says populate spellbook.
        'spell_config', // If exists
        'spell_config.prepared_spells',
        'spell_config.known_spells',
      ],
    });

    if (!character) throw new Error('Character blueprint not found');

    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: { $eq: roomId as string } }, { roomId: { $eq: roomId as string } }],
      },
      populate: { world: true },
      limit: 1,
    });
    const room = rooms[0];

    if (!room) {
      console.error(`[SpawnService] Room not found during character spawn. Input ID: ${roomId}`);
      throw new Error('Room not found');
    }

    // Resolve Main Class
    const mainClassComponent = character.classes?.[0];
    const mainClass = mainClassComponent?.class;

    // Parse Hit Die
    let hitDie = 8;
    if (mainClass?.hit_die) {
      const parts = mainClass.hit_die.split('d');
      if (parts.length === 2) {
        hitDie = parseInt(parts[1], 10);
      }
    }

    console.info(`[SpawnService] Found Room: ${room.documentId} (Name: ${room.name || 'Unknown'})`);
    console.info(`[SpawnService] Creating EntitySheet for character: ${character.name} in room: ${room.documentId}`);

    // Prepare Derivation Context
    const stats: Partial<StatBlock> = character.stats || {};
    const attributes = {
      str: stats.strength || 10,
      dex: stats.dexterity || 10,
      con: stats.constitution || 10,
      int: stats.intelligence || 10,
      wis: stats.wisdom || 10,
      cha: stats.charisma || 10,
    };

    const level = character.level || 1;

    // Extract actual equipment items
    const equipmentForDeriver =
      character.inventory
        ?.filter((entry: { isEquipped: boolean; item: any }) => entry.isEquipped && entry.item)
        .map((entry: { item: any }) => {
          const item = entry.item;
          const eqData = item.equipment_data || {};
          return {
            ...item,
            ...eqData, // Flatten equipment_data
            equipment_category: { slug: item.type }, // Shim for legacy compatibility
            isEquipped: true,
          };
        }) || [];

    // Extract Spells
    const activeSpells = [
      ...(character.spell_config?.prepared_spells || []),
      ...(character.spell_config?.known_spells || []),
    ];

    // Calculate Stats
    const derived = EntityDeriver.derive({
      attributes: attributes,
      classes:
        character.classes?.map((c: { class: { name: string; hit_die: string }; level: number }) => ({
          name: c.class?.name || 'Unknown',
          level: c.level,
          hitDie: c.class?.hit_die,
        })) || [],
      level: level,
      proficiencyBonus: undefined,
      equipment: equipmentForDeriver,
      hitDie: hitDie,
      race: {
        speed: character.race?.speed,
      },
      spells: activeSpells,
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

    // Collect Proficiencies (Race + Class)
    const profIds = new Set<string>();
    character.race?.proficiencies?.forEach((p: any) => profIds.add(p.documentId));
    character.classes?.forEach((c: any) => {
      c.class?.proficiencies?.forEach((p: any) => profIds.add(p.documentId));
    });

    // Collect Traits (Race)
    const traitIds = new Set<string>();
    character.race?.traits?.forEach((t: any) => traitIds.add(t.documentId));

    // Handle Features (Class - Component vs Relation)
    // Currently Class uses Features Component. We cannot link them as relations unless we migrate Class schema.
    // For now, we leave features relation empty for Characters unless we find Entity features.
    // OPTION: If we want to populate valid data, we might need to convert Class features to text and put them... nowhere?
    // Since EntitySheet expects Relation.
    // Given the strict "Entity" directive, we only populate if we have Entities.
    // If Class Features are components, they are lost in this strict translation until Class is refactored.
    // However, we can check if `character` has any direct features (not in schema yet).

    const mappedActions = (character.actions || []).map((action: any) => action.documentId);

    const sheetData: any = {
      name: character.name,
      type: ownerId ? 'player' : 'npc',
      owner: ownerId,
      character: character.documentId,
      room: room.documentId,
      hp: derived.hp,
      maxHp: derived.maxHp,
      ac: derived.ac,
      armorClass: derived.ac,
      speed: derived.speed,
      level: level,
      experience: 0,
      position: position,
      stats: character.stats,
      race: character.race?.documentId,
      class: mainClass?.documentId,
      actions: mappedActions,
      inventory: (character.inventory || []).map((entry: any) => ({
        item: entry.item?.documentId,
        quantity: entry.quantity ?? 1,
        slot: entry.slot ?? 'backpack',
        isEquipped: entry.isEquipped ?? false,
      })),
      spellbook: {
        knownSpells: character.spell_config?.known_spells?.map((s: any) => s.documentId),
        preparedSpells: character.spell_config?.prepared_spells?.map((s: any) => s.documentId),
        spellcastingAbility: 'intelligence', // TODO: Derive from Class
        spellSaveDc: 8 + (derived.proficiencyBonus || 2), // TODO: Add Mod
        spellAttackBonus: derived.proficiencyBonus || 2, // TODO: Add Mod
      },
      proficiencies: Array.from(profIds),
      traits: Array.from(traitIds),
      languages: [], // TODO: Race languages relation
      features: [], // Empty for now as Class features are components
      // attributes: removed as not in schema
      initiative: 0,
      proficiencyBonus: derived.proficiencyBonus,
    };

    const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: sheetData,
      status: 'published',
    });

    return newSheet;
  },

  /**
   * Router for generic spawn command (Agent support)
   */
  async spawn(roomId: string, payload: any) {
    console.info(`[SpawnService] Router received spawn command: ${JSON.stringify(payload)}`);
    const { type, blueprintId, position, ownerId } = payload;

    // Normalize position
    const pos = {
      x: typeof position === 'object' ? position.x : undefined,
      y: typeof position === 'object' ? position.y : undefined,
      z: typeof position === 'object' ? position.z : 0,
    };

    // Fallback if flat coords provided
    if (pos.x === undefined && typeof payload.x === 'number') pos.x = payload.x;
    if (pos.y === undefined && typeof payload.y === 'number') pos.y = payload.y;
    if (pos.z === undefined && typeof payload.z === 'number') pos.z = payload.z;

    if (pos.x === undefined || pos.y === undefined) {
      throw new Error('Position (x,y) is required for spawn');
    }

    if (type === 'monster') {
      return this.spawnMonster(roomId, blueprintId, pos);
    } else if (type === 'player' || type === 'character' || type === 'npc') {
      return this.spawnCharacter(roomId, blueprintId, pos, ownerId);
    } else {
      throw new Error(`Unknown entity type: ${type}`);
    }
  },
});
