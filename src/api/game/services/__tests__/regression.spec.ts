/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockDispatch = vi.fn();
const mockStrapi = {
  service: vi.fn((uid) => {
    if (uid === 'api::game.action-engine') return { dispatch: mockDispatch };
    // Return mocking object for other services
    return {
      startProcessing: vi.fn(),
      executeDeterministicTurn: vi.fn(),
      persistTurn: vi.fn(() =>
        Promise.resolve({
          turn: { documentId: 'turn1', turnNumber: 1, narrative: { content: 'test' }, snapshots: {} },
          snapshot: {},
          room: { roomId: 'room1', entity_sheets: [] },
        })
      ),
      spawnMonster: vi.fn(),
      spawnCharacter: vi.fn(),
      broadcastTurnComplete: vi.fn(),
      broadcastEntitiesUpdate: vi.fn(),
      broadcastRoomEntities: vi.fn(),
    };
  }),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  documents: vi.fn(() => ({
    // Mock valid room for execution
    findOne: vi.fn(() => ({ documentId: 'room1', entity_sheets: [] })),
    update: vi.fn(),
  })),
  plugin: vi.fn(() => ({
    service: vi.fn(() => ({ upload: vi.fn() })),
  })),
};

describe('Regression: Combat & Fog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('strapi', mockStrapi);
  });

  it('TurnProcessing should delegate ATTACK action to ActionEngine', async () => {
    // Import factory default
    const turnProcessingModule = await import('../turn-processing');
    const factory = turnProcessingModule.default;
    const service = factory({ strapi: mockStrapi });

    const attackAction = {
      type: 'attack',
      payload: { actorId: 'ent1', targetId: 'ent2', weaponId: 'act1' },
      timestamp: 123456,
    };

    // processTurn parses messages into deterministicActions.
    // executeDeterministicTurn takes deterministicActions.

    await service.executeDeterministicTurn('room1', [attackAction]);

    expect(mockStrapi.service).toHaveBeenCalledWith('api::game.action-engine');
    expect(mockDispatch).toHaveBeenCalledWith('room1', [
      expect.objectContaining({ type: 'ATTACK', payload: expect.objectContaining({ weaponId: 'act1' }) }),
    ]);
  });
});
