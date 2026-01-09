import { describe, it, expect, vi, beforeEach } from 'vitest';
import spawnServiceFactory from '../spawn-service';

// Mock Dependencies
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();

const mockDerive = vi.fn();

vi.mock('../../../../engine', () => ({
  EntityDeriver: {
    derive: (...args: unknown[]) => mockDerive(...args),
  },
}));

vi.stubGlobal('strapi', {
  documents: () => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    create: mockCreate,
  }),
});

describe('Spawn Service', () => {
  const service = spawnServiceFactory({ strapi: (globalThis as unknown).strapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('spawnMonster', () => {
    it('should spawn monster and map actions component', async () => {
      const mockMonster = {
        documentId: 'mon-1',
        name: 'Goblin',
        hp: 7,
        xp: 50,
        stats: { strength: 8, dexterity: 14 },
        actions: [{ documentId: 'action-1', name: 'Scimitar', type: 'melee_attack', damage: [], toHit: 4 }], // Relation
        inventory: [],
      };

      mockFindOne.mockResolvedValueOnce(mockMonster); // Monster

      // Mock Derived Result
      mockDerive.mockReturnValueOnce({
        hp: 7,
        maxHp: 7,
        ac: 12,
        level: 1,
        speed: { walk: 30 },
        formattedActions: [{ name: 'Scimitar', toHit: 4 }], // Mocking derived action
        proficiencyBonus: 2,
      });

      // 1. Room Lookup
      // 2. Collision Check
      mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1', name: 'Room' }]).mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({ documentId: 'sheet-1', name: 'Goblin' });

      await service.spawnMonster('room-1', 'mon-1', { x: 0, y: 0, z: 0 });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Goblin',
            type: 'monster',
            hp: 7,
            room: 'room-1',
            actions: expect.any(Array),
            structuredActions: expect.arrayContaining([expect.objectContaining({ name: 'Scimitar', toHit: 4 })]),
          }),
        })
      );
    });

    it('should throw on collision', async () => {
      mockFindOne.mockResolvedValueOnce({ documentId: 'mon-1', name: 'Goblin' });

      // Mock Derived
      mockDerive.mockReturnValueOnce({
        hp: 10,
        maxHp: 10,
        ac: 10,
        level: 1,
        speed: { walk: 30 },
      });

      mockFindMany
        .mockResolvedValueOnce([{ documentId: 'room-1' }]) // Room
        .mockResolvedValueOnce([{ name: 'Occupier' }]); // Collision

      await expect(service.spawnMonster('room-1', 'mon-1', { x: 0, y: 0, z: 0 })).rejects.toThrow(
        'occupied by Occupier'
      );
    });
  });

  describe('spawnCharacter', () => {
    it('should derive stats and populate new fields', async () => {
      const mockCharacter = {
        documentId: 'char-1',
        name: 'Hero',
        stats: { strength: 16 },
        classes: [{ class: { documentId: 'cls-1', name: 'Fighter', hit_die: '1d10' }, level: 1 }],
        race: { speed: 30, proficiencies: [], traits: [] },
        inventory: [{ isEquipped: true, item: { name: 'Sword' } }],
        actions: [],
        spell_config: {},
      };

      mockFindOne.mockResolvedValueOnce(mockCharacter);

      // Mock Derived Result
      mockDerive.mockReturnValueOnce({
        hp: 12,
        maxHp: 12,
        ac: 12,
        level: 1,
        speed: { walk: 30 },
        proficiencyBonus: 2,
      });

      mockFindMany
        .mockResolvedValueOnce([{ documentId: 'room-1' }]) // Room
        .mockResolvedValueOnce([]); // Collision

      await service.spawnCharacter('room-1', 'char-1', { x: 1, y: 1, z: 0 }, 'user-1');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'player',
            class: 'cls-1',
            owner: 'user-1',
            maxHp: 12,
            inventory: expect.arrayContaining([expect.objectContaining({ isEquipped: true })]),
            actions: expect.any(Array), // Just check it's populated
          }),
        })
      );
    });
  });
});
