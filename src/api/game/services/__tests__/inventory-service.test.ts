
import { describe, it, expect, vi, beforeEach } from 'vitest';
import inventoryServiceFactory from '../inventory-service';

const mockFindOne = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();
const mockDelete = vi.fn();

const mockStrapi: any = {
  documents: vi.fn(() => ({
    findOne: mockFindOne,
    update: mockUpdate,
    create: mockCreate,
    delete: mockDelete,
  })),
};

describe('Inventory Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = inventoryServiceFactory({ strapi: mockStrapi });
  });

  describe('dropItem', () => {
    it('should drop item and remove from inventory', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'e1',
        inventory: [{ id: 1, name: 'Apple' }],
        position: { x: 0, y: 0 },
      });

      const res = await service.dropItem('e1', '1');
      expect(res.success).toBe(true);
      expect(mockCreate).toHaveBeenCalled(); // Loot created
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { inventory: [] } })
      );
    });

    it('should fail if item not found', async () => {
      mockFindOne.mockResolvedValueOnce({ inventory: [] });
      await expect(service.dropItem('e1', '1')).rejects.toThrow('Item not found');
    });
  });

  describe('dropItemAt', () => {
      it('should drop item at specific position', async () => {
          mockFindOne.mockResolvedValueOnce({
              documentId: 'e1',
              inventory: [{ id: 1, name: 'Apple' }]
          });

          const pos = { x: 10, y: 20, z: 5 };
          const res = await service.dropItemAt('e1', '1', pos);
          
          expect(res.success).toBe(true);
          expect(mockCreate).toHaveBeenCalledWith(
              expect.objectContaining({ 
                  data: expect.objectContaining({ 
                      position: pos,
                      type: 'loot'
                  }) 
              })
          );
          expect(mockUpdate).toHaveBeenCalled();
      });

      it('should fail if item not found', async () => {
        mockFindOne.mockResolvedValueOnce({ inventory: [] });
        await expect(service.dropItemAt('e1', '1', { x: 0, y: 0, z: 0 })).rejects.toThrow('Item not found');
      });
  });

  describe('pickupItem', () => {
      it('should transfer items and delete loot', async () => {
          mockFindOne.mockImplementation(({ documentId }) => {
              if (documentId === 'a1') return { documentId: 'a1', inventory: [] };
              if (documentId === 'l1') return { documentId: 'l1', type: 'loot', inventory: [{ id: 1 }] };
              return null;
          });

          const res = await service.pickupItem('a1', 'l1');
          expect(res.success).toBe(true);
          expect(mockUpdate).toHaveBeenCalled(); // Actor updated
          expect(mockDelete).toHaveBeenCalled(); // Loot deleted
      });

      it('should fail if loot empty', async () => {
          mockFindOne.mockImplementation(({ documentId }) => {
              if (documentId === 'a1') return { documentId: 'a1', inventory: [] };
              if (documentId === 'l1') return { documentId: 'l1', type: 'loot', inventory: [] };
              return null;
          });
          const res = await service.pickupItem('a1', 'l1');
          expect(res.success).toBe(false);
          expect(mockDelete).toHaveBeenCalled(); // Empty loot deleted
      });
  });
  
  describe('dropAll', () => {
      it('should drop all items', async () => {
          mockFindOne.mockResolvedValueOnce({
              inventory: [{ id: 1 }, { id: 2 }],
              position: { x: 0, y: 0 }
          });
          
          const res = await service.dropAll('e1');
          expect(res.success).toBe(true);
          expect(mockCreate).toHaveBeenCalled(); // Loot pile
          expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { inventory: [] } }));
      });
      
      it('should do nothing if empty', async () => {
           mockFindOne.mockResolvedValueOnce({ inventory: [] });
           const res = await service.dropAll('e1');
           expect(res.success).toBe(true);
           expect(mockCreate).not.toHaveBeenCalled();
      });
  });

  describe('equipItem', () => {
    // Helper to create mock inventory item
    const mockItem = (id: number, slot?: string, isEquipped = false, isTwoHanded = false) => ({
      id,
      documentId: `item${id}`,
      slot,
      isEquipped,
      item: {
        name: `Item ${id}`,
        equipment_data: {
          properties: isTwoHanded ? [{ slug: 'two-handed' }] : []
        }
      }
    });

    it('should equip item into empty slot', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'e1',
        inventory: [mockItem(1, undefined, false, false)]
      });

      const res = await service.equipItem('e1', '1', 'main_hand');
      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ 
          data: { 
            inventory: expect.arrayContaining([
              expect.objectContaining({ id: 1, isEquipped: true, slot: 'main_hand' })
            ]) 
          } 
        })
      );
    });

    it('should swap items in same slot', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'e1',
        inventory: [
          mockItem(1, 'main_hand', true, false), // Currently Equipped
          mockItem(2, undefined, false, false)   // To Equip
        ]
      });

      await service.equipItem('e1', '2', 'main_hand');
      
      const updateCall = mockUpdate.mock.calls[0][0];
      const newInventory = updateCall.data.inventory;
      
      // Item 1 should be unequipped
      expect(newInventory.find((i: any) => i.id === 1).isEquipped).toBe(false);
      // Item 2 should be equipped
      expect(newInventory.find((i: any) => i.id === 2).isEquipped).toBe(true);
      expect(newInventory.find((i: any) => i.id === 2).slot).toBe('main_hand');
    });

    it('should unequip off-hand if equipping 2H weapon', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'e1',
        inventory: [
          mockItem(1, 'off_hand', true, false), // Shield
          mockItem(2, undefined, false, true)   // Greatsword (2H)
        ]
      });

      await service.equipItem('e1', '2', 'main_hand');

      const updateCall = mockUpdate.mock.calls[0][0];
      const newInventory = updateCall.data.inventory;
      
      // Shield unequipped
      expect(newInventory.find((i: any) => i.id === 1).isEquipped).toBe(false);
      // Greatsword equipped
      expect(newInventory.find((i: any) => i.id === 2).isEquipped).toBe(true);
    });

    it('should unequip 2H main-hand if equipping off-hand', async () => {
      mockFindOne.mockResolvedValueOnce({
        documentId: 'e1',
        inventory: [
          mockItem(1, 'main_hand', true, true), // Greatsword (2H)
          mockItem(2, undefined, false, false)  // Dagger (Offhand)
        ]
      });

      await service.equipItem('e1', '2', 'off_hand');

      const updateCall = mockUpdate.mock.calls[0][0];
      const newInventory = updateCall.data.inventory;
      
      // Greatsword unequipped
      expect(newInventory.find((i: any) => i.id === 1).isEquipped).toBe(false);
      // Dagger equipped in off_hand
      expect(newInventory.find((i: any) => i.id === 2).isEquipped).toBe(true);
      expect(newInventory.find((i: any) => i.id === 2).slot).toBe('off_hand');
    });

    it('should unequip main-hand if equipping to off-hand (no 2H conflict)', async () => {
        // Wait, equipping to off-hand shouldn't unequip main-hand unless main-hand is 2H.
        // Test normal dual wielding case (should NOT unequip main hand)
         mockFindOne.mockResolvedValueOnce({
            documentId: 'e1',
            inventory: [
              mockItem(1, 'main_hand', true, false), // Sword (1H)
              mockItem(2, undefined, false, false)   // Dagger
            ]
          });
    
          await service.equipItem('e1', '2', 'off_hand');
    
          const updateCall = mockUpdate.mock.calls[0][0];
          const newInventory = updateCall.data.inventory;
          
          // Sword STAYS equipped
          const sword = newInventory.find((i: any) => i.id === 1);
          expect(sword.isEquipped).toBe(true);
          expect(sword.slot).toBe('main_hand');
          
          // Dagger equipped
          expect(newInventory.find((i: any) => i.id === 2).slot).toBe('off_hand');
    });

    it('should fail if item not found', async () => {
      mockFindOne.mockResolvedValueOnce({ inventory: [] });
      await expect(service.equipItem('e1', '999', 'main_hand')).rejects.toThrow('Item not found');
    });
  });

  describe('calculateWeight', () => {
      it('should sum weights', async () => {
          mockFindOne.mockResolvedValueOnce({
              inventory: [
                  { quantity: 1, item: { weight: 10 } },
                  { quantity: 2, item: { weight: 5 } }, // 10 total
                  { quantity: 1, item: { weight: 0 } }
              ]
          });
          const weight = await service.calculateWeight('e1');
          expect(weight).toBe(20);
      });

      it('should return 0 if entity not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          const weight = await service.calculateWeight('e1');
          expect(weight).toBe(0);
      });
  });

  // --- HARDENING TESTS ---
  describe('Hardening Edge Cases', () => {
      it('dropItem: should fail if entity not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          await expect(service.dropItem('missing', '1')).rejects.toThrow('Entity not found');
      });

      it('dropItemAt: should fail if entity not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          await expect(service.dropItemAt('missing', '1', {x:0,y:0,z:0})).rejects.toThrow('Entity not found');
      });
      
      it('dropAll: should fail if entity not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          const res = await service.dropAll('missing');
          expect(res.success).toBe(false);
          expect(res.message).toBe('Entity not found');
      });

      it('pickupItem: should fail if actor or loot not found', async () => {
          mockFindOne.mockResolvedValue(null);
          await expect(service.pickupItem('a1', 'l1')).rejects.toThrow('Actor or Loot entity not found');
      });

      it('equipItem: should fail if entity not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          await expect(service.equipItem('missing', '1', 'hand')).rejects.toThrow('Entity not found');
      });

      // Complex Equipment Logic
      it('equipItem: should unequip BOTH Main and Off hand if equipping 2H', async () => {
          // Helper to create "already equipped" items
          const mockItem = (id: number, slot?: string, is2H = false) => ({
             id, documentId: `item${id}`, slot, isEquipped: true,
             item: { name: `Item ${id}`, equipment_data: { properties: is2H ? [{slug:'two-handed'}] : [] } }
          });

          mockFindOne.mockResolvedValueOnce({
              documentId: 'e1',
              inventory: [
                  mockItem(1, 'main_hand'), // Sword
                  mockItem(2, 'off_hand'),  // Shield
                  { ...mockItem(3, undefined, true), isEquipped: false, slot: undefined } // Greataxe (To Equip)
              ]
          });

          await service.equipItem('e1', '3', 'main_hand');

          const updateCall = mockUpdate.mock.calls[0][0];
          const newInventory = updateCall.data.inventory;

          // 1 & 2 Unequipped
          expect(newInventory.find((i: any) => i.id === 1).isEquipped).toBe(false);
          expect(newInventory.find((i: any) => i.id === 2).isEquipped).toBe(false);
          // 3 Equipped
          expect(newInventory.find((i: any) => i.id === 3).isEquipped).toBe(true);
      });
  });
});
