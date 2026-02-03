/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { createCharacterSnapshot } from '@/api/game/src/engine';
import { Core } from '@strapi/strapi';

type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

// Helper to create character snapshots
const createSnapshot = (characterSheets: unknown[]) => {
  const snapshot: Record<string, unknown> = {};
  for (const sheet of characterSheets) {
    if (sheet && typeof sheet === 'object' && 'documentId' in sheet) {
      const s = sheet as { documentId: string; [key: string]: unknown };
      const snap = createCharacterSnapshot(s);
      if (snap) {
        snapshot[s.documentId] = snap;
      }
    }
  }
  return snapshot;
};

interface RoomWithSheets {
  documentId: string;
  entity_sheets?: unknown[];
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Persists a completed Game Turn to the database.
   * Creates the Turn entity, optional Message, and snapshots the Game State.
   *
   * @param roomId - The room context.
   * @param narrative - The generated narrative summary.
   * @param playerActions - The list of actions performed.
   * @param type - Turn type (group, combat, etc).
   * @param metadata - Additional metadata.
   * @returns The created Turn context.
   */
  async persistTurn(
    roomId: string,
    narrative: string,
    playerActions: unknown[],
    type: 'group' | 'engine' = 'group',
    metadata: Record<string, unknown> = {}
  ) {
    // 1. Fetch Room with Character Sheets for Snapshot
    const roomRaw = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: ['entity_sheets'],
    });

    if (!roomRaw) throw new Error('Room not found for persistence');
    const roomWithSheets = roomRaw as unknown as RoomWithSheets;

    // 2. Determine Turn Number
    const turnCount = await strapi.documents('api::turn.turn').count({
      filters: { room: { documentId: roomWithSheets.documentId } },
    });

    const snapshot = createSnapshot(roomWithSheets.entity_sheets || []);

    // 3. Create Turn Entity
    const newTurn = await strapi.documents('api::turn.turn').create({
      data: {
        turnNumber: turnCount,
        room: roomWithSheets.documentId,
        narrative: narrative,
        status: 'complete',
        type: type === 'engine' ? 'group' : (type as 'group' | 'combat' | 'exploration'),
        // Strapi JSON fields - casting to valid JSON Value
        actions: playerActions as JSONValue,
        characterSnapshots: snapshot as JSONValue,
        metadata: metadata as JSONValue,
      },
      status: 'published',
    });

    // 4. Create Response Message (Only if narrative exists)
    let newMessage = null;
    if (narrative) {
      newMessage = await strapi.documents('api::message.message').create({
        data: {
          content: narrative,
          senderName: 'DM',
          senderType: 'dm',
          room: roomWithSheets.documentId,
          turn: newTurn.documentId,
          timestamp: Date.now(),
        },
        status: 'published',
      });
    }

    return {
      turn: newTurn,
      message: newMessage,
      room: roomWithSheets,
      snapshot,
    };
  },

  async clearPlayerActions(roomDocumentId: string, players: unknown[]) {
    const updatedPlayers = players.map((p) => {
      if (typeof p === 'object' && p !== null) {
        return { ...p, action: null, isReady: false };
      }
      return p;
    });
    // Strapi update expects matching structure.

    await strapi.documents('api::room.room').update({
      documentId: roomDocumentId,
      data: {
        players: updatedPlayers,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, // Using Partial for update data structure if exact type not available or broad
    });

    return updatedPlayers;
  },

  async updateCharacterPosition(sheetId: string, x: number, y: number, z: number) {
    return strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: sheetId,
      data: {
        position: { x, y, z },
      } as Record<string, unknown>,
    });
  },
});
