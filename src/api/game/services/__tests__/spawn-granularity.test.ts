
import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '@/api/game/services/spawn-service';
import { EntityDeriver } from '@/api/game/src/engine';

// Mock Dependencies
vi.mock('@/api/game/src/engine', () => ({
    EntityDeriver: {
        derive: vi.fn((args) => ({
            hp: args.expectedHp || 10, // Mock helper to pass expected HP through args if needed
            maxHp: args.expectedHp || 10,
            ac: 10,
            level: 1,
            speed: { walk: 30 },
            proficiencyBonus: 2
        })),
    },
    // Mock Schemas if they are runtime Zod schemas used in code
    // The service imports schemas. We might need to mock if they are strict.
    // However, usually we can just pass valid data.
}));

// Mock Schemas
vi.mock('@/api/game/schemas/gateway-schemas', () => ({
    BlueprintSchema: {
        parse: (obj: any) => obj,
    },
    SpawnPayloadSchema: {
        parse: (obj: any) => obj, 
    }
}));

describe('Spawn Service Granularity', () => {
    let strapi: any;
    let spawnService: any;
    let mockDocuments: any;
    let mockDeriveAndPersist: any;

    beforeEach(() => {
        mockDocuments = {
            findOne: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
        };
        mockDeriveAndPersist = vi.fn();

        strapi = {
            documents: vi.fn().mockReturnValue(mockDocuments),
            service: vi.fn().mockReturnValue({
                deriveAndPersist: mockDeriveAndPersist
            }),
            log: { info: vi.fn(), error: vi.fn() },
        };

        spawnService = service({ strapi });
    });

    describe('spawnCharacter - Granular Logic', () => {
        const mockRoom = { documentId: 'room-1' };
        
        beforeEach(() => {
             // Default Room & Collision checks
             mockDocuments.findMany
                .mockResolvedValueOnce([mockRoom]) // Room
                .mockResolvedValueOnce([]); // No Collision
             
             mockDocuments.create.mockResolvedValue({ documentId: 'sheet-1' });
        });

        it('should parses hit die correctly from class', async () => {
            const mockChar = {
                documentId: 'char-1',
                name: 'Hero',
                stats: {},
                classes: [{
                    level: 1,
                    class: { documentId: 'c1', name: 'Barbarian', hit_die: '1d12' }
                }]
            };
            mockDocuments.findOne.mockResolvedValue(mockChar);

            await spawnService.spawnCharacter('r1', 'char-1', { x: 0, y: 0, z: 0 });
            
            // Check if EntityDeriver was called with hitDie: 12
            expect(EntityDeriver.derive).toHaveBeenCalledWith(expect.objectContaining({
                hitDie: 12
            }));
        });

        it('should flatten equipment correctly', async () => {
             const mockChar = {
                documentId: 'char-1',
                name: 'Hero',
                stats: {},
                inventory: [
                    { 
                        isEquipped: true, 
                        item: { 
                            documentId: 'i1', 
                            name: 'Sword', 
                            type: 'weapon',     
                            equipment_data: { damage: '1d8' } 
                        } 
                    }
                ]
            };
            mockDocuments.findOne.mockResolvedValue(mockChar);

            await spawnService.spawnCharacter('r1', 'char-1', { x: 0, y: 0, z: 0 });

            expect(EntityDeriver.derive).toHaveBeenCalledWith(expect.objectContaining({
                equipment: expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Sword',
                        damage: '1d8',     
                        equipment_category: { slug: 'weapon' }
                    })
                ])
            }));
        });

        it('should collect traits and proficiencies', async () => {
             const mockChar = {
                documentId: 'char-1',
                name: 'Hero',
                stats: {},
                race: {
                    documentId: 'r1',
                    traits: [{ documentId: 't1' }],
                    proficiencies: [{ documentId: 'p1' }]
                },
                classes: [{
                    level: 1,
                    class: {
                        documentId: 'c1',
                        proficiencies: [{ documentId: 'p2' }]
                    }
                }]
            };
            mockDocuments.findOne.mockResolvedValue(mockChar);

            await spawnService.spawnCharacter('r1', 'char-1', { x: 0, y: 0, z: 0 });

            // Verify create call has flattened arrays
            expect(mockDocuments.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    traits: expect.arrayContaining(['t1']),
                    proficiencies: expect.arrayContaining(['p1', 'p2'])
                })
            }));
        });
    });

    describe('spawn Router - Normalization', () => {
        it('should handle flat coordinates input', async () => {
            spawnService.spawnMonster = vi.fn();
            
            // Input with flat x,y,z instead of position object
            const input = { 
                type: 'monster', 
                blueprintId: 'mon-1', 
                x: 10, y: 20, z: 5 
            };

            await spawnService.spawn('r1', input);

            expect(spawnService.spawnMonster).toHaveBeenCalledWith(
                'r1', 
                'mon-1', 
                { x: 10, y: 20, z: 5 }
            );
        });

        it('should prefer explicit position object', async () => {
            spawnService.spawnMonster = vi.fn();
            
            const input = { 
                type: 'monster', 
                blueprintId: 'mon-1', 
                x: 10, y: 20, z: 5,
                position: { x: 99, y: 99, z: 99 }
            };

            await spawnService.spawn('r1', input);

            expect(spawnService.spawnMonster).toHaveBeenCalledWith(
                'r1', 
                'mon-1', 
                { x: 99, y: 99, z: 99 }
            );
        });
    });
});
