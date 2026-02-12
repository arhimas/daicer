import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../spawn-service';
import { EntityDeriver } from '@/api/game/src/engine';

// Mock EntityDeriver
vi.mock('@/api/game/src/engine', () => ({
    EntityDeriver: {
        derive: vi.fn(),
    },
}));

describe('SpawnService', () => {
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

    describe('spawnMonster', () => {
        it('should spawn a monster successfully', async () => {
            const mockMonster = {
                documentId: 'mon-1',
                name: 'Goblin',
                stats: { strength: 10 },
                hp: 10,
                ac: 12,
                inventory: []
            };
            const mockRoom = { documentId: 'room-1', roomId: 'r1' };
            const mockSheet = { documentId: 'sheet-1' };
            const mockDerivation = { hp: 10, maxHp: 10, ac: 12, level: 1, speed: { walk: 30 } };

            mockDocuments.findOne.mockResolvedValue(mockMonster);
            mockDocuments.findMany.mockResolvedValue([mockRoom]); // Room search
            // Existing check returns empty
            mockDocuments.findMany.mockResolvedValueOnce([mockRoom]).mockResolvedValueOnce([]); 
            
            mockDocuments.create.mockResolvedValue(mockSheet);
            (EntityDeriver.derive as any).mockReturnValue(mockDerivation);

            const result = await spawnService.spawnMonster('r1', 'mon-1', { x: 0, y: 0, z: 0 });

            expect(result).toBe(mockSheet);
            expect(mockDocuments.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    name: 'Goblin',
                    room: 'room-1',
                    entity: 'mon-1'
                })
            }));
            expect(mockDeriveAndPersist).toHaveBeenCalledWith('sheet-1');
        });

        it('should throw if position occupied', async () => {
            const mockMonster = { documentId: 'mon-1', name: 'Goblin' };
            const mockRoom = { documentId: 'room-1' };
            const existingSheet = { name: 'Occupier' };

            mockDocuments.findOne.mockResolvedValue(mockMonster);
            mockDocuments.findMany
                .mockResolvedValueOnce([mockRoom]) // Room
                .mockResolvedValueOnce([existingSheet]); // Collision check

            (EntityDeriver.derive as any).mockReturnValue({});

            await expect(spawnService.spawnMonster('r1', 'mon-1', { x: 0, y: 0, z: 0 }))
                .rejects.toThrow('Position 0,0,0 is occupied by Occupier');
        });
    });

    describe('spawnCharacter', () => {
        it('should spawn a character successfully', async () => {
             const mockChar = {
                documentId: 'char-1',
                name: 'Hero',
                race: { documentId: 'race-1' },
                classes: [{ level: 1, class: { documentId: 'class-1', name: 'Fighter', hit_die: '1d10' } }],
                stats: { strength: 16 }
            };
            const mockRoom = { documentId: 'room-1' };
            const mockSheet = { documentId: 'sheet-2' };
            const mockDerivation = { hp: 12, maxHp: 12, ac: 15, level: 1, speed: { walk: 30 } };

            mockDocuments.findOne.mockResolvedValue(mockChar);
            mockDocuments.findMany
                .mockResolvedValueOnce([mockRoom])
                .mockResolvedValueOnce([]); // Collision

            mockDocuments.create.mockResolvedValue(mockSheet);
            (EntityDeriver.derive as any).mockReturnValue(mockDerivation);

            const result = await spawnService.spawnCharacter('r1', 'char-1', { x: 1, y: 1, z: 0 }, 'owner-1');

            expect(result).toBe(mockSheet);
            expect(mockDocuments.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    name: 'Hero',
                    owner: 'owner-1',
                    type: 'player'
                })
            }));
        });
    });

    describe('spawn (router)', () => {
        it('should route to spawnMonster', async () => {
            spawnService.spawnMonster = vi.fn();
            const payload = { type: 'monster', blueprintId: 'mon-1', position: { x: 0, y: 0, z: 0 } };
            
            await spawnService.spawn('r1', payload);
            
            expect(spawnService.spawnMonster).toHaveBeenCalledWith('r1', 'mon-1', payload.position);
        });

        it('should route to spawnCharacter', async () => {
             spawnService.spawnCharacter = vi.fn();
             const payload = { type: 'character', blueprintId: 'char-1', position: { x: 0, y: 0, z: 0 }, ownerId: 'p1' };

             await spawnService.spawn('r1', payload);

             expect(spawnService.spawnCharacter).toHaveBeenCalledWith('r1', 'char-1', payload.position, 'p1');
        });
    });
});
