/**
 * game-event service
 */

import { factories } from '@strapi/strapi';
import { WorldGenerator } from '../../voxel-engine/services/world-generator-logic';
import { PhysicsEngine } from '../../voxel-engine/services/utils/physics';
import { MapMovePayloadSchema, SpawnEntityPayloadSchema } from '../../../shared';
import { DEFAULT_WORLD_CONFIG } from '../../game/src/engine';
import type { Coordinates } from '../../../shared';

// ... (existing helper types)
import type { Core } from '@strapi/strapi';
import type { RoomWithWorld, RoomWithSheets } from '../../../types';

// ... (existing helper types)

const getWorldGenerator = async (strapi: Core.Strapi, roomDocumentId: string) => {
  const room = await strapi.documents('api::room.room').findOne({
    documentId: roomDocumentId,
    populate: ['world'],
  });

  if (!room) throw new Error('Room not found');

  const world = (room as unknown as RoomWithWorld).world || {};

  const config = {
    ...DEFAULT_WORLD_CONFIG,
    seed: ((room as unknown as RoomWithWorld).code as string) || (world.seed as string) || 'default_seed',
  };

  return new WorldGenerator(config);
};

// Replaced factories.createCoreService with standard factory for type safety
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Log an event to the Time Machine
   */
  async logEvent(roomInputId: string, type: string, payload: unknown, actorId?: string) {
    // Resolve Room ID (Robust Lookup)
    // We do this to ensure we have the correct documentId for the relation,
    // even if the user passed the public roomId.
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: { $eq: roomInputId } }, { roomId: { $eq: roomInputId } }],
      },
      limit: 1,
    });
    const room = rooms[0];

    if (!room) {
      strapi.log.error(`[GameEvent] Room not found for event log. Input: ${roomInputId}`);
      // Fallback or throw? Throwing is safer to signal failure.
      throw new Error(`Room not found for event: ${roomInputId}`);
    }

    const roomDocumentId = (room as unknown as { documentId: string }).documentId;

    const lastEvents = await strapi.documents('api::game-event.game-event').findMany({
      filters: { room: { documentId: roomDocumentId } },
      sort: 'turn_number:desc',
      limit: 1,
    });
    const lastEvent = lastEvents.length > 0 ? (lastEvents[0] as { turn_number?: number }) : null;
    const turnNumber = lastEvent ? (lastEvent.turn_number || 0) + 1 : 1;

    const event = await strapi.documents('api::game-event.game-event').create({
       
      data: {
        room: roomDocumentId,
        type,
        payload,
        actorId,
        timestamp: Date.now().toString(), // Ensuring string if using newer schema convention
        turnNumber: turnNumber, // CamelCase
      } as any,
    });

    // Broadcast logic removed

    return event;
  },

  /**
   * Validate a move request via the Engine
   */
  async validateMove(roomDocumentId: string, from: Coordinates, to: Coordinates) {
    // Validate inputs with Zod (Runtime Safety)
    try {
      // Just validating the structure, logic handled below
      MapMovePayloadSchema.shape.from.parse(from);
      MapMovePayloadSchema.shape.to.parse(to);
    } catch (e) {
      strapi.log.warn(`[GameEvent] Invalid move payload: ${e instanceof Error ? e.message : String(e)}`);
      return { valid: false, reason: 'Invalid coordinates' };
    }

    const gen = await getWorldGenerator(strapi, roomDocumentId);
    const physics = new PhysicsEngine(gen);

    // Shared Coordinates z is number, Engine expects strict union. Validated by runtime check in physics.
    const isWalkable = await physics.isWalkable(to as { x: number; y: number; z: 0 | 1 | 2 | 3 | -1 | -2 | -3 });
    strapi.log.debug(`[GameEvent] Physics check for ${to.x},${to.y},${to.z}: Walkable=${isWalkable}`);

    // Also check for entity collision
    const gameState = await this.getGameState(roomDocumentId);

    // Check if any entity is already at the destination (simple collision)
    // In a real system we'd check against entity sizes, but for now 1 tile = 1 entity
    const occupied = Object.values(gameState.entities).some(
      (pos) => pos.x === to.x && pos.y === to.y && pos.z === to.z
    );

    if (occupied) {
      strapi.log.debug(`[GameEvent] Move blocked by entity at ${to.x},${to.y},${to.z}`);
      return { valid: false, reason: 'Destination occupied' };
    }

    return {
      valid: isWalkable,
      reason: isWalkable ? null : 'Blocked by terrain',
    };
  },

  /**
   * Reconstruct Game State by replaying events
   */
  async getGameState(roomDocumentId: string) {
    const events = await strapi.documents('api::game-event.game-event').findMany({
      filters: { room: { documentId: roomDocumentId } },
      sort: 'turn_number:asc',
      limit: 10000,
    });

    // Fetch room to get initial state
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomDocumentId,
      populate: {
        entity_sheets: {
          populate: '*',
        },
        world: true,
      },
    });

    // Default State
    const state = {
      entities: {} as Record<string, Coordinates>,
    };

    if (room && (room as unknown as RoomWithSheets).entity_sheets) {
      (room as unknown as RoomWithSheets).entity_sheets!.forEach((c) => {
        const key = String(c.documentId);
        state.entities[key] = c.position as Coordinates;
      });
    }

    // Replay with Strict Validation
    for (const event of events as unknown as { type: string; payload: unknown }[]) {
      if (event.type === 'MOVE') {
        const result = MapMovePayloadSchema.safeParse(event.payload);
        if (result.success) {
          const p = result.data;
          state.entities[String(p.entityId)] = p.to;
        } else {
          strapi.log.warn(`[GameEvent] Invalid MOVE payload skipped in replay: ${JSON.stringify(event.payload)}`);
        }
      } else if (event.type === 'SPAWN_ENTITY') {
        const result = SpawnEntityPayloadSchema.safeParse(event.payload);
        if (result.success) {
          const p = result.data;
          state.entities[String(p.entityId)] = p.position;
        } else {
          strapi.log.warn(`[GameEvent] Invalid SPAWN_ENTITY payload skipped: ${JSON.stringify(event.payload)}`);
        }
      }
    }

    return state;
  },

  /**
   * Inspect Terrain at a location
   */
  async inspectTerrain(roomDocumentId: string, x: number, y: number, _radius: number) {
    const gen = await getWorldGenerator(strapi, roomDocumentId);

    // Convert world coords to chunk coords
    const chunkSize = 32;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);

    // Get the chunk
    const chunk = await gen.getChunk(chunkX, chunkY);

    // Find tile in chunk
    const localX = ((x % chunkSize) + chunkSize) % chunkSize;
    const localY = ((y % chunkSize) + chunkSize) % chunkSize;
    // Assuming surface (z=0) for standard inspection
    const z = 0;

    if (chunk && chunk.tiles && chunk.tiles[z] && chunk.tiles[z][localY] && chunk.tiles[z][localY][localX]) {
      const tile = chunk.tiles[z][localY][localX];
      return `Terrain: ${tile.biome} (${tile.block})`;
    }

    return `Void at ${x},${y}`;
  },
});
