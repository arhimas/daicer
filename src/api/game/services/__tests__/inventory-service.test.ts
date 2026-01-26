import { vi } from 'vitest';
import inventoryServiceFactory from '../inventory-service';

// Mock Strapi
// @ts-ignore
global.strapi = {
    documents: vi.fn(),
    service: vi.fn(),
};

describe('Inventory Service', () => {

    const makeItem = (id: number, name: string, slot: string | null = null, props: string[] = [], weight = 0) => ({
        id,
        documentId: `doc-${id}`,
        item: {
             name,
             weight,
             equipment_data: {
                 properties: props.map(p => ({ slug: p }))
             }
        },
        slot: slot,
        isEquipped: !!slot,
        quantity: 1
    });

    describe('equipItem', () => {
        it('unequips Main Hand when equipping Two-Handed weapon', async () => {
            const initialInventory = [
                makeItem(1, 'Dagger', 'main_hand'), // Currently equipped
                makeItem(2, 'Greatsword', null, ['two-handed']) // Target
            ];

            const updateMock = vi.fn();
            // @ts-ignore
            strapi.documents.mockReturnValue({
                findOne: vi.fn().mockResolvedValue({ 
                    documentId: 'ent-1', inventory: initialInventory 
                }),
                update: updateMock
            });

            const service = inventoryServiceFactory({ strapi });
            await service.equipItem('ent-1', '2', 'main_hand');

            const updatedInventory = updateMock.mock.calls[0][0].data.inventory;
            const dagger = updatedInventory.find((i: any) => i.id === 1);
            const sword = updatedInventory.find((i: any) => i.id === 2);

            expect(dagger.isEquipped).toBe(false);
            expect(sword.isEquipped).toBe(true);
            expect(sword.slot).toBe('main_hand');
        });

        it('unequips Off Hand when equipping Two-Handed weapon', async () => {
             const initialInventory = [
                makeItem(1, 'Shield', 'off_hand'),
                makeItem(2, 'Greatsword', null, ['two-handed'])
            ];

            const updateMock = vi.fn();
            // @ts-ignore
            strapi.documents.mockReturnValue({
                findOne: vi.fn().mockResolvedValue({ documentId: 'ent-1', inventory: initialInventory }),
                update: updateMock
            });

            const service = inventoryServiceFactory({ strapi });
            await service.equipItem('ent-1', '2', 'main_hand'); // 2H occupies both logical slots (mechanically just Main but forces Off empty)

            const updatedInventory = updateMock.mock.calls[0][0].data.inventory;
            const shield = updatedInventory.find((i: any) => i.id === 1);
            
            expect(shield.isEquipped).toBe(false); // Should be unequipped
        });

        it('unequips Two-Handed weapon when equipping Off Hand', async () => {
            const initialInventory = [
                 makeItem(1, 'Greatsword', 'main_hand', ['two-handed']),
                 makeItem(2, 'Shield', null)
             ];
 
             const updateMock = vi.fn();
             // @ts-ignore
             strapi.documents.mockReturnValue({
                 findOne: vi.fn().mockResolvedValue({ documentId: 'ent-1', inventory: initialInventory }),
                 update: updateMock
             });
 
             const service = inventoryServiceFactory({ strapi });
             await service.equipItem('ent-1', '2', 'off_hand');
 
             const updatedInventory = updateMock.mock.calls[0][0].data.inventory;
             const sword = updatedInventory.find((i: any) => i.id === 1);
             const shield = updatedInventory.find((i: any) => i.id === 2);
             
             expect(sword.isEquipped).toBe(false);
             expect(shield.isEquipped).toBe(true);
        });
    });

    describe('calculateWeight', () => {
        it('sums weights correctly', async () => {
             const inv = [
                 makeItem(1, 'Rock', null, [], 5),
                 { ...makeItem(2, 'Feather', null, [], 0.1), quantity: 10 }
             ];
             
             // @ts-ignore
             strapi.documents.mockReturnValue({
                 findOne: vi.fn().mockResolvedValue({ inventory: inv })
             });
             
             const service = inventoryServiceFactory({ strapi });
             const weight = await service.calculateWeight('ent-1');
             
             // 5 + (0.1 * 10) = 6
             expect(weight).toBe(6);
        });
    });
});
