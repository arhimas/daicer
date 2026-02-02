/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
/**
 * Spawn Service
 * Handles instantiation of Characters and Monsters into the game world.
 */

import { EntityDeriver, StatBlock } from '../src/engine';
import { BlueprintSchema, SpawnPayloadSchema } from '../schemas/gateway-schemas';

import { Core } from '@strapi/strapi';

// Define Interfaces for strict typing
interface InventoryItem {
  isEquipped: boolean;
  quantity?: number;
  slot?: string;
  item: {
    documentId: string;
    name: string;
    type: string;
    equipment_data?: Record<string, unknown>;
  } | null;
}

interface PopulatedBlueprint {
  documentId: string;
  name: string;
  type: string;
  stats?: Partial<StatBlock>;
  level?: number;
  hp?: number;
  ac?: number;
  challenge_rating?: number;
  xp?: number;
  speed?: number | { walk: number };
  inventory?: InventoryItem[];
  actions?: Array<{ documentId: string }>;
  features?: Array<{ documentId: string }>;
  traits?: Array<{ documentId: string }>;
  proficiencies?: Array<{ documentId: string }>;
  languages?: Array<{ documentId: string }>;

  // Character specific
  race?: {
    documentId: string;
    speed?: { walk: number };
    proficiencies?: Array<{ documentId: string }>;
    traits?: Array<{ documentId: string }>;
  };
  classes?: Array<{
    level: number;
    class?: {
      documentId: string;
      name: string;
      hit_die: string;
      proficiencies?: Array<{ documentId: string }>;
      features?: unknown; // Component
    };
  }>;
  spell_config?: {
    prepared_spells?: Array<{ documentId: string; name?: string }>;
    known_spells?: Array<{ documentId: string; name?: string }>;
  };
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Spawns a monster into a room by creating a fully populated EntitySheet.
   * Resolves the blueprint, derives stats, and places the entity.
   *
   * @param roomId - The target room.
   * @param monsterId - The monster blueprint ID (documentId).
   * @param position - The spawn coordinates.
   * @returns The created EntitySheet.
   */
  async spawnMonster(
    roomId: string | number,
    monsterId: string | number,
    position: { x: number; y: number; z: number }
  ) {
    // 1. Fetch Entity Blueprint
    const rawMonster = (await strapi.documents('api::entity.entity').findOne({
      documentId: monsterId as string, // Try documentId first
      populate: [
        'stats',
        'actions',
        'actions.damage_instances',
        'features',
        'inventory',
        'inventory.item',
        'inventory.item.equipment_data',
        'inventory.item.equipment_data.damage_type',
        'inventory.item.equipment_data.properties',
        'proficiencies',
        'languages',
        'traits',
      ],
    })) as unknown as PopulatedBlueprint | null;

    if (!rawMonster) {
      throw new Error(`Monster blueprint not found: ${monsterId}`);
    }

    // VALIDATE BLUEPRINT
    const monster = BlueprintSchema.parse(rawMonster);

    // 2. Fetch Room from documentId OR roomId field
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: { $eq: roomId as string } }, { roomId: { $eq: roomId as string } }],
      },
      limit: 1,
    });
    const room = rooms[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = room as any;

    if (!room) {
      console.error(`[SpawnService] Room not found. Input ID: ${roomId}`);
      throw new Error(`Room not found: ${roomId}`);
    }

    console.info(
      `[SpawnService] Found Room for Monster Spawn: ${room.documentId} (Name: ${r.name}, Locale: ${r.locale})`
    );

    // 3. Create Entity Sheet
    // Use monster stats
    const stats: Partial<StatBlock> = monster.stats || {};

    // Extract actual equipment items
    const equipmentForDeriver =
      monster.inventory
        ?.filter((entry) => entry.isEquipped && entry.item)
        .map((entry) => {
          const item = entry.item!;
          const eqData = item.equipment_data || {};
          return {
            ...item,
            name: (item.name as string) || 'Unknown Item',
            ...eqData, // Flatten equipment_data
            equipment_category: { slug: item.type || 'misc' }, // Shim for legacy compatibility
            isEquipped: true,
          };
        }) || [];

    const derived = EntityDeriver.derive({
      stats: {
        strength: stats.strength || 10,
        dexterity: stats.dexterity || 10,
        constitution: stats.constitution || 10,
        intelligence: stats.intelligence || 10,
        wisdom: stats.wisdom || 10,
        charisma: stats.charisma || 10,
      },
      attributes: {
        strength: stats.strength || 10,
        dexterity: stats.dexterity || 10,
        constitution: stats.constitution || 10,
        intelligence: stats.intelligence || 10,
        wisdom: stats.wisdom || 10,
        charisma: stats.charisma || 10,
      },
      level: monster.level || Math.max(1, Math.floor(monster.challenge_rating || 1)),
      proficiencyBonus: 2, // Default
      isMonster: true,
      equipment: equipmentForDeriver,
      innateActions: [],
      race: {
        speed: (monster.speed as unknown as { walk: number }) || { walk: 30 },
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

      const mappedActions = (monster.actions || []).filter((a) => a && a.documentId).map((action) => action.documentId);

      console.info(`[SpawnService] Mapped Actions IDs: ${JSON.stringify(mappedActions)}`);

      const sheetData = {
        name: monster.name,
        type: 'monster',
        entity: monster.documentId,
        room: room.documentId,
        hp: derived.hp,
        maxHp: derived.maxHp,
        ac: derived.ac, // Mapped to ac (or armorClass in schema)
        armorClass: derived.ac,
        speed: (typeof monster.speed === 'number' ? { walk: monster.speed } : monster.speed) || derived.speed,
        level: derived.level,
        experience: monster.xp || 0,
        position: position,
        stats: monster.stats, // Component
        actions: mappedActions,
        inventory: (monster.inventory || []).map((entry) => ({
          item: entry.item?.documentId,
          quantity: entry.quantity ?? 1,
          slot: entry.slot ?? 'backpack',
          isEquipped: entry.isEquipped ?? false,
        })),
        features: monster.features?.map((f) => f.documentId), // Relation ID list
        traits: monster.traits?.map((t) => t.documentId), // Relation ID list
        proficiencies: monster.proficiencies?.map((p) => p.documentId), // Relation ID list
        languages: monster.languages?.map((l) => l.documentId), // Relation ID list
        initiative: 0,
        proficiencyBonus: derived.proficiencyBonus || 2,
      };

      const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: sheetData as any,
        status: 'published',
      });
      console.info(`[SpawnService] EntitySheet Created: ${newSheet.documentId}`);

      // 5. Derive Stats (Unify Schema)
      await strapi.service('api::game.entity-derivation').deriveAndPersist(newSheet.documentId);

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
    const character = (await strapi.documents('api::entity.entity').findOne({
      documentId: characterId as string,
      populate: [
        'stats',
        'race',
        'race.proficiencies',
        'race.traits',
        'race.speed',
        'classes',
        'classes.class',
        'classes.class.proficiencies',
        'classes.class.features',
        'inventory',
        'inventory.item',
        'inventory.item.equipment_data',
        'inventory.item.equipment_data.damage_type',
        'inventory.item.equipment_data.properties',
        'actions',
        'spells',
      ],
    })) as unknown as PopulatedBlueprint | null;

    if (!character) throw new Error('Character blueprint not found');

    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: { $eq: roomId as string } }, { roomId: { $eq: roomId as string } }],
      },
      populate: { world: true },
      limit: 1,
    });
    const room = rooms[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = room as any;

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

    console.info(`[SpawnService] Found Room: ${room.documentId} (Name: ${r.name || 'Unknown'})`);
    console.info(`[SpawnService] Creating EntitySheet for character: ${character.name} in room: ${room.documentId}`);

    // Prepare Derivation Context
    const stats: Partial<StatBlock> = character.stats || {};
    const attributes = {
      strength: stats.strength || 10,
      dexterity: stats.dexterity || 10,
      constitution: stats.constitution || 10,
      intelligence: stats.intelligence || 10,
      wisdom: stats.wisdom || 10,
      charisma: stats.charisma || 10,
    };

    const level = character.level || 1;

    // Extract actual equipment items
    const equipmentForDeriver =
      character.inventory
        ?.filter((entry) => entry.isEquipped && entry.item)
        .map((entry) => {
          const item = entry.item!;
          const eqData = item.equipment_data || {};
          return {
            ...item,
            name: item.name,
            ...eqData, // Flatten equipment_data
            equipment_category: { slug: item.type || 'misc' }, // Shim for legacy compatibility
            isEquipped: true,
          };
        }) || [];

    // Extract Spells
    const activeSpells = [
      ...(character.spell_config?.prepared_spells || []),
      ...(character.spell_config?.known_spells || []),
    ].map((s) => ({ ...s, id: s.documentId, name: s.name || 'Unknown Spell' }));

    // Calculate Stats
    const derived = EntityDeriver.derive({
      stats: attributes,
      attributes: attributes,
      classes:
        character.classes?.map((c) => ({
          name: c.class?.name || 'Unknown',
          level: c.level,
        })) || [],
      level: level,
      proficiencyBonus: undefined,
      equipment: equipmentForDeriver,
      hitDie: hitDie, // Number is allowed now
      race: {
        speed: (character.race?.speed as unknown as { walk: number }) || { walk: 30 }, // Handle strictly
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spells: activeSpells as any,
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
    character.race?.proficiencies?.forEach((p) => profIds.add(p.documentId));
    character.classes?.forEach((c) => {
      c.class?.proficiencies?.forEach((p) => profIds.add(p.documentId));
    });

    // Collect Traits (Race)
    const traitIds = new Set<string>();
    character.race?.traits?.forEach((t) => traitIds.add(t.documentId));

    const mappedActions = (character.actions || []).map((action) => action.documentId);

    // Using partial EntitySheet type to avoid heavy casting on creation
    const sheetData = {
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
      inventory: (character.inventory || []).map((entry) => ({
        item: entry.item?.documentId,
        quantity: entry.quantity ?? 1,
        slot: entry.slot ?? 'backpack',
        isEquipped: entry.isEquipped ?? false,
      })),
      spellbook: {
        knownSpells: character.spell_config?.known_spells?.map((s) => s.documentId),
        preparedSpells: character.spell_config?.prepared_spells?.map((s) => s.documentId),
        spellcastingAbility: 'intelligence', // TODO: Derive from Class
        spellSaveDc: 8 + (derived.proficiencyBonus || 2), // TODO: Add Mod
        spellAttackBonus: derived.proficiencyBonus || 2, // TODO: Add Mod
      },
      proficiencies: Array.from(profIds),
      traits: Array.from(traitIds),
      languages: [],
      features: [],
      initiative: 0,
      proficiencyBonus: derived.proficiencyBonus,
    };

    const newSheet = await strapi.documents('api::entity-sheet.entity-sheet').create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: sheetData as any,
      status: 'published',
    });

    // 5. Derive Stats (Unify Schema)
    await strapi.service('api::game.entity-derivation').deriveAndPersist(newSheet.documentId);

    return newSheet;
  },

  /**
   * Router for generic spawn command (Agent support)
   */
  async spawn(roomId: string, rawPayload: unknown) {
    console.info(`[SpawnService] Router received spawn command: ${JSON.stringify(rawPayload)}`);

    // Normalize Input (handling flat coords for backward compat if needed, simplified here)
    const rp = rawPayload as { position?: { x: number; y: number; z: number }; x?: number; y?: number; z?: number };

    const payloadInput = {
      ...rp,
      position: rp.position || {
        x: rp.x,
        y: rp.y,
        z: rp.z,
      },
    };

    // VALIDATE INPUT
    const payload = SpawnPayloadSchema.parse(payloadInput);

    if (payload.type === 'monster') {
      return this.spawnMonster(roomId, payload.blueprintId, payload.position);
    } else {
      return this.spawnCharacter(roomId, payload.blueprintId, payload.position, payload.ownerId);
    }
  },
});
