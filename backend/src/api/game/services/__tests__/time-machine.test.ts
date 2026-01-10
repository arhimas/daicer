import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Core } from '@strapi/strapi';
import GameLedgerFactory from '../game-ledger';
import HistoryServiceFactory from '../history-service';
import { GameLoop } from '../../src/engine/core/game-loop';

// Mock Documents Service
const documentsService = {
  findOne: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
};

// Mock Strapi
const mockStrapi = {
  documents: vi.fn(() => documentsService), // Returns the service object
  log: { info: vi.fn(), error: vi.fn() },
};

describe('Time Machine Reliability Suite', () => {
  // reset mocks
  beforeEach(() => {
    vi.clearAllMocks();
    // Default behavior: documents() returns the service
    mockStrapi.documents.mockReturnValue(documentsService);
  });

  it('Determinism: GameLoop should always produce same outcome for fixed inputs', () => {
    const loop1 = new GameLoop(0, 0n);
    loop1.tick(10);

    const loop2 = new GameLoop(0, 0n);
    loop2.tick(10);

    expect(loop1.currentTime).toBe(10);
    expect(loop2.currentTime).toBe(10);
    expect(loop1.currentTime).toBe(loop2.currentTime);
  });

  it('Ledger: logEvent should increment sequenceId strictly', async () => {
    const gameLedger = GameLedgerFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    // 1. findOne (Room exists)
    documentsService.findOne.mockResolvedValueOnce({ documentId: 'room1' });

    // 2. findMany (Last Sequence)
    documentsService.findMany.mockResolvedValueOnce([{ sequenceId: '10' }]);

    // 3. create
    documentsService.create.mockResolvedValueOnce({
      documentId: 'evt1',
      sequenceId: '11',
      type: 'TEST',
    });

    const event = await gameLedger.logEvent('room1', { type: 'TEST', payload: {} });

    expect(event.sequenceId).toBe('11');

    // Verify calls
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::room.room');
    expect(mockStrapi.documents).toHaveBeenCalledWith('api::game-event.game-event');
    expect(documentsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sequenceId: '11',
        }),
      })
    );
  });

  it('Ledger: createSnapshot should hash and save state', async () => {
    const gameLedger = GameLedgerFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    // Mock room fetch with populate
    documentsService.findOne.mockResolvedValueOnce({
      documentId: 'room1',
      entity_sheets: [{ id: 'e1', hp: 10 }],
      exploredTiles: ['0,0'],
    });

    documentsService.create.mockResolvedValueOnce({ documentId: 'tf1', hash: 'abc' });

    await gameLedger.createSnapshot('room1', 50n);

    expect(documentsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sequenceId: '50',
          room: 'room1',
          // We expect hash to be generated
          hash: expect.any(String),
          gameState: expect.objectContaining({
            room: expect.objectContaining({ documentId: 'room1' }),
          }),
        }),
      })
    );
  });

  it('Replay: Should reconstruct state from events', async () => {
    const historyService = HistoryServiceFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    // 1. findMany (TimeFrames - Mock 1 found)
    documentsService.findMany.mockResolvedValueOnce([
      {
        sequenceId: '0',
        timestamp: 100,
        gameState: {
          entities: [{ documentId: 'player1', position: { x: 0, y: 0, z: 0 }, stats: { hp: 10, maxHp: 10 } }],
          room: { exploredTiles: [] },
        },
      },
    ]);

    // 2. findMany (Events)
    const mockEvents = [
      {
        type: 'MOVE',
        actorId: 'player1',
        payload: { targetPosition: { x: 10, y: 10, z: 0 }, actorId: 'player1' }, // Payload structure matched to MoveCommand
        sequenceId: '1',
      },
      {
        type: 'MOVE',
        actorId: 'player1',
        payload: { targetPosition: { x: 20, y: 20, z: 0 }, actorId: 'player1' },
        sequenceId: '2',
      },
    ];
    documentsService.findMany.mockResolvedValueOnce(mockEvents);

    const finalState = await historyService.replayTo('room1', 200);

    // Expect player to be at 20,20 (Result of second move)
    const player = finalState.entities.find((e) => e.id === 'player1');
    expect(player).toBeDefined();
    expect(player?.position).toEqual({ x: 20, y: 20, z: 0 });
  });

  it('Replay: Should handle empty history (start from scratch)', async () => {
    const historyService = HistoryServiceFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    // No snapshots
    documentsService.findMany.mockResolvedValueOnce([]);
    // No events
    documentsService.findMany.mockResolvedValueOnce([]);

    const finalState = await historyService.replayTo('room1', 100);

    expect(finalState.entities).toHaveLength(0);
    expect(finalState.timeSeconds).toBe(0);
  });
});
