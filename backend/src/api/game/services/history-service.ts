import { Core } from '@strapi/strapi';

import { DeterministicTurnProcessor, GameState } from '../../../engine/core/deterministic-turn-processor';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Replay the game state to a specific point in time.
   * "The Time Machine"
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
          $gt: timeFrames[0]?.timestamp || 0,
          $lte: targetTimestamp,
        },
      },
      sort: 'sequenceId:asc', // CRITICAL: Replay in order
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
      const action = {
        type: event.type,
        actorId: event.actorId,
        payload: event.payload,
      };

      currentState = processor.process(currentState, [action]);
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
});
