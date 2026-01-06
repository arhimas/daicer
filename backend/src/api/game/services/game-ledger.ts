import { Core } from '@strapi/strapi';
import crypto from 'crypto';

export interface LedgerEvent {
  type: string;
  payload: Record<string, unknown>; // stricter than any
  actorId?: string;
  meta?: Record<string, unknown>;
  seed?: number;
  causalityId?: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Propose an event to the ledger.
   * This is the ENTRY POINT for all state changes.
   * Logic:
   * 1. Assign deterministic sequenceId
   * 2. Commit to DB
   * 3. Broadcast
   */
  async logEvent(roomId: string, eventData: LedgerEvent) {
    // 1. Get Room Context to verify existence
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
    });

    if (!room) throw new Error(`Room not found: ${roomId}`);

    // 2. Resolve Sequence ID (Optimistic Locking / Max + 1)
    // Query the *latest* event for this room by sequenceId
    const lastEvents = await strapi.documents('api::game-event.game-event').findMany({
      filters: { room: { documentId: roomId } },
      sort: 'sequenceId:desc',
      limit: 1,
      fields: ['sequenceId'],
    });

    const lastSeq = (lastEvents[0]?.sequenceId as string | number) || 0;
    const nextSeq = BigInt(lastSeq) + 1n; // Native BigInt support in Node

    // 3. Create Event
    const event = await strapi.documents('api::game-event.game-event').create({
      data: {
        room: roomId,
        type: eventData.type,
        payload: eventData.payload,
        actorId: eventData.actorId,
        meta: eventData.meta,
        seed: eventData.seed || Math.floor(Math.random() * 1000000),
        sequenceId: nextSeq.toString(), // Store as string to be safe with all DB adapters
        causalityId: eventData.causalityId,
        timestamp: Date.now(),
        turnNumber: 0, // Deprecated/Legacy compatibility
      },
      status: 'published',
    });

    strapi.log.info(`[Ledger] Event ${nextSeq} Committed: ${eventData.type}`);

    // 4. Broadcast (Isomorphic Payload)
    const { streamManager } = await import('../../../utils/llm/stream-manager');
    streamManager.broadcast(roomId, 'game:events', { events: [event] });

    return event;
  },

  /**
   * Create a TimeFrame Snapshot based on the current state.
   * Captures EntitySheets, Room Data, and Messages.
   * Hashes the state for drift detection.
   */
  async createSnapshot(roomId: string, sequenceId: bigint) {
    strapi.log.info(`[Ledger] Creating Snapshot for Sequence ${sequenceId}`);

    // 1. Fetch FULL Room State (using the same pattern as game.getRoom)
    // This ensures we capture everything needed to rehydrate the engine/frontend.
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: {
        players: {
          populate: ['character', 'characterSheet', 'characterSheet.structuredActions', 'user'],
        },
        entity_sheets: {
          populate: {
            position: true,
            stats: true,
            features: true,
            inventory: true,
            character: { populate: ['race', 'classes.class'] },
            monster: { populate: ['stats'] },
            structuredActions: { populate: { damage: true } },
          },
        },
        world: true, // World Settings
        // We limit messages/events in getRoom, but for a SNAPSHOT we might want checks?
        // Actually, a snapshot is "Current State". Messages are history.
        // But we included Messages in the requirements. Let's capture the last 50 for context context.
        messages: {
          limit: 50,
          sort: 'timestamp:desc',
        },
      },
    });

    if (!room) throw new Error('Room not found for snapshot');

    // 2. Serialize & Hash
    const snapshotData = {
      room: {
        documentId: room.documentId,
        roomId: room.roomId,
        exploredTiles: room.exploredTiles,
        world: room.world,
      },
      entities: room.entity_sheets, // The heavy payload
      players: room.players,
      messages: room.messages,
    };

    const jsonString = JSON.stringify(snapshotData);
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');

    // 3. Save TimeFrame
    const timeFrame = await strapi.documents('api::time-frame.time-frame').create({
      data: {
        room: roomId,
        gameState: snapshotData, // TimeFrame usually stores this in 'gameState' json field
        sequenceId: sequenceId.toString(),
        hash: hash,
        timestamp: Date.now(),
      },
      status: 'published',
    });

    strapi.log.info(`[Ledger] Snapshot Created: ${timeFrame.documentId} (Hash: ${hash.substring(0, 8)})`);
    return timeFrame;
  },
});
