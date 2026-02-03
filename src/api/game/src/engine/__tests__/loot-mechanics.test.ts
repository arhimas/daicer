import { describe, it, expect, vi, beforeEach } from 'vitest';
import inventoryServiceFactory from '@/api/game/services/inventory-service';

// Mock Strapi Factory System
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, factory: any) => factory,
  },
}));

// Mock Strapi Global
const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockStrapi = {
  documents: (_uid: string) => ({
    findOne: mockFindOne,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  }),
  service: (_uid: string) => {
    // Return self if requested (recursive mock not really needed here for unit test of service itself)
    return {};
  },
};

describe('Inventory Service & Loot Mechanics', () => {
  let inventoryService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    inventoryService = inventoryServiceFactory({ strapi: mockStrapi });
  });

  describe('dropItem', () => {
    it('should remove item from inventory and create loot entity', async () => {
      const mockItem = { id: 101, documentId: 'item-comp-1', item: { name: 'Sword' } };
      const mockEntity = {
        documentId: 'char-1',
        inventory: [mockItem, { id: 102, documentId: 'item-comp-2' }],
        position: { x: 10, y: 10, z: 0 },
      };

      mockFindOne.mockResolvedValue(mockEntity);

      await inventoryService.dropItem('char-1', 'item-comp-1');

      // Verify Create Loot
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'loot',
            name: 'Sword',
            position: mockEntity.position,
            inventory: [mockItem],
          }),
        })
      );

      // Verify Update Source (Removal)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'char-1',
          data: expect.objectContaining({
            inventory: expect.arrayContaining([expect.objectContaining({ id: 102 })]),
          }),
        })
      );

      // Ensure length is 1
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.data.inventory).toHaveLength(1);
    });
  });

  describe('pickupItem', () => {
    it('should transfer items and delete loot entity', async () => {
      const mockActor = { documentId: 'actor-1', inventory: [] };
      const mockLoot = {
        documentId: 'loot-1',
        type: 'loot',
        name: 'Pile',
        inventory: [{ id: 99, documentId: 'loot-item-1', item: { name: 'Gold' } }],
      };

      mockFindOne
        .mockResolvedValueOnce(mockActor) // 1st call actor
        .mockResolvedValueOnce(mockLoot); // 2nd call loot

      await inventoryService.pickupItem('actor-1', 'loot-1');

      // Verify Actor Update (Addition)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'actor-1',
          data: expect.objectContaining({
            inventory: expect.arrayContaining([expect.objectContaining({ item: { name: 'Gold' } })]),
          }),
        })
      );

      // Verify Loot Deletion
      expect(mockDelete).toHaveBeenCalledWith({ documentId: 'loot-1' });
    });
  });

  describe('dropAll', () => {
    it('should move all items to new loot entity and clear source', async () => {
      const mockEntity = {
        documentId: 'dead-guy-1',
        name: 'Dead Guy',
        position: { x: 5, y: 5 },
        inventory: [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' },
        ],
      };

      mockFindOne.mockResolvedValue(mockEntity);

      await inventoryService.dropAll('dead-guy-1');

      // Verify Loot Creation (Remains)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Remains of Dead Guy',
            type: 'loot',
            inventory: expect.arrayContaining([{ name: 'A' }, { name: 'B' }]), // IDs stripped in impl
          }),
        })
      );

      // Verify Source Cleared
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'dead-guy-1',
          data: { inventory: [] },
        })
      );
    });
  });
});
