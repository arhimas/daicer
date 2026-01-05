import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
const mockBroadcast = vi.fn();
// Mock stream-manager module
vi.mock('../../../../utils/llm/stream-manager', () => ({
  streamManager: {
    broadcast: mockBroadcast,
  },
}));

// Mock factories and Strapi global
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, callback: (opts: unknown) => unknown) => {
      // Return a factory function that executes the callback with the injected strapi
      return (opts: unknown) => callback(opts);
    },
  },
}));

import gameEventServiceFactory from '../game-event';

describe('Game Event Service - Broadcasting', () => {
  let strapi: unknown;
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();

    strapi = {
      documents: vi.fn(),
      log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    };

    // Minimal mock for documents('api::game-event.game-event')
    strapi.documents.mockImplementation((uid: string) => {
      if (uid === 'api::game-event.game-event') {
        return {
          findMany: vi.fn().mockResolvedValue([{ turnNumber: 10 }]),
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'evt-123', ...data })),
        };
      }
      if (uid === 'api::room.room') {
        return {
          findMany: vi.fn().mockResolvedValue([{ documentId: 'room-123', roomId: 'room-123' }]),
        };
      }
      return {};
    });

    // Instantiate service
    service = gameEventServiceFactory({ strapi });
  });

  it('should broadcast event to room after creation', async () => {
    const ROOM_ID = 'room-123';
    await service.logEvent(ROOM_ID, 'TEST_EVENT', { foo: 'bar' });

    // Verify broadcast called
    expect(mockBroadcast).toHaveBeenCalledWith(
      ROOM_ID,
      'game:events',
      expect.objectContaining({
        events: expect.arrayContaining([
          expect.objectContaining({
            type: 'TEST_EVENT',
            room: ROOM_ID,
          }),
        ]),
      })
    );
  });
});
