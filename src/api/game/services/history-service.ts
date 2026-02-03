/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { Core } from '@strapi/strapi';

import { DeterministicTurnProcessor, GameState } from '@daicer/engine/core/deterministic-turn-processor';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Replays the game state to a specific point in time ("The Time Machine").
   * Fetches the nearest snapshot and reapplies subsequent events.
   *
   * @param roomId - The room context.
   * @param targetTimestamp - The target time to reconstruct state for.
   * @returns Excepted GameState at the target timestamp.
   */
  async replayTo(roomId: string, targetTimestamp: number) {
    // 1. Find Nearest Snapshot (TimeFrame) BEFORE target
    const timeFrames = await strapi.documents('api::time-frame.time-frame').findMany({
      filters: {
        room: { documentId: roomId },
        timestamp: { $lte: targetTimestamp },
      },
      sort: 'timestamp:desc',
      limit: 1,
    });

    let baseState: unknown = null;

    if (timeFrames.length > 0) {
      const tf = timeFrames[0];
      baseState = tf.gameState; // Ensure this matches the JSON structure we saved
      // startSequence = BigInt(tf.sequenceId);
    } else {
      // No snapshot found? Start from Room Creation (Zero State)
      // Fetch initial room state (empty)
      // For MVP, we assume at least one snapshot or handle "Null State"
      baseState = { entities: [], exploredTiles: [], timeSeconds: 0 };
    }

    // 2. Fetch Events strictly AFTER snapshot sequence up to targetTimestamp
    // We need to fetch ALL events between [Snapshot, Target]
    // Filtering by sequenceId > startSequence AND timestamp <= targetTimestamp
    const events = await strapi.documents('api::game-event.game-event').findMany({
      filters: {
        room: { documentId: roomId },
        // sequenceId > startSequence (Need to handle string comparison carefully if DB stores as string)
        // Strapi filtering on BigInt/String might be tricky.
        // Better to filter by timestamp >= snapshot.timestamp?
        // But sequence is strictly ordered.
        // Let's rely on Timestamp for粗 filtering and Sequence for Strict ordering.
        timestamp: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $gt: (timeFrames[0]?.timestamp || 0) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $lte: targetTimestamp as any,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sort: 'sequenceId:asc' as any, // CRITICAL: Replay in order
      limit: 10000, // Safety cap
    });

    // 3. Replay
    const processor = new DeterministicTurnProcessor();

    // Hydrate Initial State
    let currentState: GameState = this.hydrateState(baseState);

    // Apply Events
    for (const event of events) {
      // Convert Event payload to Action
      // NOTE: This assumes Event Payload IS the Action.
      // If generic event, we might need mapping.
      // Phase 2 Processor expects { type: 'MOVE', ... }

      // We might need a "Event -> Action" mapper here.
      // For now, assume strict 1:1 mapping for 'MOVE', 'ATTACK'.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evt = event as any;
      const action = {
        type: evt.type,
        actorId: evt.actorId,
        payload: evt.payload,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentState = processor.process(currentState, [action as any]);
    }

    return currentState;
  },

  /**
   * Helper to convert DB JSON to Engine GameState
   */
  hydrateState(json: unknown): GameState {
    const data = json as { entities?: unknown[]; room?: { exploredTiles?: string[] } };

    const entities = (data?.entities || []) as Array<{
      documentId: string;
      id?: string;
      position: { x: number; y: number; z: number };
      stats?: { hp: number; maxHp: number };
    }>;

    const explored = new Set<string>(data?.room?.exploredTiles || []);

    return {
      entities: entities.map((e) => ({
        id: e.documentId || e.id || 'unknown',
        position: e.position,
        hp: e.stats?.hp || 10,
        maxHp: e.stats?.maxHp || 10,
      })),
      exploredTiles: explored,
      timeSeconds: 0,
    };
  },

  /**
   * Retrieves the timeline metadata for a room.
   * Returns a sorted list of events and snapshot markers.
   */
  async getTimelineData(roomId: string, limit = 1000) {
    const events = await strapi.documents('api::game-event.game-event').findMany({
      filters: { room: { documentId: roomId } },
      sort: 'sequenceId:desc',
      limit,
    });

    const snapshots = await strapi.documents('api::time-frame.time-frame').findMany({
      filters: { room: { documentId: roomId } },
      sort: 'sequenceId:desc',
      limit: Math.ceil(limit / 10), // Heuristic: fewer snapshots than events
    });

    return {
      events: events.map((e) => ({
        type: 'event',
        id: e.documentId,
        sequenceId: e.sequenceId,
        timestamp: e.timestamp,
        eventType: (e as unknown as { type: string }).type,
        summary:
          (e as unknown as { summary?: string; type: string }).summary || (e as unknown as { type: string }).type,
        payload: (e as unknown as { payload: unknown }).payload,
      })),
      snapshots: snapshots.map((s) => ({
        type: 'snapshot',
        id: s.documentId,
        sequenceId: s.sequenceId,
        timestamp: s.timestamp,
        summary: 'World Snapshot',
      })),
    };
  },
});
