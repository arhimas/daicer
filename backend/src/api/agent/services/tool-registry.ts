/**
 * Tool Registry Service
 */

/*
  This service maps string tool names to actual logic.
  It acts as the "Standard Library" for the Agent.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from '../../game/src/engine';
import { CastSpellIntentSchema } from '../../../shared'; // Import shared schemas
import type { Core } from '@strapi/strapi';

// Generic handler type using unknown for input, strict validation inside
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

  const getTools = () => Object.values(tools); // Expose for GraphQL generator

  // --- PILOT TOOLS ---

  // 1. PERFORM_ATTACK
  // 1. PERFORM_ATTACK
  register(
    'perform_attack',
    'Attack an entity',
    z.object({ attackerId: z.string(), targetId: z.string(), actionName: z.string() }),
    async (roomId, payload, _user) => {
      const p = payload as { attackerId: string; targetId: string; actionName: string }; // Legacy payload shape from agent?
      // If agent sends engine payload directly, we should use that.
      // Assuming agent sends mapped fields for now.

      const actionEngine = strapi.service('api::game.action-engine');

      const command: AttackCommand = {
        type: 'ATTACK',
        payload: {
          actorId: p.attackerId,
          targetId: p.targetId,
          weaponId: p.actionName,
        },
        timestamp: Date.now(),
      };

      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 2. MOVE_ENTITY
  // 2. MOVE_ENTITY
  register(
    'move_entity',
    'Move an entity along a path',
    z.object({
      entityId: z.string(),
      path: z.array(z.object({ x: z.number(), y: z.number(), z: z.number() })),
    }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as { entityId: string; path: { x: number; y: number; z: number }[] };

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

      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 3. SPAWN_ENTITY
  // 3. SPAWN_ENTITY
  register(
    'spawn_entity',
    'Spawn an entity in the room',
    z.object({
      blueprintId: z.string(),
      type: z.enum(['character', 'monster']),
      position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    }),
    async (roomId, payload, _user) => {
      const spawnService = strapi.service('api::game.spawn-service');
      // Schema: blueprintId, type, position
      return await (spawnService as SpawnService).spawn(roomId, payload);
    }
  );

  // 4. GET_AVAILABLE_ACTIONS (Discovery Tool)
  register(
    'get_available_actions',
    'Get a list of available actions for an entity',
    z.object({ entityId: z.string() }),
    async (roomId, payload, _user) => {
      const p = payload as { entityId: string };
      // Hydrate actions and return definitions
      const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: p.entityId,
        populate: [
          'inventory',
          'inventory.item',
          'inventory.item.equipment_data',
          'inventory.item.equipment_data.damage_type',
          'inventory.item.equipment_data.properties',
          'spellbook',
          'spellbook.spell',
          'stats',
        ],
      });
      if (!actor) return { error: 'Entity not found' };

      // Helper Context Map (Deduplicate later)
      const context = {
        attributes: actor.stats,
        proficiencyBonus: 2,
        equipment: (actor.inventory || [])
          .filter((entry: any) => entry.isEquipped && entry.item)
          .map((entry: any) => ({
            ...entry.item,
            ...(entry.item.equipment_data || {}),
            equipment_category: { slug: entry.item.type },
          })),
      } as any;

      const { ActionHydrator } = await import('../../game/src/engine/derivation/ActionHydrator');
      const actions: any[] = [];
      context.equipment.forEach((item: any) => {
        const itemActions = ActionHydrator.hydrateFromEquipment(item, context);
        itemActions.forEach((a) => actions.push(a));
      });
      // TODO: Spells

      return actions.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        cost: a.cost,
        range: a.range,
        attack_bonus: a.attack?.bonus,
        damage: a.effects?.find((e: any) => e.type === 'damage')?.dice,
      }));
    }
  );

  // 5. PERFORM_ACTION (Unified Tool)
  register(
    'perform_action',
    'Perform a specific action by ID (e.g. attack, spell)',
    z.object({
      actorId: z.string(),
      actionId: z.string(),
      targetId: z.string().optional(),
      options: z.record(z.string(), z.any()).optional(),
    }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as { actorId: string; actionId: string; targetId?: string; options?: any };

      const command = {
        type: 'DO_ACTION', // New Command Type
        payload: {
          actorId: p.actorId,
          actionId: p.actionId,
          targetId: p.targetId,
          options: p.options,
        },
        timestamp: Date.now(),
      };
      // Cast to generic command for dispatch, handled by ActionEngine
      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // LEGACY WRAPPERS (Maintain for backward compat but deprecate)
  // 6. PERFORM_ATTACK (Legacy)
  register(
    'perform_attack',
    'Attack an entity (Legacy - prefer perform_action)',
    z.object({ attackerId: z.string(), targetId: z.string(), actionName: z.string() }),
    async (roomId, payload, _user) => {
      // ... existing implementation ...
      // Re-use existing
      const p = payload as { attackerId: string; targetId: string; actionName: string };
      const actionEngine = strapi.service('api::game.action-engine');
      const command: AttackCommand = {
        type: 'ATTACK',
        payload: {
          actorId: p.attackerId,
          targetId: p.targetId,
          weaponId: p.actionName,
        },
        timestamp: Date.now(),
      };
      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 5. CAST_SPELL
  // 5. CAST_SPELL
  register(
    'cast_spell',
    'Cast a spell',
    CastSpellIntentSchema, // Use shared schema
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const command: CastSpellCommand = {
        type: 'CAST_SPELL',
        payload: payload as CastSpellCommand['payload'],
        timestamp: Date.now(),
      };
      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 6. INTERACT_OBJECT
  // 6. INTERACT_OBJECT
  register(
    'interact_object',
    'Interact with an object',
    z.object({ actorId: z.string(), targetId: z.string(), interactionType: z.string() }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const command: InteractCommand = {
        type: 'INTERACT',
        payload: payload as InteractCommand['payload'],
        timestamp: Date.now(),
      };
      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 7. MODIFY_TERRAIN
  // 7. MODIFY_TERRAIN
  register(
    'modify_terrain',
    'Modify world terrain',
    z.object({
      actorId: z.string(),
      center: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      radius: z.number(),
      type: z.string(),
      value: z.number().optional(),
    }), // Simplified for now
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const command: ModifyTerrainCommand = {
        type: 'MODIFY_TERRAIN',
        payload: payload as ModifyTerrainCommand['payload'],
        timestamp: Date.now(),
      };
      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 8. LONG_REST
  // 8. LONG_REST
  register('long_rest', 'Perform a long rest', z.object({ actorId: z.string() }), async (roomId, payload, _user) => {
    const actionEngine = strapi.service('api::game.action-engine');
    const command: LongRestCommand = {
      type: 'LONG_REST',
      payload: payload as LongRestCommand['payload'],
      timestamp: Date.now(),
    };
    return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
  });

  // 9. DROP_ITEM
  register(
    'drop_item',
    'Drop an item from inventory to the ground',
    z.object({ entityId: z.string(), itemComponentId: z.string() }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as { entityId: string; itemComponentId: string };

      const command: DropItemCommand = {
        type: 'DROP_ITEM',
        payload: {
          actorId: p.entityId,
          itemComponentId: p.itemComponentId,
        },
        timestamp: Date.now(),
      };

      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 10. PICKUP_ITEM
  register(
    'pickup_item',
    'Pick up an item (loot pile) from the ground',
    z.object({ actorId: z.string(), targetId: z.string() }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as { actorId: string; targetId: string };

      const command: PickupItemCommand = {
        type: 'PICKUP_ITEM',
        payload: {
          actorId: p.actorId,
          targetId: p.targetId,
        },
        timestamp: Date.now(),
      };

      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 17. THROW_ITEM
  register(
    'throw_item',
    'Throw an item at a target or position',
    z.object({
      actorId: z.string(),
      itemComponentId: z.string(),
      targetEntityId: z.string().optional(),
      targetPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as {
        actorId: string;
        itemComponentId: string;
        targetEntityId?: string;
        targetPosition: { x: number; y: number; z: number };
      };

      const command: ThrowItemCommand = {
        type: 'THROW_ITEM',
        payload: {
          actorId: p.actorId,
          itemComponentId: p.itemComponentId,
          targetEntityId: p.targetEntityId,
          targetPosition: p.targetPosition as any,
        },
        timestamp: Date.now(),
      };

      return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
    }
  );

  // 11. SET_TIME
  register(
    'set_time',
    'Set the current world time (in seconds)',
    z.object({ time: z.union([z.number(), z.string()]) }),
    async (roomId, payload, _user) => {
      const p = payload as { time: number | string };
      let newTime = 0;

      if (typeof p.time === 'string') {
        const lower = p.time.toLowerCase().trim();
        // Simple heuristic parser
        if (lower.includes('pm') || lower.includes('am')) {
          // Parse "7pm", "07:00 PM"
          const timeParts = lower.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2] || '0');
            const meridiem = timeParts[3];
            if (meridiem === 'pm' && hours < 12) hours += 12;
            if (meridiem === 'am' && hours === 12) hours = 0;
            // Assuming Day 1 for relative setting, or keeping current day?
            // "Set time to 7pm" usually implies "Today 7pm".
            // We just return seconds from midnight if we want to reset cycle,
            // OR we calculate absolute time.
            // GameLoop uses absolute seconds.
            // For simplicity, let's assume we are setting the "Time of Day" for the current day.
            // But we don't know the current day easily without fetching.
            // Let's just set absolute seconds to (hours * 3600 + minutes * 60).
            // NOTE: This resets day count to 0 if we don't fetch current.
            // Let's fetch current to preserve day.
            const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
            const current = (room?.world as any)?.time || 0;
            const day = Math.floor(current / 86400);
            newTime = day * 86400 + hours * 3600 + minutes * 60;
          } else {
            // Fallback default
            newTime = 0;
          }
        } else {
          // Direct number string?
          newTime = parseInt(p.time) || 0;
        }
      } else {
        newTime = p.time;
      }

      await strapi.documents('api::room.room').update({
        documentId: roomId,
        data: {
          world: {
            ...(((await strapi.documents('api::room.room').findOne({ documentId: roomId }))?.world as object) || {}),
            time: newTime,
          },
        } as any,
      });

      return { success: true, time: newTime };
    }
  );

  // 12. GET_TIME
  register('get_time', 'Get the current world time', z.object({}), async (roomId, _payload, _user) => {
    const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
    const time = (room?.world as any)?.time || 0;

    const day = Math.floor(time / 86400);
    const secondsInDay = time % 86400;
    const hours = Math.floor(secondsInDay / 3600);
    const minutes = Math.floor((secondsInDay % 3600) / 60);

    // Format HH:MM
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return { time, day, formatted };
  });

  // 13. SET_ENTROPY
  register(
    'set_entropy',
    'Set a specific world condition value',
    z.object({ key: z.string(), value: z.string() }),
    async (roomId, payload, _user) => {
      const p = payload as { key: string; value: string };
      const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
      const state = (room?.entropyState as any) || { conditions: [] };

      const condition = state.conditions.find((c: any) => c.key.toLowerCase() === p.key.toLowerCase());
      if (condition) {
        condition.currentValue = p.value;
        condition.lastUpdatedTurn = 0; // Or fetch current turn?
      } else {
        return { error: `Condition '${p.key}' not found` };
      }

      await strapi.documents('api::room.room').update({
        documentId: roomId,
        data: { entropyState: state } as any,
      });

      return { success: true, state };
    }
  );

  // 14. GET_ENTROPY
  register(
    'get_entropy',
    'Get the current entropy state and world conditions',
    z.object({}),
    async (roomId, _payload, _user) => {
      const room = await strapi.documents('api::room.room').findOne({ documentId: roomId });
      return (room?.entropyState as any) || {};
    }
  );

  // 15. SET_WEATHER
  register('set_weather', 'Set the local weather', z.object({ weather: z.string() }), async (roomId, payload, user) => {
    const p = payload as { weather: string };
    // Wrapper for set_entropy
    return await tools['set_entropy'].handler(roomId, { key: 'Local Weather', value: p.weather }, user);
  });

  // 16. GET_WEATHER
  register('get_weather', 'Get the current local weather', z.object({}), async (roomId, payload, user) => {
    const result = await tools['get_entropy'].handler(roomId, payload, user);
    if ((result as any).conditions) {
      const weather = (result as any).conditions.find((c: any) => c.key === 'Local Weather');
      return weather || { key: 'Local Weather', currentValue: 'Unknown' };
    }
    return result;
  });

  return {
    hasTool(name: string) {
      return !!tools[name];
    },
    getTools, // Use the const defined above
    async execute(name: string, roomId: string, payload: unknown, user: unknown) {
      if (!tools[name]) throw new Error(`Tool ${name} not registered`);
      // Validate with schema?
      // const validated = tools[name].schema.parse(payload);
      return await tools[name].handler(roomId, payload, user);
    },
  };
};

interface ActionEngineService {
  dispatch(roomId: string, commands: unknown[]): Promise<unknown>;
}
interface SpawnService {
  spawn(roomId: string, payload: unknown): Promise<unknown>;
}
