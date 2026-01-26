/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { factories } from '@strapi/strapi';
import { generateRoomCode } from '../../../utils/room-code';
import { v4 as uuidv4 } from 'uuid';
import { RoomCreationInput, RoomPlayer } from '../types';

/**
 * Room Service.
 * Core service for managing game rooms.
 */
export default factories.createCoreService('api::room.room', ({ strapi }) => ({
  /**
   * Encapsulates room creation logic including Code generation and initial state.
   */
  async createRoom(user: { id: number | string; documentId: string; username?: string }, payload: Partial<RoomCreationInput>) {
    // Owner Player Object
    const ownerPlayer: RoomPlayer = {
      id: user.id || user.documentId,
      userId: user.id || user.documentId,
      name: user.username || 'Room Owner',
      character: null,
      isReady: false,
      isOnline: true,
      joinedAt: Date.now(),
    };

    const tempCode = uuidv4();
    const { settings, structures, worldDescription } = payload;

    const baseData: RoomCreationInput = {
      roomId: typeof payload.roomId === 'string' && payload.roomId ? payload.roomId : tempCode,
      code: tempCode,
      owner: user.documentId,
      phase: 'lobby',
      worldDescription: worldDescription || '',
      isActive: true,
      settings: settings || {},
      structures: structures || [],
      players: [ownerPlayer],
      turnData: {
        phase: 'idle',
        startTime: Date.now(),
        actions: [],
      },
    };

    // 1. Create with temp code
    const newRoom = await strapi.entityService.create('api::room.room', {
      data: baseData as any,
    });

    try {
      // 2. Derive real code from ID
      const seed = newRoom.id;
      let codeStr: string;

      if (typeof seed === 'number') {
        codeStr = generateRoomCode(BigInt(seed));
      } else {
        try {
          codeStr = generateRoomCode(BigInt(seed)); // Attempt generic hash
        } catch {
          codeStr = generateRoomCode(BigInt(Date.now()));
        }
      }

      // 3. Update with real code
      const updatedRoom = await strapi.entityService.update('api::room.room', newRoom.documentId || newRoom.id, {
        data: {
            code: codeStr,
            roomId: codeStr
        } as any,
      });

      return updatedRoom;
    } catch (error) {
       strapi.log.error('Failed to generate permanent room code', error);
       // Return room with temp code if generator fails? Or re-throw?
       // Re-throwing ensures failure is visible.
       throw new Error('Failed to configure room code');
    }
  },

  /**
   * Encapsulates logic for a user joining a room.
   */
  async joinRoom(roomIdentifier: string, user: { id: number | string; documentId: string; username?: string }) {
    // Find room by roomId or code
    const room = await strapi.db.query('api::room.room').findOne({
      where: {
        $or: [{ roomId: roomIdentifier }, { code: roomIdentifier }],
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    const players = Array.isArray(room.players) ? room.players : [];
    // Strict fix: check implicit type
    const isAlreadyJoined = players.some((p: any) => p.userId == user.id || p.userId == user.documentId);

    if (isAlreadyJoined) {
       return { room, message: 'Already joined', joined: false };
    }

    const newPlayer: RoomPlayer = {
      id: user.id || user.documentId,
      userId: user.id || user.documentId,
      name: user.username || 'Player',
      character: null,
      isReady: false,
      isOnline: true,
      joinedAt: Date.now(),
    };

    const updatedPlayers = [...players, newPlayer];

    const updatedRoom = await strapi.entityService.update('api::room.room', room.documentId || room.id, {
      data: { players: updatedPlayers } as any,
    });

    return { room: updatedRoom, message: 'Joined successfully', joined: true };
  }
}));

