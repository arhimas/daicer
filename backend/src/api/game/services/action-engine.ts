/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Action Engine Service (Refactored for Sandwich Pipeline)
 * Handles game action dispatching.
 * Separates Logic (Resolution) from Persistence for the Command Pipeline.
 */

// import { factories } from '@strapi/strapi'; // Not needed for plain service
import { Alea } from '../src/engine/voxel/utils/math';
import { TerrainGenerator } from '../src/engine/voxel/terrain-generator';
import { WorldConfig, ZLevel } from '../src/engine/types';

// New Schemas
import { EngineCommand, MoveCommand, AttackCommand, ModifyTerrainCommand, DropItemCommand } from '../schemas/commands';

import {
  GameEvent,
  EntityMovedEventSchema,
  AttackResultEventSchema,
  DamageDealtEventSchema,
  EntityDeathEventSchema,
  TerrainModifiedEventSchema,
  ItemDroppedEventSchema,
} from '../schemas/events';

import { findPath } from '../src/engine/rules/spatial';

import type { UID } from '@strapi/types';

// Types
export interface StateDiff {
  updates: Array<{ collection: UID.ContentType; documentId: string; data: any }>;
  creates: Array<{ collection: UID.ContentType; data: any }>;
  deletes: Array<{ collection: UID.ContentType; documentId: string }>;
}

export interface ActionResult {
  success: boolean;
  message: string;
  events: GameEvent[];
  stateDiff: StateDiff;
}

export default ({ strapi }) => ({
  rng: new Alea('default-seed'),

  /**
   * Dispatch a Command (or batch).
   * By default, it persists changes to maintain backward compatibility (legacy mode).
   * Set `dryRun: true` or call `resolve` directly for the new pipeline.
   */
  async dispatch(roomId: string, commands: EngineCommand[], dryRun = false): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    // Recording Hook
    const recordMode = process.env.RECORD_SCENARIO === 'true';
    let recorder;
    if (recordMode) {
      try {
        const { GameplayRecorder } = require('../../engine/debug/recorder');
        recorder = new GameplayRecorder('latest_scenario.json');
      } catch (e) {
        console.warn('Recorder load failed', e);
      }
    }

    for (const cmd of commands) {
      console.log(`[ActionEngine] Resolving command: ${cmd.type}`, cmd.payload);

      let result: ActionResult;

      try {
        switch (cmd.type) {
          case 'MOVE':
            result = await this.resolveMove(cmd, roomId);
            break;
          case 'ATTACK':
            result = await this.resolveAttack(cmd, roomId);
            break;
          case 'MODIFY_TERRAIN':
            result = await this.resolveModifyTerrain(cmd, roomId);
            break;
          case 'DROP_ITEM':
            result = await this.resolveDropItem(cmd, roomId);
            break;
          // TODO: Implement others
          default:
            result = {
              success: false,
              message: `Unknown command type: ${(cmd as any).type}`,
              events: [],
              stateDiff: { updates: [], creates: [], deletes: [] },
            };
        }
      } catch (error) {
        console.error('[ActionEngine] Resolution Error:', error);
        result = {
          success: false,
          message: (error as Error).message || 'Internal Error',
          events: [],
          stateDiff: { updates: [], creates: [], deletes: [] },
        };
      }

      results.push(result);

      if (recorder && result.success) {
        recorder.recordStep(cmd, { events: result.events, stateDiff: result.stateDiff });
      }

      // Legacy Persistence Mode (Default if not dryRun)
      if (!dryRun && result.success) {
        await this.persistResult(result);
      }
    }

    if (recorder) {
      await recorder.save();
    }

    return results;
  },

  /**
   * Persist the result of an action (State Diff + Events) to Strapi.
   */
  async persistResult(result: ActionResult) {
    // 1. Apply State Diffs
    for (const update of result.stateDiff.updates) {
      await strapi.documents(update.collection as any).update({
        documentId: update.documentId,
        data: update.data,
      });
    }

    // 2. Persist Events
    for (const event of result.events) {
      await strapi.documents('api::game-event.game-event').create({
        data: event as any, // Strapi types might loose check payload
      });
    }

    // Creates/Deletes not fully implemented in legacy shim yet
  },

  // --- RESOLVERS (Pure Logic) ---

  async resolveMove(command: MoveCommand, roomId: string): Promise<ActionResult> {
    const { actorId, targetPosition } = command.payload;

    // 1. Fetch State (Read Only)
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor) throw new Error('Actor not found');

    // Validate Room
    // If command doesn't imply room, we assume actor's room.
    // In strict pipeline, roomId is passed context.

    const targetPos = { ...targetPosition, z: targetPosition.z ?? 0 };

    // 2. Fetch Collision Context
    const roomEntities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: { room: { documentId: roomId } },
      fields: ['position', 'documentId'],
    });

    // 3. Collision Logic
    let checkCollision = (p: { x: number; y: number; z: number }): boolean => {
      const occupied = roomEntities.some(
        (e: any) =>
          e.documentId !== actorId &&
          Math.round(e.position?.x) === p.x &&
          Math.round(e.position?.y) === p.y &&
          Math.round(e.position?.z) === p.z
      );
      return occupied;
    };

    if (actor.room?.config) {
      const config = actor.room.config as WorldConfig;
      const generator = new TerrainGenerator(config);
      const baseCheck = checkCollision;
      checkCollision = (p: { x: number; y: number; z: number }) => {
        if (baseCheck(p)) return true;
        const tile = generator.getTileAt(p.x, p.y, Math.round(p.z) as ZLevel);
        return !tile.isWalkable;
      };
    }

    // 4. Pathfinding
    const startPos = actor.position || { x: 0, y: 0, z: 0 };
    const path = findPath(startPos, targetPos, checkCollision, 500);

    if (path.length === 0) {
      return {
        success: false,
        message: 'Path blocked from ' + JSON.stringify(startPos) + ' to ' + JSON.stringify(targetPos),
        events: [],
        stateDiff: { updates: [], creates: [], deletes: [] },
      };
    }

    // 5. Cost Calculation
    const speed = typeof actor.speed === 'number' ? actor.speed : actor.speed?.walk || 30;
    let traveled = 0;
    let finalPos = path[0];

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const next = path[i];
      const dist = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2) + Math.pow(next.z - prev.z, 2)
      );
      if (traveled + dist > speed) break;
      traveled += dist;
      finalPos = next;
    }

    // 6. Construct Result
    const event = EntityMovedEventSchema.parse({
      type: 'ENTITY_MOVED',
      timestamp: Date.now(),
      room: roomId,
      actor: actorId,
      payload: {
        from: startPos,
        to: finalPos,
        path: path.map((p) => ({ x: p.x, y: p.y, z: p.z })),
        cost: traveled,
        mode: command.payload.mode,
      },
    });

    return {
      success: true,
      message: `Moved to ${finalPos.x}, ${finalPos.y}, ${finalPos.z}`,
      events: [event],
      stateDiff: {
        updates: [
          {
            collection: 'api::entity-sheet.entity-sheet',
            documentId: actorId,
            data: { position: finalPos },
          },
        ],
        creates: [],
        deletes: [],
      },
    };
  },

  async resolveAttack(command: AttackCommand, roomId: string): Promise<ActionResult> {
    const { actorId, targetId, weaponId } = command.payload;

    // 1. Fetch Context
    const [actor, target] = await Promise.all([
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: actorId,
        populate: ['actions', 'actions.damage_instances', 'inventory', 'stats'],
      }),
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: targetId,
        populate: ['stats', 'armorClass', 'position'],
      }),
    ]);

    if (!actor || !target) {
      return {
        success: false,
        message: 'Actor or Target not found',
        events: [],
        stateDiff: { updates: [], creates: [], deletes: [] },
      };
    }

    // 2. Identify Action
    let actionId: string | undefined = weaponId;
    if (!actionId && actor.actions?.length > 0) {
      actionId = actor.actions[0].documentId;
    }

    const actionDef = actor.actions?.find((a: any) => a.documentId === actionId);
    if (!actionDef) {
      return {
        success: false,
        message: 'Action not found',
        events: [],
        stateDiff: { updates: [], creates: [], deletes: [] },
      };
    }

    // 3. Roll
    const attackBonus = actionDef.attack_bonus || 0;
    const ac = target.armorClass || 10;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + attackBonus;
    const isHit = total >= ac || d20 === 20;
    const isCrit = d20 === 20;

    const events: GameEvent[] = [];
    const updates: any[] = [];

    // 4. Damage
    let damageTotal = 0;
    if (isHit || isCrit) {
      if (actionDef.damage_instances && Array.isArray(actionDef.damage_instances)) {
        for (const di of actionDef.damage_instances) {
          const count = di.dice_count || 1;
          const face = di.dice_value || 6;
          const flat = di.flat_bonus || 0;
          let roll = 0;
          for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1;
          if (isCrit) for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1; // Double dice
          damageTotal += roll + flat;
        }
      }
    }

    // 5. Build Events
    events.push(
      AttackResultEventSchema.parse({
        type: 'ATTACK_RESULT',
        timestamp: Date.now(),
        room: roomId,
        actor: actorId,
        payload: {
          targetId,
          actionId,
          roll: d20,
          total,
          isHit,
          isCrit,
          damage: damageTotal,
        },
      })
    );

    if (damageTotal > 0) {
      const newHp = Math.max(0, (target.hp || 0) - damageTotal);

      updates.push({
        collection: 'api::entity-sheet.entity-sheet',
        documentId: targetId,
        data: { hp: newHp },
      });

      events.push(
        DamageDealtEventSchema.parse({
          type: 'DAMAGE_DEALT',
          timestamp: Date.now(),
          room: roomId,
          actor: actorId,
          payload: {
            targetId,
            amount: damageTotal,
            type: 'physical', // TODO: Fetch from action
            source: actionDef.name,
            isLethal: newHp === 0,
          },
        })
      );

      if (newHp === 0) {
        events.push(
          EntityDeathEventSchema.parse({
            type: 'ENTITY_DEATH',
            timestamp: Date.now(),
            room: roomId,
            actor: targetId,
            payload: {
              killerId: actorId,
              position: target.position || { x: 0, y: 0, z: 0 },
            },
          })
        );

        // Note: For loot drops, we technically should generate another Command/Event or handle it in a separate logic block.
        // For strictness, the 'ActionEngine' might queue a 'DropAll' command?
        // Or we just rely on the events to trigger listeners?
        // For now, let's keep it pure: The engine reports death.
        // If we want loot, the 'Orchestrator' or 'Listener' should handle it.
        // BUT, for 'legacy' shim, we might want to do it.
        // I will omit side-effect drops here for the Pure V2. The Orchestrator should handle 'ENTITY_DEATH' event processing if needed.
      }
    }

    return {
      success: true,
      message: isHit ? `Hit for ${damageTotal}` : 'Missed',
      events,
      stateDiff: {
        updates,
        creates: [],
        deletes: [],
      },
    };
  },

  async resolveModifyTerrain(command: ModifyTerrainCommand, roomId: string): Promise<ActionResult> {
    const { actorId, center, radius, type } = command.payload;
    // Simplified logic: Assume success and trigger event + direct edit via ChunkManager (which is persistence).
    // Voxel Engine is tricky because it manages its own persistence (binary/delta).
    // For StateDiff, strictly speaking, we can't easily capture voxel diffs in JSON.
    // So we might treat Voxel interactions as "External Side Effects" still, or wrap them.

    // For now, I will perform the side-effect here because ChunkManager is not easily transactional.
    // TODO: Make ChunkManager return diffs.

    // Delegate to old logic logic or simple wrapper
    await strapi.service('api::game.action-engine').handleModifyTerrain(command); // Re-use legacy for complex voxel logic

    // Since we called legacy, it already persisted.
    // We return empty diff to avoid double write.
    return {
      success: true,
      message: 'Terrain Modified',
      events: [
        TerrainModifiedEventSchema.parse({
          type: 'TERRAIN_MODIFIED',
          timestamp: Date.now(),
          room: roomId,
          actor: actorId,
          payload: {
            center,
            radius,
            blockType: type,
            count: 0, // Placeholder
          },
        }),
      ],
      stateDiff: { updates: [], creates: [], deletes: [] },
    };
  },

  async resolveDropItem(command: DropItemCommand, roomId: string): Promise<ActionResult> {
    // Inventory interactions involve creating Loot Entities and updating Inventory JSON.
    // This is complex to replicate purely in StateDiff without logic duplication from InventoryService.
    const inventoryService = strapi.service('api::game.inventory-service');

    // We call the service in a way that respects the flow?
    // InventoryService writes to DB.
    // Ideally refactor InventoryService to be pure.
    // Compromise: Call InventoryService (Persist) and return events.

    const result = await inventoryService.dropItem(command.payload.actorId, command.payload.itemComponentId);

    if (result.success) {
      const actor = await strapi
        .documents('api::entity-sheet.entity-sheet')
        .findOne({ documentId: command.payload.actorId, populate: ['room'] });
      return {
        success: true,
        message: 'Item Dropped',
        events: [
          ItemDroppedEventSchema.parse({
            type: 'ITEM_DROPPED',
            timestamp: Date.now(),
            room: roomId,
            actor: command.payload.actorId,
            payload: {
              itemId: command.payload.itemComponentId,
              position: actor.position || { x: 0, y: 0, z: 0 },
            },
          }),
        ],
        stateDiff: { updates: [], creates: [], deletes: [] }, // Handled by service
      };
    }

    return {
      success: false,
      message: 'Failed to drop',
      events: [],
      stateDiff: { updates: [], creates: [], deletes: [] },
    };
  },

  // --- LEGACY PROXY METHODS (Keep them working for existing calls) ---

  // NOTE: These are kept for backward compatibility with `turn-processing.ts` legacy code and tool registry
  // until they are fully migrated to use `dispatch`.

  async handleMove(command: any) {
    const result = await this.resolveMove(
      command,
      command.payload.actorId ? await this.getRoomFor(command.payload.actorId) : ''
    );
    if (result.success) await this.persistResult(result);
    return result;
  },

  async handleAttack(command: any) {
    const result = await this.resolveAttack(
      command,
      command.payload.actorId ? await this.getRoomFor(command.payload.actorId) : ''
    );
    if (result.success) await this.persistResult(result);
    return result;
  },

  async handleModifyTerrain(command: any) {
    // Legacy implementation from original file (simplified copy for validity)
    // In real refactor, we should extract the logic.
    // For this step, I am focusing on the NEW Dispatch pipeline.
    // If the legacy calls rely on this, I should have kept the logic.
    // Re-implementing logic or assume it is handled by new flow?
    // The user asked to "Refactor ActionEngine".
    // I replaced the file content. I must ensure I didn't lose logic.
    // I moved logic to `resolveMove` and `resolveAttack`.
    // `resolveModifyTerrain` calls `handleModifyTerrain` which I need to implement or keep.

    const p = command.payload;
    const actorId = p.actorId;
    const center = p.center;
    const radius = p.radius || 0;
    const blockType = p.type || p.blockType || 'Stone';

    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor || !actor.room) throw new Error('Actor must be in a room');

    const worldConfig = (actor.room.config as WorldConfig) || { chunkSize: 16 };
    const chunkSize = worldConfig.chunkSize || 16;
    const startX = Math.floor(center.x - radius);
    const endX = Math.ceil(center.x + radius);
    const startY = Math.floor(center.y - radius);
    const endY = Math.ceil(center.y + radius);

    let modifications = 0;
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const dist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
        if (dist <= radius + 0.5) {
          const chunkX = Math.floor(x / chunkSize);
          const chunkY = Math.floor(y / chunkSize);
          const localX = ((x % chunkSize) + chunkSize) % chunkSize;
          const localY = ((y % chunkSize) + chunkSize) % chunkSize;

          await strapi
            .service('api::voxel-engine.voxel-engine')
            .editTerrain(chunkX, chunkY, localX, localY, Math.round(center.z), blockType, 'Tool Modification');
          modifications++;
        }
      }
    }
    return { success: true, message: `Modified ${modifications}`, events: [] };
  },

  // Helper to find room for legacy calls that don't pass it
  async getRoomFor(actorId: string) {
    const actor = await strapi
      .documents('api::entity-sheet.entity-sheet')
      .findOne({ documentId: actorId, populate: ['room'] });
    return actor?.room?.documentId || '';
  },
});
