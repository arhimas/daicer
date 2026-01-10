/**
 * Tool Registry Service
 */

/*
  This service maps string tool names to actual logic.
  It acts as the "Standard Library" for the Agent.
*/

import { z } from 'zod';
import {
  AttackCommand,
  MoveCommand,
  SkillCheckCommand,
  CastSpellCommand,
  InteractCommand,
  ModifyTerrainCommand,
  LongRestCommand,
  Attribute,
} from '../../game/src/engine';
import {
  AttackIntentSchema,
  CastSpellIntentSchema,
  UseFeatureIntentSchema,
  DashIntentSchema,
  DisengageIntentSchema,
  DodgeIntentSchema,
  GrappleIntentSchema,
} from '../../../shared'; // Import shared schemas
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

  // 4. ROLL_SAVE (Using SKILL_CHECK for now until we expand)
  // 4. ROLL_SAVE (Using SKILL_CHECK for now until we expand)
  register(
    'roll_save',
    'Perform a saving throw or skill check',
    z.object({
      entityId: z.string(),
      stat: z.string(),
      difficultyClass: z.number().optional(),
    }),
    async (roomId, payload, _user) => {
      const actionEngine = strapi.service('api::game.action-engine');
      const p = payload as { entityId: string; stat: string; difficultyClass?: number };

      // Adapting "Save" to "Skill Check" structure for now, or adding SAVE cmd
      const command: SkillCheckCommand = {
        type: 'SKILL_CHECK',
        payload: {
          actorId: p.entityId,
          attribute: p.stat as Attribute,
          difficultyClass: p.difficultyClass,
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
      value: z.number(),
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

  return {
    hasTool(name: string) {
      return !!tools[name];
    },
    getTools() {
      return Object.values(tools);
    },
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
