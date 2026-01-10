import { factories } from '@strapi/strapi';
import { generateRoomCode } from '../../../utils/room-code';
import { v4 as uuidv4 } from 'uuid';
import { RoomCreationInput, RoomPlayer } from '../types';

export default factories.createCoreController('api::room.room', ({ strapi }) => ({
  async create(ctx) {
    const { user } = ctx.state;
    // Ensure user is authenticated
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a room');
    }

    const { settings, structures } = ctx.request.body;

    // Owner Player Object. Note: userId can be string or number.
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

    // Sanitize and Construct Room Data
    // We avoid spreading body blindly. We explicitly set defaults.
    const baseData: RoomCreationInput = {
      roomId:
        typeof ctx.request.body.roomId === 'string' && ctx.request.body.roomId ? ctx.request.body.roomId : tempCode,
      code: tempCode,
      owner: user.documentId, // Link to User
      phase: 'lobby',
      worldDescription: ctx.request.body.worldDescription || '',
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
    // Strapi generated types are apparently missing key fields (code, players) in Input, failing typecheck.
    // We use 'as any' here at the boundary to pass the correctly-shaped object.
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
        // Fallback for non-numeric ID (should handle gracefully)
        try {
          codeStr = generateRoomCode(BigInt(seed));
        } catch {
          // Fallback to numeric timestamp if UUID cannot be BigInt'ed
          codeStr = generateRoomCode(BigInt(Date.now()));
        }
      }

      // 3. Update with real code
      const updateData: RoomCreationInput = {
        code: codeStr,
        roomId: codeStr,
      };

      const updatedRoom = await strapi.entityService.update('api::room.room', newRoom.documentId || newRoom.id, {
        data: updateData as any,
      });

      return { success: true, data: updatedRoom };
    } catch (error) {
      console.error('Failed to generate permanent room code', error);
      return ctx.badRequest('Failed to generate room code');
    }
  },

  async join(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    if (!user) {
      return ctx.unauthorized('You must be logged in to join a room');
    }

    // Find room by roomId or code
    const room = await strapi.db.query('api::room.room').findOne({
      where: {
        $or: [{ roomId: id }, { code: id }],
      },
    });

    if (!room) {
      return ctx.notFound('Room not found');
    }

    const players = Array.isArray(room.players) ? room.players : [];

    // Strict fix: check implicit type
    const isAlreadyJoined = players.some((p: any) => p.userId == user.id || p.userId == user.documentId);

    if (isAlreadyJoined) {
      return { success: true, data: room, message: 'Already joined' };
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

    const updateData: RoomCreationInput = {
      players: updatedPlayers,
    };

    const updatedRoom = await strapi.entityService.update('api::room.room', room.documentId || room.id, {
      data: updateData as any,
    });

    return { success: true, data: updatedRoom };
  },

  /**
   * Submit an Action to the pending turn
   */
  async submitAction(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    // Validate request body
    const { action } = ctx.request.body;

    if (!user) return ctx.unauthorized('Must be logged in');

    try {
      if (!action || typeof action !== 'object') {
        throw new Error('Invalid action payload');
      }

      const turnService = strapi.service('api::room.turn-service');
      // turnService.addAction now strictly validates
      const updatedTurnData = await turnService.addAction(id, user.id || user.documentId, action);
      return { success: true, data: updatedTurnData };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown Error';
      return ctx.badRequest(msg);
    }
  },

  /**
   * Trigger the turn resolution
   */
  async triggerTurn(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    // TODO: Verify user is owner or authorized to trigger
    if (!user) return ctx.unauthorized('Must be logged in');

    try {
      const turnService = strapi.service('api::room.turn-service');
      const result = await turnService.processTurn(id);
      return { success: true, data: result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown Error';
      return ctx.badRequest(msg);
    }
  },
}));
