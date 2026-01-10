import { streamManager } from '../../../utils/llm/stream-manager';
import EntityAdapter from './entity-adapter';

import { RoomWithPopulations } from '../../../lifecycle/socket/types';
import { TurnProcessPayload, EntitiesUpdatePayload, EntityUpdate, MessagePayload } from '../../../shared';

export default ({ strapi }) => ({
  startProcessing(roomId: string) {
    streamManager.broadcast(roomId, 'turn:processing', { roomId });
  },

  broadcastTurnComplete(roomId: string, documentId: string, turnPayload: TurnProcessPayload) {
    streamManager.broadcast(roomId, 'turn:complete', turnPayload);
    if (documentId !== roomId) {
      streamManager.broadcast(documentId, 'turn:complete', turnPayload);
    }
  },

  broadcastNewMessage(roomId: string, documentId: string, message: MessagePayload) {
    streamManager.broadcast(roomId, 'message:new', message);
    if (documentId !== roomId) {
      streamManager.broadcast(documentId, 'message:new', message);
    }
  },

  broadcastGameUpdate(roomId: string, documentId: string, updatePayload: unknown) {
    streamManager.broadcast(roomId, 'game:update', updatePayload);
    if (documentId !== roomId) {
      streamManager.broadcast(documentId, 'game:update', updatePayload);
    }
  },

  broadcastEntitiesUpdate(roomId: string, entities: EntityUpdate[]) {
    const payload: EntitiesUpdatePayload = { entities };
    streamManager.broadcast(roomId, 'entities:update', payload);
  },

  /**
   * Fetches all character sheets for a room, formats them, and broadcasts the update.
   * This ensures the frontend (Debug Map, etc.) is in sync with DB state.
   */
  async broadcastRoomEntities(roomDocumentId: string) {
    // Phase 2: Signal/Socket Removed.
    // Logic stubbed. Frontend must poll.
    // console.log(`[GameBroadcaster] Signal suppressed (Sockets Disabled). Room: ${roomDocumentId}`);
  },
});
