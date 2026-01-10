/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Action Engine Service
 * Handles game action dispatching with direct Strapi persistence.
 * Replaces the in-memory ActionDispatcher.
 */

import { factories } from '@strapi/strapi';
import { Alea } from '../src/engine/voxel/utils/math';
import { Command, MoveCommand, AttackCommand, ModifyTerrainCommand } from '../src/engine/types';
import { ActionResult } from '../src/engine/types/engine';
import { findPath } from '../src/engine/rules/spatial';
import { TerrainGenerator } from '../src/engine/voxel/terrain-generator';
import { WorldConfig, ZLevel } from '../src/engine/types';

export default factories.createCoreService('api::game.action-engine', ({ strapi }) => ({
  rng: new Alea('default-seed'), // TODO: Persist seed per room/game?

  async dispatch(command: Command): Promise<ActionResult> {
    console.log(`[ActionEngine] Dispatching command: ${command.type}`, command.payload);

    try {
      switch (command.type) {
        case 'MOVE':
          return this.handleMove(command as MoveCommand);
        case 'ATTACK':
          return this.handleAttack(command as AttackCommand);
        // TODO: Implement other handlers
        case 'SKILL_CHECK':
        case 'CAST_SPELL':
        case 'INTERACT':
        case 'LONG_REST':
        case 'MODIFY_TERRAIN':
          return this.handleModifyTerrain(command as ModifyTerrainCommand);
        default:
          return {
            success: false,
            message: `Unknown command type: ${(command as any).type}`,
            events: [],
          };
      }
    } catch (error) {
      console.error('[ActionEngine] Dispatch Error:', error);
      return {
        success: false,
        message: (error as Error).message || 'Internal Error',
        events: [],
      };
    }
  },

  async handleMove(command: MoveCommand): Promise<ActionResult> {
    const { actorId, targetPosition } = command.payload;

    // 1. Fetch Actor
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor) throw new Error('Actor not found');
    if (!actor.room) throw new Error('Actor is not in a room');

    const roomId = actor.room.documentId;
    const targetPos = { ...targetPosition, z: targetPosition.z ?? 0 };

    // 2. Fetch Room Context (All entities for collision)
    // Optimization: Select only positions
    const roomEntities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: { room: { documentId: roomId } },
      fields: ['position', 'documentId'],
    });

    // 3. Setup Collision Checker
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

    // Terrain Check
    if (actor.room.config) {
      const config = actor.room.config as WorldConfig;
      const generator = new TerrainGenerator(config);
      const baseCheck = checkCollision;
      checkCollision = (p: { x: number; y: number; z: number }) => {
        if (baseCheck(p)) return true;
        const tile = generator.getTileAt(p.x, p.y, Math.round(p.z) as ZLevel);
        return !tile.isWalkable;
      };
    }

    // 4. Find Path
    // Using current position from actor
    const startPos = actor.position || { x: 0, y: 0, z: 0 };
    const path = findPath(startPos, targetPos, checkCollision, 500);

    if (path.length === 0) {
      return { success: false, message: 'Path blocked or unreachable', events: [] };
    }

    // 5. Calculate Movement Cost
    // Assuming Speed is on actor sheet or defaulted
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

    if (finalPos.x === startPos.x && finalPos.y === startPos.y && finalPos.z === startPos.z) {
      return { success: false, message: 'No movement possible', events: [] };
    }

    // 6. Update DB
    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: actorId,
      data: { position: finalPos } as any,
    });

    // 7. Persist Game Event
    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'ENTITY_MOVED',
        room: roomId,
        actor: actorId,
        payload: {
          from: startPos,
          to: finalPos,
          path: path.map((p) => ({ x: p.x, y: p.y, z: p.z })),
          cost: traveled,
        },
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: `Moved to ${finalPos.x}, ${finalPos.y}, ${finalPos.z}`,
      events: [
        {
          type: 'ENTITY_MOVED',
          payload: {
            entityId: actorId,
            from: startPos,
            to: finalPos,
            path: path.map((p) => ({ x: p.x, y: p.y, z: p.z })),
            cost: traveled,
          },
          timestamp: Date.now(),
        },
      ],
      newStateDiff: {}, // Client should re-fetch
    };
  },

  async handleAttack(command: AttackCommand): Promise<ActionResult> {
    const { actorId, targetId, weaponId } = command.payload;

    // 1. Fetch Entities
    const [actor, target] = await Promise.all([
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: actorId,
        populate: ['actions', 'actions.damage_instances', 'inventory', 'stats'],
      }),
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: targetId,
        populate: ['stats', 'armorClass'], // Need AC
      }),
    ]);

    if (!actor || !target) throw new Error('Actor or Target not found');

    // 2. Identify Action/Weapon
    // Simplified: Find action by weaponID or default
    let actionId: string | undefined = weaponId;
    if (!actionId && actor.actions?.length > 0) {
      actionId = actor.actions[0].documentId;
    }

    // We need to construct a robust Entity object for resolveAttack
    // The resolveAttack utility expects an `Entity` interface (from types/index.ts)
    // We map the Strapi EntitySheet to the Engine Entity interface.

    // We map the Strapi EntitySheet to the Engine Entity interface.
    // (Mapping logic removed as it was unused and causing lint errors)

    // In `ActionDispatcher.ts`, it passed `actor` (GameState entity) to `resolveAttack`.
    // `resolveAttack` does: `const hit = d20 + action.attack.bonus >= target.armorClass`.
    // So we need to ensure the `action` object within the actor has the right shape.
    // Strapi `action` model likely has `attack_bonus`, `damage_dice` etc.
    // We need to map Strapi Action -> Engine ActionDefinition.

    // For this pass, we will do a manual resolution or simplistic one to prove the point,
    // as full mapping requires an Adapter.

    // FETCH Action Definition from Actor's actions
    const actionDef = actor.actions?.find((a: any) => a.documentId === actionId);
    if (!actionDef) return { success: false, message: 'Action not found', events: [] };

    const attackBonus = actionDef.attack_bonus || 0;
    const ac = target.armorClass || 10;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + attackBonus;
    const isHit = total >= ac;
    const isCrit = d20 === 20;

    let damageTotal = 0;
    if (isHit || isCrit) {
      // Calculate Damage
      // Assuming actionDef has `damage_instances` (Component)
      if (actionDef.damage_instances && Array.isArray(actionDef.damage_instances)) {
        for (const di of actionDef.damage_instances) {
          // di: { dice_count: 1, dice_value: 6, flat_bonus: 2 ... }
          const count = di.dice_count || 1;
          const face = di.dice_value || 6;
          const flat = di.flat_bonus || 0;

          let roll = 0;
          for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1;
          if (isCrit) {
            for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1;
          }
          damageTotal += roll + flat;
        }
      }
    }

    // 3. Update DB (Target HP)
    if (damageTotal > 0) {
      const newHp = Math.max(0, target.hp - damageTotal);
      await strapi.documents('api::entity-sheet.entity-sheet').update({
        documentId: targetId,
        data: { hp: newHp } as any,
      });

      // Death Logic Injection
      if (newHp === 0 && target.hp > 0) {
        // Entity just died (or downed)
        // For Monsters: Drop All immediately
        // For Players: Usually Death Saves, but if "Massive Damage" rule or simple mode...
        // We'll enforce DropAll for 'monster' type for now.
        if (target.type === 'monster' || target.type === 'npc') {
          try {
            await strapi.service('api::game.inventory-service').dropAll(targetId);

            // Log Death Event
            await strapi.documents('api::game-event.game-event').create({
              data: {
                type: 'ENTITY_DEATH',
                room: actor.room.documentId,
                actor: targetId, // The one who died
                payload: {
                  killerId: actorId,
                  position: target.position, // Log position for history markers
                },
                timestamp: Date.now(),
              },
            });
          } catch (err) {
            console.error('Failed to process death drop:', err);
          }
        }
      }
    }

    const resultMsg = isHit ? `Hit for ${damageTotal} damage` : `Missed (Rolled ${total} vs AC ${ac})`;

    // 4. Persist Event
    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'ATTACK_RESULT',
        room: actor.room.documentId,
        actor: actorId,
        payload: {
          targetId,
          roll: d20,
          total,
          isHit,
          isCrit,
          damage: damageTotal,
        },
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: resultMsg,
      events: [
        {
          type: 'ATTACK_RESULT',
          payload: {
            actorId,
            targetId,
            roll: d20,
            total,
            isHit,
            isCrit,
            damage: damageTotal,
            trace: [],
          },
          timestamp: Date.now(),
        },
      ],
      newStateDiff: {},
    };
  },

  async handleModifyTerrain(command: ModifyTerrainCommand): Promise<ActionResult> {
    const p = command.payload as any;
    const actorId = p.actorId;
    const center = p.center;
    const radius = p.radius || 0;
    const blockType = p.type || p.blockType || 'Stone';

    // 1. Validation
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor || !actor.room) throw new Error('Actor must be in a room to modify terrain.');

    // 2. Resolve Config & Chunk Size
    const worldConfig = (actor.room.config as WorldConfig) || { chunkSize: 16 };
    const chunkSize = worldConfig.chunkSize || 16;

    // 3. Iterate Radius
    // Convert center {x,y} to range.
    const startX = Math.floor(center.x - radius);
    const endX = Math.ceil(center.x + radius);
    const startY = Math.floor(center.y - radius);
    const endY = Math.ceil(center.y + radius);

    let modifications = 0;

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        // Check distance
        const dist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
        if (dist <= radius + 0.5) {
          // inclusive radius
          // Convert to Chunk Coordinates
          const chunkX = Math.floor(x / chunkSize);
          const chunkY = Math.floor(y / chunkSize);
          const localX = ((x % chunkSize) + chunkSize) % chunkSize;
          const localY = ((y % chunkSize) + chunkSize) % chunkSize;

          // Call Voxel Engine
          await strapi
            .service('api::voxel-engine.voxel-engine')
            .editTerrain(chunkX, chunkY, localX, localY, Math.round(center.z), blockType, 'Tool Modification');
          modifications++;
        }
      }
    }

    // 4. Emit Event
    const eventPayload = {
      type: 'TERRAIN_MODIFIED',
      center,
      radius,
      blockType,
      count: modifications,
    };

    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'TERRAIN_MODIFIED',
        room: actor.room.documentId,
        actor: actorId,
        payload: eventPayload,
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: `Modified ${modifications} voxels to ${blockType}`,
      events: [
        {
          type: 'TERRAIN_MODIFIED',
          payload: eventPayload,
          timestamp: Date.now(),
        },
      ],
    };
  },
}));
