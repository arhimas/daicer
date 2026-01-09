import { Socket } from 'socket.io'; // Import Socket type
import { StrapiWithServer, RoomJoinPayload, RoomWithPopulations } from '../types';
import EntityAdapter from '../../../api/game/services/entity-adapter';

export const handleRoomJoin =
  (strapi: StrapiWithServer) =>
  async (socket: Socket, { roomId, userId }: RoomJoinPayload) => {
    try {
      strapi.log.info(`Socket ${socket.id} joining room ${roomId} as user ${userId}`);
      socket.join(roomId);
      if (userId) {
        socket.join(`user:${userId}`);
      }

      const rooms = await strapi.documents('api::room.room').findMany({
        filters: {
          $or: [{ roomId: roomId }, { code: roomId }, { documentId: roomId }],
        },
        populate: {
          players: {
            populate: [
              'character',
              'characterSheet',
              'characterSheet.spells',
              'characterSheet.equipments',
              'characterSheet.actions',
              'user',
            ],
          },
          entity_sheets: {
            populate: {
              position: true,
              stats: true,
              features: true,
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
          world: true,
          messages: {
            fields: ['content', 'senderName', 'senderType', 'timestamp', 'type'],
            limit: 50,
            sort: 'timestamp:desc',
          },
          events: {
            limit: 50,
            sort: 'timestamp:desc',
          },
        },
      });

      if (!rooms || rooms.length === 0) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const room = rooms[0] as unknown as RoomWithPopulations;
      const rawMessages = room.messages || [];
      rawMessages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

      const mappedMessages = rawMessages
        .filter((msg) => {
          // If no recipient, it's public.
          // If recipient matches userId, it's for me.
          // Note: userId passed to room-join is likely documentId based on previous context, or ID string.
          // Need to handle both potentially if types are loose.
          const msgRec = msg.recipient;
          const recipientId = msgRec?.documentId || msgRec?.id;
          if (!recipientId) return true; // Public
          return String(recipientId) === String(userId);
        })
        .map((msg) => ({
          id: msg.documentId,
          content: msg.content,
          text: msg.content,
          sender: msg.senderName,
          senderName: msg.senderName,
          senderType: msg.senderType,
          timestamp: Number(msg.timestamp),
          type: msg.senderType === 'dm' ? 'narration' : 'chat',
          isPrivate: !!msg.recipient,
        }));

      // Safe access for dynamic properties
      const world = room.world;

      // Map entity_sheets to creatures (entities) for frontend
      const rawSheets = room.entity_sheets || [];
      const creatures = rawSheets
        .map((cs) => {
          try {
            const entity = EntityAdapter().adapt(cs);
            return {
              id: entity.id,
              name: entity.name,
              type: entity.type,
              position: entity.position,
              stats: entity.stats,
              currentHp: entity.hp,
              maxHp: entity.maxHp,
              armorClass: entity.armorClass,
              structuredActions: entity.actions,
              features: entity.features,
              equipment: entity.equipment,
            };
          } catch (e) {
            strapi.log.error(
              `[RoomJoin] Entity Adaptation failed for ${(cs as { documentId?: string }).documentId}`,
              e
            );
            return null;
          }
        })
        .filter((c) => c !== null);

      const gameState = {
        room: {
          id: room.documentId,
          roomId: room.roomId,
          name: world?.name || 'Adventure',
          phase: room.phase,
          worldDescription: world?.description || '',
          events: room.events || [], // Pass events to frontend
        },
        players: room.players,
        messages: mappedMessages,
        creatures,
        isProcessing: false,
      };

      socket.emit('gameState', gameState);
    } catch (error) {
      strapi.log.error('Error in room:join socket handler:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };
