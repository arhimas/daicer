import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMutationResolvers } from '../mutation-resolvers';
import { mockStrapi, resetMockStrapi } from './test-utils/mock-strapi';

describe('E2E: Player Flow', () => {
  let resolvers;
  let context;
  let room;

  beforeEach(async () => {
    resetMockStrapi();
    resolvers = getMutationResolvers(mockStrapi);
    context = {
      state: {
        user: { documentId: 'tactician-1', id: 1, username: 'Tactician' },
      },
    };

    // 1. Setup Room (as Tactician)
    const createArgs = {
      data: { name: 'Adventure', seed: 's1' },
    };
    room = await resolvers.createRoom(null, createArgs, context);
  });

  it('should allow player to join, create character, and start game', async () => {
    // 2. Player Joins
    const playerContext = {
      state: { user: { documentId: 'p1', id: 2, username: 'PlayerOne' } },
    };

    // Mock findMany to return calls for filters
    // My mockStrapi implementation handles filters.$or now

    // Execute Join
    const joinedRoom = await resolvers.joinRoom(null, { code: room.code }, playerContext);

    expect(joinedRoom.players).toHaveLength(2); // Owner + Player
    const playerEntry = joinedRoom.players.find((p) => p.user === 'p1');
    expect(playerEntry).toBeDefined();

    // 3. Add Character
    // Mock game service addCharacter
    mockStrapi.services['api::game.game'].addCharacter = vi.fn().mockResolvedValue({
      ...playerEntry,
      character: { name: 'Hero' },
    });

    await resolvers.addCharacter(null, { roomId: room.roomId, character: { name: 'Hero' } }, playerContext);

    expect(mockStrapi.services['api::game.game'].addCharacter).toHaveBeenCalledWith(
      room.roomId,
      { name: 'Hero' },
      { documentId: 'p1', id: 2, username: 'PlayerOne' }
    );

    // 4. Start Game
    // Should fail if players not ready.
    // Mock db to show player IS ready. (Since addCharacter result isn't auto-persisted to room in mock service call unless we manually update DB).
    // The `addCharacter` resolver calls service. Service updates DB.
    // Since we mocked the service, DB is NOT updated.
    // So verify flow stops at calling service.

    // If we want to test StartGame, we need to update our Mock Room to set isReady=true.
    const roomDoc = mockStrapi.db['api::room.room'].find((r) => r.documentId === room.documentId);
    // Manually update mock DB to simulate "Ready" state
    roomDoc.players[1].isReady = true;
    roomDoc.players[0].isReady = true; // Owner ready too? Usually owner doesn't need to be ready if DM, but logic checks ALL.

    // Mock startGame service
    mockStrapi.services['api::game.game'].startGame = vi
      .fn()
      .mockResolvedValue({ success: true, mainOpening: 'Welcome' });

    await resolvers.startGame(null, { roomId: room.roomId }, context); // DM starts

    expect(mockStrapi.services['api::game.game'].startGame).toHaveBeenCalled();

    // 5. Submit Debug Action
    mockStrapi.services['api::game.turn-processing'] = { submitAction: vi.fn() };
    await resolvers.submitAction(
      null,
      {
        roomId: room.roomId,
        action: 'DEBUG_CMD',
        mode: 'debug',
      },
      context
    ); // Using Tactician context (Owner)

    expect(mockStrapi.services['api::game.turn-processing'].submitAction).toHaveBeenCalledWith(
      room.roomId,
      'DEBUG_CMD',
      expect.objectContaining({ documentId: 'tactician-1' }),
      'debug'
    );
  });

  it('should process turn aggregation', async () => {
    // Mock Room with Players and World
    const message = { content: 'I attack', senderType: 'player' };
    // Manually inject room into DB to ensure 'populate' works (nested check skipped in naive mock but top level works)

    // We rely on resolver fetching room.
    // Resolver calls service.processTurn.

    // Inject some messages in Mock DB?
    // Resolvers `processTurn` accepts `messages` as ARGUMENT. It calls `strapi.documents('api::room.room')` to get context.
    // It passes `messages` arg to service.

    mockStrapi.services['api::game.turn-pipeline'] = { processRoomTurn: vi.fn().mockResolvedValue({ success: true }) };

    await resolvers.processTurn(
      null,
      {
        roomId: room.roomId,
        messages: [message],
        language: 'en',
      },
      context
    );

    expect(mockStrapi.services['api::game.turn-pipeline'].processRoomTurn).toHaveBeenCalledWith(room.roomId);
  });
});
