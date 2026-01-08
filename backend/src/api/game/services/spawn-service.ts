/**
 * Spawn Service
 * Handles instantiation of Characters and Monsters into the game world.
 */

import { EntityDeriver, EntitySheet, StatBlock, ActionDefinition } from '../../../engine';

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
      populate: [
        'stats',
        'structuredActions',
        'structuredActions.damage',
        'features',
        'equipment',
        'equipment.item',
        'equipment.item.equipment_category',
        'equipment.item.damage_type',
        'equipment.item.properties',
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

    // 3. Create Character Sheet
    // Use monster stats
    const stats: Partial<StatBlock> = monster.stats || {};

    // Extract actual equipment items if monster has equipment component (Phase 1.3)
    const equipmentForDeriver =
      monster.equipment?.filter((entry: any) => entry.isEquipped && entry.item).map((entry: any) => entry.item) || [];

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
      innateActions: monster.structuredActions, // Pass blueprint actions as innate
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

      const sheetData: Partial<EntitySheet> & {
        monster: string;
        room: string;
        type: 'monster';
        position: { x: number; y: number; z: number };
      } = {
        name: monster.name,
        type: 'monster',
        monster: monster.documentId,
        room: room.documentId,
        hp: derived.hp,
        maxHp: derived.maxHp, // Blueprint or derived
        armorClass: derived.ac, // Blueprint or derived. Mapped to armorClass for EntitySheet
        speed: { walk: (typeof monster.speed === 'number' ? monster.speed : 0) || derived.speed.walk },
        level: derived.level,
        xp: monster.xp || 0,
        position: position,
        // stats: monster.stats, // REMOVED: Not in EntitySheet schema, using attributes instead
        structuredActions: derived.structuredActions,
        features: monster.features || [],

        // Satisfy EntitySheet strictness with defaults
        attributes: monster.stats as any, // Legacy mapping for now until attributes keys are strict
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
        'classes',
        'classes.class',
        'equipment',
        'equipment.item',
        'equipment.item.damage_type',
        'equipment.item.equipment_category',
        'equipment.item.properties',
        'spell_config',
        'spell_config.prepared_spells',
        'spell_config.prepared_spells.casting_config',
        'spell_config.prepared_spells.range_config',
        'spell_config.prepared_spells.duration_config',
        'spell_config.prepared_spells.mechanics_config',
        'spell_config.prepared_spells.damage_instances',
        'spell_config.prepared_spells.condition_instances',
        'spell_config.known_spells',
        'spell_config.known_spells.casting_config',
        'spell_config.known_spells.range_config',
        'spell_config.known_spells.duration_config',
        'spell_config.known_spells.mechanics_config',
        'spell_config.known_spells.damage_instances',
        'spell_config.known_spells.condition_instances',
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

    // Parse Hit Die from Class (e.g., "1d8" -> 8)
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
      character.equipment?.filter((entry: any) => entry.isEquipped && entry.item).map((entry: any) => entry.item) || [];

    // Extract Spells (Prepared + Known)
    // We combine them into a single list for the Deriver to hydrate.
    // Logic: If prepared casters, use prepared. If known casters, use known.
    // For now, we just unite them all.
    const activeSpells = [
      ...(character.spell_config?.prepared_spells || []),
      ...(character.spell_config?.known_spells || []),
    ];

    // Calculate Stats
    const derived = EntityDeriver.derive({
      attributes: attributes,
      // Pass full classes array for multiclass support (Deriver calculates total level & PB)
      classes:
        character.classes?.map((c: any) => ({
          name: c.class?.name || 'Unknown',
          level: c.level,
          hitDie: c.class?.hit_die,
        })) || [],
      // Fallback for single class if array empty?
      level: level,
      proficiencyBonus: undefined, // Let deriver calculate it
      equipment: equipmentForDeriver,
      hitDie: hitDie, // Global hitDie fallback
      race: {
        speed: character.race?.speed,
      },
      spells: activeSpells, // Pass to Context
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

    const sheetData: Partial<EntitySheet> & {
      character: string;
      room: string;
      type: 'player' | 'npc';
      owner?: string;
      position: { x: number; y: number; z: number };
    } = {
      name: character.name,
      type: ownerId ? 'player' : 'npc',
      owner: ownerId, // Assign owner relation
      character: character.documentId,
      room: room.documentId,
      hp: derived.hp,
      maxHp: derived.maxHp,
      armorClass: derived.ac, // Snapshot Derived AC
      speed: derived.speed, // Snapshot Speed
      level: level,
      xp: 0,
      position: position,
      // stats: (() => { ... })(), // REMOVED
      race: character.race?.documentId,
      class: mainClass?.documentId,
      structuredActions: derived.structuredActions?.map((action: ActionDefinition) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = action as any; // Remove ID to generate fresh or let DB handle?
        // If action has ID from blueprint, we might want to keep it or drop it.
        // EntityDeriver generates IDs for Equipment actions.
        return rest;
      }),
      features: [],

      attributes: character.stats as any,
      initiative: 0,
      proficiencyBonus: derived.proficiencyBonus,
    };

    const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      data: sheetData,
      status: 'published',
    });

    return newSheet;
  },
});
