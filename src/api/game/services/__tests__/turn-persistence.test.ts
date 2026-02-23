import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnPersistenceFactory from '@/api/game/services/turn-persistence';

// Mock engine
vi.mock('@/api/game/src/engine', () => ({
  createCharacterSnapshot: vi.fn((c) => ({ id: c.documentId, hp: 10 })),
}));

describe('TurnPersistenceService', () => {
  let service: any;
  let mockStrapi: any;
  let mockDocuments: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDocuments = {
      findOne: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    mockStrapi = {
      documents: vi.fn(() => mockDocuments),
    };
    service = turnPersistenceFactory({ strapi: mockStrapi });
  });

  describe('persistTurn', () => {
    it('should persist turn and message', async () => {
      const room = { documentId: 'room1', entity_sheets: [{ documentId: 'char1' }] };
      mockDocuments.findOne.mockResolvedValue(room);
      mockDocuments.count.mockResolvedValue(5);
      mockDocuments.create.mockResolvedValue({ documentId: 'turn1' });

      const result = await service.persistTurn('room1', 'Narrative', [], 'group');

      expect(mockStrapi.documents).toHaveBeenCalledWith('api::room.room');
      expect(mockStrapi.documents).toHaveBeenCalledWith('api::turn.turn');
      expect(mockDocuments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            turnNumber: 5,
            narrative: 'Narrative',
            status: 'complete',
          }),
          status: 'published',
        })
      );

      // Message creation
      expect(mockStrapi.documents).toHaveBeenCalledWith('api::message.message');
      expect(result.turn.documentId).toBe('turn1');
    });

    it('should throw if room not found', async () => {
      mockDocuments.findOne.mockResolvedValue(null);
      await expect(service.persistTurn('room1', '', [])).rejects.toThrow('Room not found');
    });
  });

  describe('clearPlayerActions', () => {
    it('should clear actions', async () => {
      const players = [
        { id: 1, action: 'attack', isReady: true },
        { id: 2, action: null, isReady: false },
      ];

      const updated = await service.clearPlayerActions('room1', players);

      expect(updated[0].action).toBeNull();
      expect(updated[0].isReady).toBe(false);
      expect(mockDocuments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'room1',
          data: { players: updated },
        })
      );
    });
  });

  describe('updateCharacterPosition', () => {
    it('should update position', async () => {
      await service.updateCharacterPosition('sheet1', 1, 2, 3);
      expect(mockDocuments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'sheet1',
          data: { position: { x: 1, y: 2, z: 3 } },
        })
      );
    });
  });
});
