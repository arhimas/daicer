import { describe, it, expect, vi, beforeEach } from 'vitest';
import broadcasterFactory from '../game-broadcaster';
import { streamManager } from '../../../../utils/llm/stream-manager';
import { EntityUpdate } from '@daicer/shared';

// Mock streamManager
vi.mock('../../../../utils/llm/stream-manager', () => ({
  streamManager: {
    broadcast: vi.fn(),
  },
}));

// Mock Strapi
const mockFindOne = vi.fn();
const mockLogInfo = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    findOne: mockFindOne,
  }),
  log: {
    info: mockLogInfo,
  },
});

describe('Game Broadcaster Service', () => {
  // Initialize service
  const service = broadcasterFactory({ strapi: (global as any).strapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('broadcastTurnComplete', () => {
    it('should broadcast to both room and document channels if different', () => {
      const payload = { roomId: 'room-1', turnNumber: 1 };
      service.broadcastTurnComplete('room-1', 'doc-1', payload);

      expect(streamManager.broadcast).toHaveBeenCalledTimes(2);
      expect(streamManager.broadcast).toHaveBeenCalledWith('room-1', 'turn:complete', payload);
      expect(streamManager.broadcast).toHaveBeenCalledWith('doc-1', 'turn:complete', payload);
    });

    it('should broadcast only once if room and document IDs match', () => {
      const payload = { roomId: 'room-1', turnNumber: 2 };
      service.broadcastTurnComplete('room-1', 'room-1', payload);

      expect(streamManager.broadcast).toHaveBeenCalledTimes(1);
      expect(streamManager.broadcast).toHaveBeenCalledWith('room-1', 'turn:complete', payload);
    });
  });

  describe('broadcastEntitiesUpdate', () => {
    it('should wrap entities array in payload object', () => {
      const entities: EntityUpdate[] = [
        {
          id: 'e1',
          name: 'Goblin',
          type: 'monster',
          position: { x: 0, y: 0, z: 0 },
          speed: 30,
          currentHp: 10,
          maxHp: 10,
          structuredActions: [],
        },
      ];
      service.broadcastEntitiesUpdate('room-1', entities);

      expect(streamManager.broadcast).toHaveBeenCalledWith('room-1', 'entities:update', { entities });
    });
  });

  describe('broadcastRoomEntities (Mapping Logic)', () => {
    it('should fetch room, map entities, and broadcast', async () => {
      const mockRoom = {
        documentId: 'room-doc-1',
        roomId: 'room-code-1',
        entity_sheets: [
          {
            documentId: 'sheet-1',
            name: 'Hero',
            type: 'player',
            position: { x: 10, y: 10, z: 0 },
            currentHp: 20,
            maxHp: 20,
            structuredActions: [{ name: 'Sword' }],
          },
        ],
      };

      mockFindOne.mockResolvedValue(mockRoom);

      await service.broadcastRoomEntities('room-doc-1');

      // Verify Fetch
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'room-doc-1',
          populate: expect.objectContaining({
            entity_sheets: expect.objectContaining({
              populate: expect.objectContaining({
                structuredActions: expect.objectContaining({ populate: { damage: true } }),
              }),
            }),
          }),
        })
      );

      // Verify Broadcast Payload
      const expectedEntities = [
        expect.objectContaining({
          id: 'sheet-1',
          name: 'Hero',
          type: 'player',
          position: { x: 10, y: 10, z: 0 },
          color: '#ffffff', // Stub color
          structuredActions: [expect.objectContaining({ name: 'Sword' })],
        }),
      ];

      expect(streamManager.broadcast).toHaveBeenCalledWith('room-code-1', 'entities:update', {
        entities: expect.arrayContaining(expectedEntities),
      });
    });

    it('should handle missing structuredActions gracefully', async () => {
      const mockRoom = {
        documentId: 'room-doc-1',
        entity_sheets: [
          {
            documentId: 'sheet-2',
            name: 'Blob',
            type: 'monster',
            // Missing structuredActions, position, hp
          },
        ],
      };
      mockFindOne.mockResolvedValue(mockRoom);

      await service.broadcastRoomEntities('room-doc-1');

      const expectedEntity = expect.objectContaining({
        id: 'sheet-2',
        name: 'Blob',
        type: 'monster',
        position: { x: 0, y: 0, z: 0 }, // Default
        speed: 30, // Default
        structuredActions: [], // Default empty array
        color: '#ffffff', // Stub color
      });

      expect(streamManager.broadcast).toHaveBeenCalledWith(expect.anything(), 'entities:update', {
        entities: [expectedEntity],
      });
    });

    it('should return early if room not found', async () => {
      mockFindOne.mockResolvedValue(null);
      await service.broadcastRoomEntities('missing-room');
      expect(streamManager.broadcast).not.toHaveBeenCalled();
    });
  });
});
