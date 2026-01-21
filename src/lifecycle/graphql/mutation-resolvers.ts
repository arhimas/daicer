import { v4 as uuidv4 } from 'uuid';

export const getMutationResolvers = (strapi) => ({
  /**
   * Creates a new game room along with its World and DM Settings.
   *
   * @param _parent - GraphQL Parent (unused)
   * @param args - Mutation arguments containing world data
   * @param context - Request context (user state)
   */
  createRoom: async (_parent, args, context) => {
    const { data } = args;
    const { state } = context;
    const { user } = state;

    if (!user) throw new Error('You must be logged in to create a room');

    // split fields
    const worldFields = [
      'seed',
      'language',
      'chunkSize',
      'detail',
      'fogRadius',
      'globalScale',
      'seaLevel',
      'elevationScale',
      'roughness',
      'moistureScale',
      'temperatureOffset',
      'roadDensity',
      'structureChance',
      'structureSpacing',
      'structureSizeAvg',
      'worldSize',
      'worldType',
      'worldBackground',
    ];

    const dmFields = [
      'adventureLength',
      'difficulty',
      'theme',
      'setting',
      'tone',
      'dmSystemPrompt',
      'playerCount',
      'startingLevel',
      'attributePointBudget',
      'dmStyle',
    ];

    const worldData: Record<string, unknown> = { name: `${user.username}'s World` };
    const dmData: Record<string, unknown> = {};
    const roomData: Record<string, unknown> = { ...data };

    // Helper to extract fields
    const extract = (source: Record<string, unknown>) => {
      worldFields.forEach((field) => {
        if (source[field] !== undefined) {
          worldData[field] = source[field];
          delete roomData[field];
        }
      });
      dmFields.forEach((field) => {
        if (source[field] !== undefined) {
          dmData[field] = source[field];
          delete roomData[field];
        }
      });
    };

    extract(data);
    if (data.settings) {
      extract(data.settings);
      delete roomData.settings;
    }

    // Create World Entity
    const world = await strapi.documents('api::world.world').create({
      data: worldData,
      status: 'published',
    });

    // Create DMSetting Entity
    const dmSetting = await strapi.documents('api::dm-setting.dm-setting').create({
      data: dmData,
      status: 'published',
    });

    const tempCode = uuidv4();
    const finalRoomData = {
      ...roomData,
      roomId: tempCode,
      code: tempCode,
      owner: user.documentId,
      phase: 'lobby',
      isActive: true,
      world: world.documentId,
      dmSettings: dmSetting.documentId,
      players: [
        {
          user: user.documentId,
          name: user.username || 'Room Owner',
          character: null,
          action: null,
          isReady: false,
          isOnline: true,
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    return strapi.documents('api::room.room').create({
      data: finalRoomData,
      status: 'published',
    });
  },

  /**
   * Generates the initial world description and lore.
   */
  generateWorld: async (_parent, args, _context) => {
    const { roomId, language } = args;
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: { roomId },
      populate: ['world', 'dmSettings'],
    });
    if (!rooms || rooms.length === 0) throw new Error('Room not found');
    const room = rooms[0];

    // Merge world and dmSettings
    const settings = { ...room.world, ...room.dmSettings };
    const description = await strapi.service('api::game.game').generateWorld(settings, language);

    // Update World entity instead of Room
    await strapi.documents('api::world.world').update({
      documentId: room.world.documentId,
      data: { description: description },
    });

    return strapi.documents('api::room.room').update({
      documentId: room.documentId,
      data: { phase: 'world_generation' },
    });
  },

  /**
   * Triggers the TurnPipeline to process all pending actions for a room.
   */
  processTurn: async (_parent, args, _context) => {
    const { roomId } = args;
    // Use the reliable TurnPipeline to collect and process actions
    return strapi.service('api::game.turn-pipeline').processRoomTurn(roomId);
  },

  /**
   * Adds a user to a room's player list.
   */
  joinRoom: async (_parent, args, context) => {
    const { code } = args;
    const { user } = context.state;
    if (!user) throw new Error('You must be logged in to join a room');

    const rooms = await strapi.documents('api::room.room').findMany({
      filters: { $or: [{ roomId: code }, { code: code }] },
      populate: ['players', 'players.user'],
    });

    if (!rooms || rooms.length === 0) throw new Error('Room not found');
    const targetRoom = rooms[0];
    const players = targetRoom.players || [];

    if (players.some((p) => p.user?.documentId === user.documentId || p.user?.id === user.id)) {
      return targetRoom;
    }

    const newPlayer = {
      user: user.documentId,
      name: user.username || 'Player',
      character: null,
      action: null,
      isReady: false,
      isOnline: true,
      joinedAt: new Date().toISOString(),
    };

    return strapi.documents('api::room.room').update({
      documentId: targetRoom.documentId,
      data: { players: [...players, newPlayer] },
    });
  },

  /**
   * Links a character sheet to a player in the room.
   */
  addCharacter: async (_parent, args, context) => {
    const { roomId, character } = args;
    const { user } = context.state;
    if (!user) throw new Error('Unauthorized');
    return strapi.service('api::game.game').addCharacter(roomId, character, user);
  },

  /**
   * Transitions the room from setup to active gameplay.
   */
  startGame: async (_parent, args, _context) => {
    const { roomId, language } = args;
    return strapi.service('api::game.game').startGame(roomId, language);
  },

  /**
   * Submits a player's intent/action for the current turn.
   */
  submitAction: async (_parent, args, context) => {
    const { roomId, action, mode } = args;
    const { user } = context.state;
    if (!user) throw new Error('Unauthorized');

    // Delegate to turn-processing for submission logic (handling debug execution and queueing)
    // We assume api::game.game forwards to turn-processing or we call it directly.
    return strapi.service('api::game.turn-processing').submitAction(roomId, action, user, mode);
  },

  /**
   * Spawns a creature (monster/NPC) into the room.
   */
  spawnCreature: async (_parent, args, _context) => {
    const { roomId, creature } = args;
    return strapi.service('api::game.game').spawnCreature(roomId, creature);
  },

  /**
   * Generates a face portrait using the Asset pipelines.
   */
  generateAvatarPortrait: async (_parent, args, _context) => {
    const { payload, referenceImage } = args;
    return strapi.service('api::assets.assets').generatePortrait({ payload, referenceImage });
  },

  /**
   * Generates an upper-body image based on a portrait.
   */
  generateAvatarUpperBody: async (_parent, args, _context) => {
    const { payload, portrait, referenceImage } = args;
    return strapi.service('api::assets.assets').generateUpperBody({ payload, portrait, referenceImage });
  },

  /**
   * Generates a full-body image.
   */
  generateAvatarFullBody: async (_parent, args, _context) => {
    const { payload, portrait, upperBody, referenceImage } = args;
    return strapi.service('api::assets.assets').generateFullBody({ payload, portrait, upperBody, referenceImage });
  },

  /**
   * Generates a voxel terrain chunk for the client.
   */
  generateTerrainChunk: async (_parent, args, _context) => {
    const { roomId, chunkX, chunkY, chunkSize } = args;
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: { roomId },
      populate: ['world'],
    });
    if (!rooms || rooms.length === 0) throw new Error('Room not found');
    const room = rooms[0];

    const config = {
      seed: room.world?.seed || room.roomId || 'default_seed',
      chunkSize: chunkSize || room.world?.chunkSize || 16,
      ...room.world, // Pass full world config as it likely contains seaLevel etc
    };

    return strapi.service('api::voxel-engine.voxel-engine').getChunk(chunkX, chunkY, config);
  },

  generateTerrain: async () => true,

  /**
   * Direct tool execution (Debug/Admin use).
   */
  executeTool: async (_parent, args, context) => {
    const { roomId, command } = args;
    const { user } = context.state;
    if (!user) throw new Error('Unauthorized');

    strapi.log.info(`[Resolver] executeTool: ${command} for room ${roomId}`);
    const result = await strapi.service('api::game.tool-executor').execute(roomId, command);
    return { success: true, message: result };
  },

  /**
   * Handles player answers for conversational agents.
   */
  submitAgentAnswer: async (_parent, args, context) => {
    const { questionId, answer } = args;
    const { user } = context.state;
    if (!user) throw new Error('Unauthorized');
    return strapi.service('api::agent.agent').handleAnswer(questionId, answer, user);
  },
});
