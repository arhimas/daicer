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
    // Logic:
    const roomRaw = await strapi.documents('api::room.room').findOne({
      documentId: roomDocumentId,
      populate: {
        entity_sheets: {
          populate: {
            position: true,
            stats: true,
            features: true, // Add features
            inventory: true,
            character: {
              populate: {
                race: true,
                classes: { populate: ['class'] },
                spells: { populate: { damage: true } },
                equipment_items: { populate: '*' },
                actions: { populate: { damage: true } },
              },
            },
            monster: {
              populate: {
                stats: true,
                spells: { populate: { damage: true } },
                equipment_items: { populate: '*' },
                actions: { populate: { damage: true } },
              },
            },
          },
        },
      },
    });

    if (!roomRaw) return;

    const room = roomRaw as unknown as RoomWithPopulations;

    // Format
    const entities: EntityUpdate[] = (room.entity_sheets || [])
      .map((s) => {
        try {
          const entity = EntityAdapter().adapt(s);
          return {
            id: entity.id,
            name: entity.name,
            type: entity.type,
            position: entity.position,
            speed: entity.speed,
            currentHp: entity.hp,
            maxHp: entity.maxHp,
            ac: entity.armorClass,
            structuredActions: (entity.sheet as unknown as { structuredActions: unknown[] }).structuredActions || [], // Patched by Adapter
            visionRadius: entity.visionRadius,
            color: entity.color,
            stats: entity.stats,
            features: entity.features,
            // Adapter doesn't map these yet, so we keep manual access for now or update Adapter later
            equipment: (s as unknown as { inventory: unknown }).inventory,
            proficiencies: (s as unknown as { character: { proficiencies: unknown[] } }).character?.proficiencies || [],
          };
        } catch (e) {
          strapi.log.error(`[Broadcaster] Adaptation failed for ${s.documentId}`, e);
          return null; // Skip invalid entities
        }
      })
      .filter((e) => e !== null) as EntityUpdate[];

    this.broadcastEntitiesUpdate(room.roomId || room.documentId, entities);
    // Also broadcast to documentId room just in case
    if (room.roomId && room.roomId !== room.documentId) {
      this.broadcastEntitiesUpdate(room.documentId, entities);
    }
  },
});
