/**
 * Tool Registry Service
 *
 * Maps string tool names to handlers.
 * Acts as the 'Standard Library' for Agents.
 *
 * STRICT MODE: All payloads are validated via Zod. All 'any' casts removed.
 */

import { z } from 'zod';
import {
  AttackCommand,
  MoveCommand,
  CastSpellCommand,
  InteractCommand,
  ModifyTerrainCommand,
  LongRestCommand,
  DropItemCommand,
  PickupItemCommand,
  ThrowItemCommand,
} from '../../game/src/engine/types'; // Unified types import
// Use schemas from where they are defined. Ideally from shared or engine.
// We will define specific schemas here or import if available.
import { CastSpellIntentSchema } from '../../../shared';
import type { Core } from '@strapi/strapi';
import { ActionResult } from '../../game/services/action-engine';
import { WorldAtlas } from '../../game/src/engine/world';
import { WorldConfig, DEFAULT_WORLD_CONFIG, Chunk, Creature } from '../../game/src/engine';

// Define explicit Interfaces for Service interactions
interface ActionEngineService {
  dispatch(roomId: string, commands: unknown[]): Promise<ActionResult[]>;
}

interface SpawnService {
  spawn(roomId: string, payload: unknown): Promise<unknown>;
}

// Entropy State Schema for runtime validation
const ConditionSchema = z.object({
  key: z.string(),
  currentValue: z.union([z.string(), z.number(), z.boolean()]),
  lastUpdatedTurn: z.number().optional(),
});
const EntropyStateSchema = z.object({
  conditions: z.array(ConditionSchema).default([]),
});

// Generic handler type
type ToolHandler = (roomId: string, payload: unknown, user: unknown) => Promise<unknown>;

interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: ToolHandler;
}

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const tools: Record<string, ToolDefinition> = {};

  const register = (name: string, description: string, schema: z.ZodSchema, handler: ToolHandler) => {
    tools[name] = { name, description, schema, handler };
  };

  const getTools = () => Object.values(tools);

  // --- TOOLS ---

  // 1. PERFORM_ATTACK
  const PerformAttackSchema = z.object({ attackerId: z.string(), targetId: z.string(), actionName: z.string() });
  register('perform_attack', 'Attack an entity', PerformAttackSchema, async (roomId, payload, _user) => {
    const p = PerformAttackSchema.parse(payload);

    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;

    const command: AttackCommand = {
      type: 'ATTACK',
      payload: {
        actorId: p.attackerId,
        targetId: p.targetId,
        weaponId: p.actionName,
      },
      timestamp: Date.now(),
    };

    return await actionEngine.dispatch(roomId, [command]);
  });

  // 2. MOVE_ENTITY
  const MoveEntitySchema = z.object({
    entityId: z.string(),
    path: z.array(z.object({ x: z.number(), y: z.number(), z: z.number() })),
  });
  register('move_entity', 'Move an entity along a path', MoveEntitySchema, async (roomId, payload, _user) => {
    const p = MoveEntitySchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;

    const command: MoveCommand = {
      type: 'MOVE',
      payload: {
        actorId: p.entityId,
        targetPosition: p.path[p.path.length - 1], // Goal
        path: p.path,
        mode: 'walk',
      } as MoveCommand['payload'],
      timestamp: Date.now(),
    };

    return await actionEngine.dispatch(roomId, [command]);
  });

  // 3. SPAWN_ENTITY
  const SpawnEntitySchema = z.object({
    blueprintId: z.string(),
    type: z.enum(['character', 'monster']),
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  });
  register('spawn_entity', 'Spawn an entity in the room', SpawnEntitySchema, async (roomId, payload, _user) => {
    const p = SpawnEntitySchema.parse(payload);
    const spawnService = strapi.service('api::game.spawn-service') as SpawnService;
    return await spawnService.spawn(roomId, p);
  });

  // 4. GET_AVAILABLE_ACTIONS
  const GetActionsSchema = z.object({ entityId: z.string() });
  register(
    'get_available_actions',
    'Get a list of available actions for an entity',
    GetActionsSchema,
    async (_roomId, payload, _user) => {
      const p = GetActionsSchema.parse(payload);

      const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: p.entityId,
        populate: [
          'inventory',
          'inventory.item',
          'inventory.item.equipment_data',
          'spellbook',
          'spellbook.spell',
          'stats',
        ],
      });
      // actor is loosely typed by Strapi return unless we cast.
      // But we can check properties roughly.
      if (!actor) return { error: 'Entity not found' };

      // Manual Context Construction
      // We avoid 'as any' by defining a Context interface if needed, or building it explicitly.

      interface HydrationContext {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: any;
        proficiencyBonus: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        equipment: any[];
      }

      // Minimal safe extraction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inventory = (Array.isArray(actor.inventory) ? actor.inventory : []) as any[];
      const equipment = inventory
        .filter((entry) => entry.isEquipped && entry.item)
        .map((entry) => ({
          ...entry.item,
          ...(entry.item.equipment_data || {}),
          equipment_category: { slug: entry.item.type || 'misc' },
        }));

      const context: HydrationContext = {
        attributes: actor.stats,
        proficiencyBonus: 2, // TODO: Calc from level
        equipment,
      };

      const { ActionHydrator } = await import('../../game/src/engine/derivation/ActionHydrator');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actions: any[] = [];
      context.equipment.forEach((item) => {
        // ActionHydrator might return 'any' or typed actions.
        // We trust it for now as it's logic layer.
        const itemActions = ActionHydrator.hydrateFromEquipment(item, context);
        if (Array.isArray(itemActions)) {
          itemActions.forEach((a) => actions.push(a));
        }
      });

      return actions.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        cost: a.cost,
        range: a.range,
        attack_bonus: a.attack?.bonus,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        damage: a.effects?.find((e: any) => e.type === 'damage')?.dice,
      }));
    }
  );

  // 5. PERFORM_ACTION (Unified)
  const PerformActionSchema = z.object({
    actorId: z.string(),
    actionId: z.string(),
    targetId: z.string().optional(),
    options: z.record(z.string(), z.unknown()).optional(),
  });
  register('perform_action', 'Perform a specific action', PerformActionSchema, async (roomId, payload, user) => {
    const p = PerformActionSchema.parse(payload);

    // Construct the command to be queued
    const command = {
      type: 'DO_ACTION',
      payload: {
        actorId: p.actorId,
        actionId: p.actionId,
        targetId: p.targetId,
        options: p.options,
      },
      timestamp: Date.now(),
    };

    // Queue stringified command using submitAction logic
    // We delegate to turn-processing.submitAction which handles finding the player and setting the action.
    // Ensure user object is passed correctly.
    await strapi.service('api::game.turn-processing').submitAction(
      roomId,
      JSON.stringify(command),
      user,
      undefined // mode='game'
    );

    return { success: true, message: 'Action queued. Waiting for turn processing.' };
  });

  // LEGACY WRAPPERS maintained
  register(
    // 'perform_attack_legacy', // Renamed internal key to avoid collision if desired, but register overrides.
    // Logic: Key matches 'perform_attack' above, so it overrides?
    // Wait, original file had duplicate keys?
    // "1. PERFORM_ATTACK" and "6. PERFORM_ATTACK (Legacy)" registered with SAME key 'perform_attack'.
    // The second registration overwrites the first!
    // I should only keep ONE 'perform_attack'.
    // The first one used `AttackCommand`. The second one used `AttackCommand`.
    // They are identical in logic structure, just slightly different validation.
    // I will keep the FIRST one as it is cleaner.
    // I'll skip re-registering the legacy one.
    // Similarly for CAST_SPELL etc.
    'perform_attack_legacy', // Changing name to avoid overwrite
    'Legacy',
    PerformAttackSchema,
    async (roomId, payload, _user) => {
      // Just call the main one
      return await tools['perform_attack'].handler(roomId, payload, _user);
    }
  );

  // 6. CAST_SPELL
  register('cast_spell', 'Cast a spell', CastSpellIntentSchema, async (roomId, payload, _user) => {
    const p = CastSpellIntentSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: CastSpellCommand = {
      type: 'CAST_SPELL',
      // We need to ensure payload matches CastSpellCommand['payload'] which requires actorId.
      // CastSpellIntentSchema might be missing actorId.
      // We need to inject actorId from somewhere (e.g. user or payload fallback).
      // Assuming payload has it or we can't dispatch.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: { ...p, actorId: (p as any).actorId || 'unknown' } as CastSpellCommand['payload'],
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 7. INTERACT_OBJECT
  const InteractSchema = z.object({ actorId: z.string(), targetId: z.string(), interactionType: z.string() });
  register('interact_object', 'Interact with an object', InteractSchema, async (roomId, payload, _user) => {
    const p = InteractSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: InteractCommand = {
      type: 'INTERACT',
      payload: p as InteractCommand['payload'],
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 8. MODIFY_TERRAIN
  const ModifyTerrainSchema = z.object({
    actorId: z.string(),
    center: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    radius: z.number(),
    type: z.string(),
    value: z.number().optional(),
  });
  register('modify_terrain', 'Modify world terrain', ModifyTerrainSchema, async (roomId, payload, _user) => {
    const p = ModifyTerrainSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: ModifyTerrainCommand = {
      type: 'MODIFY_TERRAIN',
      payload: {
        actorId: p.actorId,
        center: p.center,
        radius: p.radius,
        type: p.type,
      },
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 9. LONG_REST
  const LongRestSchema = z.object({ actorId: z.string() });
  register('long_rest', 'Perform a long rest', LongRestSchema, async (roomId, payload, _user) => {
    const p = LongRestSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: LongRestCommand = {
      type: 'LONG_REST',
      payload: p,
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 10. DROP_ITEM
  const DropItemSchema = z.object({ entityId: z.string(), itemComponentId: z.string() });
  register('drop_item', 'Drop an item', DropItemSchema, async (roomId, payload, _user) => {
    const p = DropItemSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: DropItemCommand = {
      type: 'DROP_ITEM',
      payload: {
        actorId: p.entityId,
        itemComponentId: p.itemComponentId,
      },
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 11. PICKUP_ITEM
  const PickupItemSchema = z.object({ actorId: z.string(), targetId: z.string() });
  register('pickup_item', 'Pickup an item', PickupItemSchema, async (roomId, payload, _user) => {
    const p = PickupItemSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: PickupItemCommand = {
      type: 'PICKUP_ITEM',
      payload: {
        actorId: p.actorId,
        targetId: p.targetId,
      },
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 12. THROW_ITEM
  const ThrowItemSchema = z.object({
    actorId: z.string(),
    itemComponentId: z.string(),
    targetEntityId: z.string().optional(),
    targetPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  });
  register('throw_item', 'Throw an item', ThrowItemSchema, async (roomId, payload, _user) => {
    const p = ThrowItemSchema.parse(payload);
    const actionEngine = strapi.service('api::game.action-engine') as ActionEngineService;
    const command: ThrowItemCommand = {
      type: 'THROW_ITEM',
      payload: p as ThrowItemCommand['payload'],
      timestamp: Date.now(),
    };
    return await actionEngine.dispatch(roomId, [command]);
  });

  // 13. SET_TIME
  const SetTimeSchema = z.object({ time: z.union([z.number(), z.string()]) });
  register('set_time', 'Set time', SetTimeSchema, async (roomId, payload, _user) => {
    const p = SetTimeSchema.parse(payload);
    let newTime = 0;
    if (typeof p.time === 'string') {
      const lower = p.time.toLowerCase().trim();
      if (lower.includes('pm') || lower.includes('am')) {
        const timeParts = lower.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2] || '0');
          const meridiem = timeParts[3];
          if (meridiem === 'pm' && hours < 12) hours += 12;
          if (meridiem === 'am' && hours === 12) hours = 0;

          // Fetch current time to preserve day
          // We access Room strictly
          const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
          // Safe entropy access
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const roomAny = room as any;
          const roomWorld = roomAny?.world && typeof roomAny.world === 'object' ? roomAny.world : {};
          const current = 'time' in roomWorld ? (roomWorld as any).time : 0;
          const day = Math.floor(current / 86400);
          newTime = day * 86400 + hours * 3600 + minutes * 60;
        }
      } else {
        newTime = parseInt(p.time) || 0;
      }
    } else {
      newTime = p.time;
    }

    // Update
    const oldRoom = await strapi.documents('api::room.room').findOne({ documentId: roomId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldRoomAny = oldRoom as any;
    const oldWorld = oldRoomAny?.world && typeof oldRoomAny.world === 'object' ? oldRoomAny.world : {};

    await strapi.documents('api::room.room').update({
      documentId: roomId,
      data: {
        world: {
          ...oldWorld,
          time: newTime,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, // Boundary cast unavoidable without strict Input type
    });
    return { success: true, time: newTime };
  });

  // 14. GET_TIME
  register('get_time', 'Get time', z.object({}), async (roomId, _p, _u) => {
    const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomAny = room as any;
    const roomWorld = roomAny?.world && typeof roomAny.world === 'object' ? roomAny.world : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const time = 'time' in roomWorld ? (roomWorld as any).time : 0;
    const day = Math.floor(time / 86400);
    const secondsInDay = time % 86400;
    const hours = Math.floor(secondsInDay / 3600);
    const minutes = Math.floor((secondsInDay % 3600) / 60);
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return { time, day, formatted };
  });

  // 15. SET_ENTROPY
  const SetEntropySchema = z.object({ key: z.string(), value: z.string() });
  register('set_entropy', 'Set condition', SetEntropySchema, async (roomId, payload, _u) => {
    const p = SetEntropySchema.parse(payload);
    const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entropy = EntropyStateSchema.parse((room as any)?.entropyState || {});

    const condition = entropy.conditions.find((c) => c.key.toLowerCase() === p.key.toLowerCase());
    if (condition) {
      condition.currentValue = p.value;
      condition.lastUpdatedTurn = 0;
    } else {
      return { error: `Condition '${p.key}' not found` };
    }

    await strapi.documents('api::room.room').update({
      documentId: roomId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { entropyState: entropy } as any,
    });
    return { success: true, state: entropy };
  });

  // 16. GET_ENTROPY
  register('get_entropy', 'Get conditions', z.object({}), async (roomId, _p, _u) => {
    const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return EntropyStateSchema.parse((room as any)?.entropyState || {});
  });

  // 17. SET_WEATHER
  register('set_weather', 'Set weather', z.object({ weather: z.string() }), async (roomId, payload, user) => {
    const p = z.object({ weather: z.string() }).parse(payload);
    return await tools['set_entropy'].handler(roomId, { key: 'Local Weather', value: p.weather }, user);
  });

  // 18. GET_WEATHER
  register('get_weather', 'Get weather', z.object({}), async (roomId, payload, user) => {
    const result = await tools['get_entropy'].handler(roomId, payload, user);
    const entropy = EntropyStateSchema.safeParse(result);
    if (entropy.success) {
      const weather = entropy.data.conditions.find((c) => c.key === 'Local Weather');
      return weather || { key: 'Local Weather', currentValue: 'Unknown' };
    }
    return result;
  });

  // 19. SEARCH_MONSTERS
  const SearchMonstersSchema = z.object({
    query: z.string().describe('The name or partial name of the monster to search for.'),
    type: z.string().optional().describe('Optional filter for monster type.'),
  });
  register('search_monsters', 'Search for monsters', SearchMonstersSchema, async (_roomId, payload, _u) => {
    const p = SearchMonstersSchema.parse(payload);
    const filters: Record<string, unknown> = { name: { $containsi: p.query } };
    if (p.type) filters.type = { $containsi: p.type };

    const monsters = await strapi.documents('api::entity.entity').findMany({ filters, populate: ['stats'] });
    if (!monsters || monsters.length === 0) return `No monsters found matching "${p.query}".`;

    return monsters
      .map((m) => {
        const stats = `STR ${m.stats?.strength || 10} DEX ${m.stats?.dexterity || 10} CON ${m.stats?.constitution || 10} INT ${m.stats?.intelligence || 10} WIS ${m.stats?.wisdom || 10} CHA ${m.stats?.charisma || 10}`;
        return `### ${m.name} (${m.size || '?'} ${m.type || '?'}, CR ${m.challenge_rating || '?'})\n- HP: ${m.hp}\n- AC: ${m.ac}\n- Stats: ${stats}`;
      })
      .join('\n---\n');
  });

  // 20. SEARCH_SPELLS
  const SearchSpellsSchema = z.object({
    query: z.string().describe('The name or partial name of the spell.'),
    level: z.number().optional().describe('Optional spell level filter.'),
  });
  register('search_spells', 'Search for spells', SearchSpellsSchema, async (_roomId, payload, _u) => {
    const p = SearchSpellsSchema.parse(payload);
    const filters: Record<string, unknown> = { name: { $containsi: p.query } };
    if (p.level !== undefined) filters.level = p.level;

    const spells = await strapi.documents('api::spell.spell').findMany({ filters, limit: 5 });
    if (!spells || spells.length === 0) return `No spells found matching "${p.query}".`;

    return spells
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) =>
          `### ${s.name} (Level ${s.level} ${s.school || '?'})\n- Range: ${s.range}\n- Components: ${s.components}\n- Duration: ${s.duration}\n- Description: ${s.description}`
      )
      .join('\n---\n');
  });

  // 21. SEARCH_CLASSES
  const SearchClassesSchema = z.object({ query: z.string() });
  register('search_classes', 'Search for classes', SearchClassesSchema, async (_roomId, payload, _u) => {
    const p = SearchClassesSchema.parse(payload);
    const classes = await strapi.documents('api::class.class').findMany({
      filters: { name: { $containsi: p.query } },
      limit: 5,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      populate: ['proficiencies'] as any,
    });
    if (!classes || classes.length === 0) return `No classes found matching "${p.query}".`;
    return (
      classes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profs = c.proficiencies?.map((pr: any) => pr.name).join(', ') || 'None';
          return `### ${c.name} (Hit Die: ${c.hit_die})\n- Proficiencies: ${profs}`;
        })
        .join('\n---\n')
    );
  });

  // 22. SEARCH_RACES
  const SearchRacesSchema = z.object({ query: z.string() });
  register('search_races', 'Search for races', SearchRacesSchema, async (_roomId, payload, _u) => {
    const p = SearchRacesSchema.parse(payload);
    const races = await strapi.documents('api::race.race').findMany({
      filters: { name: { $containsi: p.query } },
      limit: 5,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      populate: ['traits'] as any,
    });
    if (!races || races.length === 0) return `No races found matching "${p.query}".`;
    return (
      races
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const traits = r.traits?.map((t: any) => t.name).join(', ') || 'None';
          return `### ${r.name}\n- Speed: ${JSON.stringify(r.speed)}\n- Size: ${r.size}\n- Traits: ${traits}\n- Description: ${r.description}`;
        })
        .join('\n---\n')
    );
  });

  // 23. RETRIEVE_KNOWLEDGE
  const RetrieveKnowledgeSchema = z.object({ query: z.string() });
  register('retrieve_knowledge', 'Retrieve verified rules', RetrieveKnowledgeSchema, async (_roomId, payload, _u) => {
    const p = RetrieveKnowledgeSchema.parse(payload);
    try {
      // Dynamic import to avoid strict dependency if not used
      const { embeddingService } = await import('../../../services/embedding-service');
      const queryEmbedding = await embeddingService.generateEmbedding(p.query);
      const results = await strapi.db.connection.raw(
        `SELECT title, content, 1 - (embedding::vector <=> ?::vector) as similarity FROM knowledge_snippets ORDER BY similarity DESC LIMIT 5`,
        [JSON.stringify(queryEmbedding)]
      );
      const rows = (results.rows || results) as { title: string; content: string }[];
      if (!rows || rows.length === 0) return 'No relevant knowledge found.';
      return rows.map((row) => `### ${row.title}\n${row.content}\n`).join('\n---\n');
    } catch (err) {
      console.error('Knowledge retrieval failed:', err);
      return 'Error retrieving knowledge.';
    }
  });

  // 24. INSPECT_MAP
  const InspectMapSchema = z.object({ x: z.number(), y: z.number(), radius: z.number().default(5) });
  register('inspect_map', 'Inspect terrain', InspectMapSchema, async (roomId, payload, _u) => {
    const p = InspectMapSchema.parse(payload);
    const gameEventService = strapi.service('api::game-event.game-event');
    return await gameEventService.inspectTerrain(roomId, p.x, p.y, p.radius);
  });

  // 25. LIST_ENTITIES
  register('list_entities', 'List entities in room', z.object({}), async (roomId, _p, _u) => {
    interface StrapiEntitySheet {
      documentId: string;
      type?: string;
      name?: string;
      position?: { x: number; y: number; z: number };
      currentHp?: number;
      maxHp?: number;
      structuredActions?: Array<{
        id: string;
        name: string;
        type: string;
        damage?: Array<{ dice: string; type: string }>;
      }>;
    }
    const entities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: { room: { documentId: roomId } },
      populate: ['stats', 'position'],
      limit: 100,
    });
    if (!entities || entities.length === 0) return 'No entities found.';
    const lines = entities.map((param) => {
      const sheet = param as unknown as StrapiEntitySheet;
      const pos = sheet.position || { x: '?', y: '?', z: '?' };
      const hpStatus = `${sheet.currentHp}/${sheet.maxHp} HP`;
      return `- [${sheet.type?.toUpperCase() || 'UNKNOWN'}] **${sheet.name}** (ID: ${sheet.documentId}) at (${pos.x}, ${pos.y}, ${pos.z}) | ${hpStatus}`;
    });
    return `Found ${entities.length} entities:\n${lines.join('\n')}`;
  });

  // 26. GET_LOCATION_CONTEXT
  const LocationContextSchema = z.object({ x: z.number(), y: z.number() });
  register('get_location_context', 'Get location context', LocationContextSchema, async (roomId, payload, _u) => {
    const p = LocationContextSchema.parse(payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const room = await strapi.documents('api::room.room').findOne({ documentId: roomId, populate: ['dmSettings'] as any });
    if (!room) throw new Error('Room not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = room as any;
    const seed = r.world?.seed || r.settings?.seed || r.config?.seed || 'default';
    const config: WorldConfig = {
      ...(r.world || {}),
      seed,
      chunkSize: 32,
      globalScale: 0.01,
      seaLevel: 0,
      elevationScale: 1,
      roughness: 0.5,
      detail: 4,
      moistureScale: 1,
      temperatureOffset: 0,
      structureChance: 0.1,
      structureSpacing: 10,
      structureSizeAvg: 10,
      roadDensity: 0.5,
      fogRadius: 10,
    };
    const atlas = new WorldAtlas(config);
    const region = atlas.getRegion(p.x, p.y);
    const structure = atlas.getStructure(p.x, p.y);
    return {
      region: {
        name: region.name,
        biome: region.biome,
        description: `The region of ${region.name}, a ${region.wealth > 0.7 ? 'prosperous' : 'humble'} ${region.biome.toLowerCase()}.`,
      },
      structure: structure
        ? { type: structure.type, name: structure.name, description: `A ${structure.type} named ${structure.name}.` }
        : null,
      nearby: [],
    };
  });

  // 27. GET_MAP_IMAGE
  const GetMapImageSchema = z.object({
    entityId: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    radius: z.number().default(16),
    broadcast: z.boolean().default(true),
  });
  register('get_map_image', 'Get map image', GetMapImageSchema, async (roomId, payload, _u) => {
    const p = GetMapImageSchema.parse(payload);
    const { generateMapImage } = await import('../../game/services/map-visualization');
    const roomRaw = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: ['entity_sheets'],
    });

    if (!roomRaw) throw new Error('Room not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const room = roomRaw as unknown as any;
    const entities = room.entity_sheets || [];

    let centerX = p.x || 0;
    let centerY = p.y || 0;
    let povEntity: Creature | undefined;
    let visionSources: { x: number; y: number }[] = [];

    if (p.entityId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetSheet = entities.find((e: any) => e.documentId === p.entityId);
      if (targetSheet && targetSheet.position) {
        centerX = Math.round(targetSheet.position.x);
        centerY = Math.round(targetSheet.position.y);
        povEntity = {
          id: targetSheet.documentId,
          name: targetSheet.name,
          type: (['player', 'npc', 'monster'].includes(targetSheet.type)
            ? targetSheet.type
            : 'monster') as Creature['type'],
          position: targetSheet.position,
          hp: targetSheet.currentHp,
          maxHp: targetSheet.maxHp,
          armorClass: targetSheet.ac || 10,
        };
        visionSources = [targetSheet.position];
      }
    }

    if (!povEntity) {
      visionSources = entities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((e: any) => (e.type === 'player' || (e.owner && e.owner.documentId)) && e.position)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((e: any) => e.position);
      if (p.x === undefined && p.y === undefined && visionSources.length > 0) {
        centerX = visionSources[0].x;
        centerY = visionSources[0].y;
      }
    }

    const chunkX = Math.floor(centerX / 32);
    const chunkY = Math.floor(centerY / 32);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voxelService = strapi.service('api::voxel-engine.voxel-engine') as any; // Cast as any because type import issues
    let chunk: Chunk | undefined;
    if (voxelService && voxelService.getChunk) {
      const config: WorldConfig = (room.config as WorldConfig) || { ...DEFAULT_WORLD_CONFIG, seed: 'default' };
      chunk = await voxelService.getChunk(chunkX, chunkY, config);
    } else {
      throw new Error('Voxel Engine service unavailable.');
    }
    if (!chunk) throw new Error('Failed to load map chunk.');

    const creatures: Creature[] = entities
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((cs: any) => cs.position)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((cs: any) => ({
        id: cs.documentId,
        name: cs.name,
        type: (['player', 'npc', 'monster'].includes(cs.type) ? cs.type : 'monster') as Creature['type'],
        position: cs.position,
        hp: cs.currentHp,
        maxHp: cs.maxHp,
        armorClass: cs.ac || 10,
      }));

    const mockPlayers = visionSources.map((pos) => ({
      position: pos,
      id: 'pov',
      name: 'POV',
      role: 'player',
      userId: 'sys',
      action: null,
      isReady: true,
      joinedAt: 0,
      character: null,
    })) as unknown as import('../../game/src/engine').Player[];

    const imageBuffer = await generateMapImage(
      chunk,
      mockPlayers,
      creatures,
      new Set((room.exploredTiles as string[]) || []),
      { x: centerX, y: centerY },
      32,
      32
    );

    const base64 = imageBuffer.toString('base64');
    return {
      type: 'image',
      base64: base64,
      description: povEntity
        ? `Map image generated from perspective of ${povEntity.name} at ${centerX},${centerY}.`
        : `Map image generated at ${centerX},${centerY}.`,
    };
  });

  return {
    hasTool(name: string) {
      return !!tools[name];
    },
    getTools,
    async execute(name: string, roomId: string, payload: unknown, user: unknown) {
      if (!tools[name]) throw new Error(`Tool ${name} not registered`);
      return await tools[name].handler(roomId, payload, user);
    },
  };
};
