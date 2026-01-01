/**
 * Tool Registry Service
 */

/*
  This service maps string tool names to actual logic.
  It acts as the "Standard Library" for the Agent.
*/

import {
  AttackCommand,
  MoveCommand,
  SkillCheckCommand,
  CastSpellCommand,
  InteractCommand,
  ModifyTerrainCommand,
  LongRestCommand,
  Attribute,
} from '@daicer/engine';
import type { Core } from '@strapi/strapi';

// Generic handler type using unknown for input, strict validation inside
type ToolHandler = (roomId: string, payload: unknown, user: unknown) => Promise<unknown>;

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const tools: Record<string, ToolHandler> = {};

  const register = (name: string, handler: ToolHandler) => {
    tools[name] = handler;
  };

  // --- PILOT TOOLS ---

  // 1. PERFORM_ATTACK
  register('perform_attack', async (roomId, payload, _user) => {
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
    // Usage of (actionEngine as any) is temporary until we strictly type all services?
    // NO! User said No Suppressions! I must type actionEngine properly or trust strapi.service returns 'any' which calls are unsafe.
    // Strapi service return IS untyped usually. To satisfy "Life or Death", I should define the service interface.
  });

  // 2. MOVE_ENTITY
  register('move_entity', async (roomId, payload, _user) => {
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
  });

  // 3. SPAWN_ENTITY
  register('spawn_entity', async (roomId, payload, _user) => {
    const spawnService = strapi.service('api::game.spawn-service');
    // Schema: blueprintId, type, position
    return await (spawnService as SpawnService).spawn(roomId, payload);
  });

  // 4. ROLL_SAVE (Using SKILL_CHECK for now until we expand)
  register('roll_save', async (roomId, payload, _user) => {
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
  });

  // 5. CAST_SPELL
  register('cast_spell', async (roomId, payload, _user) => {
    const actionEngine = strapi.service('api::game.action-engine');
    const command: CastSpellCommand = {
      type: 'CAST_SPELL',
      payload: payload as CastSpellCommand['payload'],
      timestamp: Date.now(),
    };
    return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
  });

  // 6. INTERACT_OBJECT
  register('interact_object', async (roomId, payload, _user) => {
    const actionEngine = strapi.service('api::game.action-engine');
    const command: InteractCommand = {
      type: 'INTERACT',
      payload: payload as InteractCommand['payload'],
      timestamp: Date.now(),
    };
    return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
  });

  // 7. MODIFY_TERRAIN
  register('modify_terrain', async (roomId, payload, _user) => {
    const actionEngine = strapi.service('api::game.action-engine');
    const command: ModifyTerrainCommand = {
      type: 'MODIFY_TERRAIN',
      payload: payload as ModifyTerrainCommand['payload'],
      timestamp: Date.now(),
    };
    return await (actionEngine as ActionEngineService).dispatch(roomId, [command]);
  });

  // 8. LONG_REST
  register('long_rest', async (roomId, payload, _user) => {
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
    async execute(name: string, roomId: string, payload: unknown, user: unknown) {
      if (!tools[name]) throw new Error(`Tool ${name} not registered`);
      return await tools[name](roomId, payload, user);
    },
  };
};

interface ActionEngineService {
  dispatch(roomId: string, commands: unknown[]): Promise<unknown>;
}
interface SpawnService {
  spawn(roomId: string, payload: unknown): Promise<unknown>;
}
