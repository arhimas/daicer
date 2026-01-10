import { vi, describe, it, expect, beforeEach } from 'vitest';
import createActionEngine from '../action-engine';

describe('Action Engine Persistence', () => {
  let mockStrapi: any;
  let actionEngine: any;

  beforeEach(() => {
    mockStrapi = {
      documents: vi.fn(() => ({
        findOne: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      })),
      service: vi.fn(() => ({
        adapt: vi.fn(),
        broadcast: vi.fn(),
      })),
      log: { error: vi.fn() },
    };

    // Correctly Mock chained calls
    // documents() returns a query engine with methods
    const mockQueryEngine = {
      findOne: vi.fn(),
      update: vi.fn(),
      create: vi.fn(() => Promise.resolve({ documentId: 'event-123' })),
      findMany: vi.fn(() => Promise.resolve([{ turnNumber: 5 }])),
    };
    mockStrapi.documents.mockReturnValue(mockQueryEngine);

    actionEngine = createActionEngine({ strapi: mockStrapi });
  });

  it('updates target HP on ATTACK_RESULT event', async () => {
    const roomId = 'room-1';
    const targetId = 'target-sheet-1';
    const result = {
      success: true,
      events: [
        {
          type: 'ATTACK_RESULT',
          payload: { targetId, damage: 5, actorId: 'actor-1' },
          timestamp: 1000,
        },
      ],
      newStateDiff: {},
    };

    // Mock finding the sheet with 10 HP
    mockStrapi.documents().findOne.mockResolvedValueOnce({
      documentId: targetId,
      currentHp: 10,
      maxHp: 20,
    });

    await actionEngine.persistResult(roomId, result);

    // Verify findOne called
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::entity-sheet.entity-sheet');
    expect(mockStrapi.documents().findOne).toHaveBeenCalledWith({
      documentId: targetId,
      fields: ['currentHp', 'maxHp'],
    });

    // Verify update called with 10 - 5 = 5
    expect(mockStrapi.documents().update).toHaveBeenCalledWith({
      documentId: targetId,
      data: { currentHp: 5 },
    });
  });

  it('handling lethal damage clamps HP to 0', async () => {
    const roomId = 'room-1';
    const targetId = 'target-sheet-1';
    const result = {
      success: true,
      events: [
        {
          type: 'ATTACK_RESULT',
          payload: { targetId, damage: 50, actorId: 'actor-1' },
          timestamp: 1000,
        },
      ],
      newStateDiff: {},
    };

    // Mock finding the sheet with 10 HP
    mockStrapi.documents().findOne.mockResolvedValueOnce({
      documentId: targetId,
      currentHp: 10,
      maxHp: 20,
    });

    await actionEngine.persistResult(roomId, result);

    expect(mockStrapi.documents().update).toHaveBeenCalledWith({
      documentId: targetId,
      data: { currentHp: 0 },
    });
  });

  it('creates GameEvent and TimeFrame entities', async () => {
    const roomId = 'room-1';
    const result = {
      success: true,
      events: [
        {
          type: 'ENTITY_MOVED',
          payload: { entityId: 'e1', to: { x: 1, y: 1 }, actorId: 'e1' },
          timestamp: 123456789,
        },
      ],
      newStateDiff: {},
    };

    await actionEngine.persistResult(roomId, result);

    // Verify GameEvent creation
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::game-event.game-event');
    expect(mockStrapi.documents().create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'ENTITY_MOVED',
          room: roomId,
          turn_number: 6, // 5 + 1 from mock
          actor: 'e1',
        }),
      })
    );

    // Verify TimeFrame creation
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::time-frame.time-frame');
    expect(mockStrapi.documents().create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          turnNumber: 6,
          events: ['event-123'],
        }),
      })
    );
  });
});
