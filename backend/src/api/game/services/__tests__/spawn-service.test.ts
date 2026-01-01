import { describe, it, expect, vi, beforeEach } from 'vitest';
import spawnServiceFactory from '../spawn-service';

// Mock Dependencies
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    create: mockCreate,
  }),
});

vi.mock('@daicer/engine', () => ({
  EntityDeriver: {
    derive: vi.fn(() => ({
      hp: 12,
      maxHp: 12,
      speed: 30,
    })),
  },
}));

describe('Spawn Service', () => {
  const service = spawnServiceFactory({ strapi: (globalThis as unknown).strapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('spawnMonster', () => {
    it('should spawn monster successfully', async () => {
      mockFindOne
        .mockResolvedValueOnce({ documentId: 'mon-1', name: 'Goblin', hp: 7 }) // Monster
        .mockResolvedValueOnce({ documentId: 'room-1' }); // Room

      mockFindMany.mockResolvedValue([]); // No collision

      mockCreate.mockResolvedValue({ documentId: 'sheet-1', name: 'Goblin' });

      const result = await service.spawnMonster('room-1', 'mon-1', { x: 0, y: 0, z: 0 });

      expect(result).toEqual({ documentId: 'sheet-1', name: 'Goblin' });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Goblin',
            type: 'monster',
            currentHp: 7,
            room: 'room-1',
          }),
        })
      );
    });

    it('should throw on collision', async () => {
      mockFindOne.mockResolvedValueOnce({ documentId: 'mon-1' }).mockResolvedValueOnce({ documentId: 'room-1' });

      mockFindMany.mockResolvedValue([{ name: 'Occupier' }]); // Collision

      await expect(service.spawnMonster('room-1', 'mon-1', { x: 0, y: 0, z: 0 })).rejects.toThrow(
        'occupied by Occupier'
      );
    });
  });

  describe('spawnCharacter', () => {
    it('should derive stats and spawn character', async () => {
      mockFindOne
        .mockResolvedValueOnce({
          documentId: 'char-1',
          name: 'Hero',
          baseStats: { strength: 16, dexterity: 14 },
          class: { documentId: 'cls-1', hit_die: '1d10' },
        })
        .mockResolvedValueOnce({ documentId: 'room-1' });

      mockFindMany.mockResolvedValue([]);

      await service.spawnCharacter('room-1', 'char-1', { x: 1, y: 1, z: 0 });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'player',
            class: 'cls-1',
            currentHp: 12, // came from mock derivation
          }),
        })
      );
    });
  });
});
