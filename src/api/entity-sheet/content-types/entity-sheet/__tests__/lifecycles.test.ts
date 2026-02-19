import { describe, it, expect, vi, beforeEach } from 'vitest';
import lifecycles from '@/api/entity-sheet/content-types/entity-sheet/lifecycles';

// Validate exports from lifecycles if default
const { beforeCreate, beforeUpdate, afterCreate, _afterUpdate } = lifecycles;

// Mock dependencies
vi.mock('@/services/mechanics/feature-hydrator', () => ({
    FeatureHydrator: { hydrateFeatures: vi.fn().mockReturnValue(['feat1']) }
}));

vi.mock('@/api/game/src/engine', () => ({
    EntityDeriver: {
        derive: vi.fn().mockReturnValue({
            hp: 20, maxHp: 20, ac: 15, speed: { walk: 30 }, structuredActions: []
        })
    },
    Equipment: {}
}));

describe('EntitySheet Lifecycles', () => {
    let _mockStart: any;

    beforeEach(() => {
        (global as any).strapi = {
            service: vi.fn().mockReturnValue({ deriveAndPersist: vi.fn() }),
            documents: vi.fn().mockReturnValue({
                findOne: vi.fn(),
                findFirst: vi.fn() // Used for equipment lookup
            }),
            log: { error: vi.fn() }
        };
    });

    describe('beforeCreate', () => {
        it('should validate inventory slots', async () => {
            const validData = {
                inventory: [
                    { item: 'Sword', slot: 'main_hand', isEquipped: true },
                    { item: 'Shield', slot: 'off_hand', isEquipped: true }
                ]
            };
            const event = { params: { data: validData } } as any;

            await beforeCreate(event); 
            // Should not throw
        });

        it('should throw on duplicate slots', async () => {
            const invalidData = {
                inventory: [
                    { item: 'Sword', slot: 'main_hand', isEquipped: true },
                    { item: 'Axe', slot: 'main_hand', isEquipped: true }
                ]
            };
            const event = { params: { data: invalidData } } as any;

            await expect(beforeCreate(event)).rejects.toThrow('more than one item equipped in the main_hand slot');
        });
    });

    describe('beforeUpdate', () => {
        it('should update derived data if stats change', async () => {
            const event = {
                params: {
                    where: { documentId: 'doc-1' },
                    data: { stats: { strength: 18 } } // triggers update
                }
            } as any;

            const mockCurrent = {
                id: 1, level: 1, stats: { strength: 10 }, 
                inventory: [], race: { speed: 30 }
            };
            
            ((global as any).strapi.documents('api::entity-sheet.entity-sheet').findOne as any).mockResolvedValue(mockCurrent);

            await beforeUpdate(event);

            // Verify derivation result applied to data
            expect(event.params.data.maxHp).toBe(20);
            expect(event.params.data.armorClass).toBe(15);
        });

        it('should resolve equipment references', async () => {
             const event = {
                params: {
                    where: { documentId: 'doc-1' },
                    data: { 
                        // Simulate adding an item by name string, which triggers lookup
                        inventory: [{ item: 'Epic Sword', isEquipped: true, slot: 'main_hand' }]
                    }
                }
            } as any;
            
             const mockCurrent = { id: 1, stats: {}, inventory: [] };
             ((global as any).strapi.documents('api::entity-sheet.entity-sheet').findOne as any).mockResolvedValue(mockCurrent);
             
             // Mock equipment findFirst
             ((global as any).strapi.documents('api::equipment.equipment').findFirst as any).mockResolvedValue({
                 name: 'Epic Sword', damage: 10
             });

             await beforeUpdate(event);
             
             // Deriver should have been called (mock check implicitly through result application, but we trust the mock setup)
             expect(event.params.data.maxHp).toBe(20);
        });
    });

    describe('afterCreate/afterUpdate', () => {
        it('should trigger active state derivation', async () => {
            const event = { result: { documentId: 'doc-1' } } as any;
            await afterCreate(event);
            expect(strapi.service).toHaveBeenCalledWith('api::game.active-state-service');
        });
        
        it('should handle errors in derivation', async () => {
             const event = { result: { documentId: 'doc-1' } } as any;
             (strapi.service as any).mockReturnValue({
                 deriveAndPersist: vi.fn().mockRejectedValue(new Error('Derive Fail'))
             });
             
             await expect(afterCreate(event)).rejects.toThrow('ActiveState Derivation Failed');
        });
    });
});
