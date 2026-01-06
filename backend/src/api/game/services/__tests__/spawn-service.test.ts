import { describe, it, expect, vi, beforeEach } from 'vitest';
import spawnServiceFactory from '../spawn-service';

// Mock Dependencies
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();

const mockDerive = vi.fn();

vi.mock('../../../../engine', () => ({
  EntityDeriver: {
    derive: (...args: any[]) => mockDerive(...args),
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
    it('should spawn monster and copy structuredActions/stats', async () => {
      const mockMonster = {
        documentId: 'mon-1',
        name: 'Goblin',
        hp: 7,
        xp: 50,
        stats: { strength: 8, dexterity: 14 },
        structuredActions: [{ id: 'action-1', name: 'Scimitar', type: 'melee', damage: [{ dice: '1d6', bonus: 2 }] }],
      };

      mockFindOne.mockResolvedValueOnce(mockMonster); // Monster

      // Mock Derived Result
      mockDerive.mockReturnValueOnce({
        hp: 7,
        maxHp: 7,
        ac: 12,
        level: 1,
        speed: { walk: 30 },
        structuredActions: mockMonster.structuredActions,
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
            hp: 7, // Fixed: hp instead of currentHp
            xp: 50, // Fixed: xp instead of experience
            room: 'room-1',
            attributes: expect.objectContaining(mockMonster.stats), // Fixed check attributes instead of stats
            structuredActions: mockMonster.structuredActions, // Verify explicit copy
          }),
        })
      );
    });

    it('should throw on collision', async () => {
      mockFindOne.mockResolvedValueOnce({ documentId: 'mon-1', name: 'Goblin' });

      // Mock Derived for collision case (needed because derive is called before collision check)
      mockDerive.mockReturnValueOnce({
        hp: 10,
        maxHp: 10,
        ac: 10,
        level: 1,
        speed: { walk: 30 },
        structuredActions: [],
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
    it('should derive stats and actions from equipment and spawn character', async () => {
      const mockCharacter = {
        documentId: 'char-1',
        name: 'Hero',
        stats: { strength: 16, dexterity: 14, constitution: 14 }, // Str +3
        classes: [{ class: { documentId: 'cls-1', name: 'Fighter', hit_die: '1d10' }, level: 1 }],
        race: { speed: 30 },
        equipment: [
          {
            isEquipped: true,
            item: {
              name: 'Longsword',
              damage_dice: '1d8',
              damage_type: { name: 'slashing' },
              range_normal: 5,
              equipment_category: { slug: 'weapon' },
            },
          },
          {
            isEquipped: false, // Should be ignored
            item: {
              name: 'Dagger',
              damage_dice: '1d4',
            },
          },
        ],
      };

      mockFindOne.mockResolvedValueOnce(mockCharacter);

      // Mock Derived Result
      mockDerive.mockReturnValueOnce({
        hp: 12,
        maxHp: 12,
        ac: 12,
        level: 1,
        speed: { walk: 30 },
        structuredActions: [{ name: 'Longsword', toHit: 5 }],
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
            // Check derived stats
            maxHp: 12,
            // structuredActions should be derived
            structuredActions: expect.arrayContaining([
              expect.objectContaining({
                name: 'Longsword',
                toHit: 5, // Str +3 + Prof +2
              }),
            ]),
          }),
        })
      );

      // Ensure Dagger is NOT in actions
      const createCall = mockCreate.mock.calls[0][0];
      const actions = createCall.data.structuredActions;
      expect(actions.find((a: any) => a.name === 'Dagger')).toBeUndefined();
    });
  });
});
