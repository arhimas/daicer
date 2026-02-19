import { describe, it, expect, vi, beforeEach } from 'vitest';
import actionEngineFactory from '@/api/game/services/action-engine';

describe('Action Engine: Legacy Wrappers', () => {
    let actionEngine: any;
    let mockStrapi: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockStrapi = {
            documents: vi.fn((_uid) => ({
                findOne: vi.fn(async ({ documentId }) => {
                    if (documentId === 'legacy-actor') {
                        return {
                            documentId: 'legacy-actor',
                            room: { documentId: 'legacy-room', config: { chunkSize: 16 } }, // Return room for getRoomFor
                            position: { x: 0, y: 0, z: 0 },
                            speed: 30,
                            computedActions: [{ id: 'sword', damage: [], attackBonus: 5 }]
                        };
                    }
                    if (documentId === 'target') return { documentId: 'target', hp: 10, armorClass: 10 };
                    return null;
                }),
                create: vi.fn(),
                update: vi.fn(),
                findMany: vi.fn().mockResolvedValue([]),
            })),
            service: vi.fn((uid) => {
                 if (uid === 'api::voxel-engine.voxel-engine') {
                     return { editTerrain: vi.fn() };
                 }
                 return null;
            }),
        };

        vi.stubGlobal('strapi', mockStrapi);
        actionEngine = actionEngineFactory({ strapi: mockStrapi });
    });

    describe('handleMove', () => {
        it('should throw if command type is invalid', async () => {
            await expect(actionEngine.handleMove({ type: 'ATTACK' })).rejects.toThrow('Invalid command type');
        });

        it('should delegate to resolveMove and persist', async () => {
            // Mock resolveMove 
            // We can't easily spy on internal methods of the returned object unless we wrap them.
            // But we can verify the side effects or the result.
            // Or Mock resolveMove if possible. 
            // The factory returns an object literal. We'd have to spy on it AFTER creation.
            const spy = vi.spyOn(actionEngine, 'resolveMove').mockResolvedValue({
                success: true,
                message: 'Moved',
                events: [],
                stateDiff: { updates: [], creates: [], deletes: [] }
            });
            const spyPersist = vi.spyOn(actionEngine, 'persistResult').mockResolvedValue(undefined);

            const command = { type: 'MOVE', payload: { actorId: 'legacy-actor', targetPosition: {x:1,y:0,z:0} } };
            
            await actionEngine.handleMove(command);
            
            expect(spy).toHaveBeenCalled();
            // It calls getRoomFor internally
            expect(spy).toHaveBeenCalledWith(command, 'legacy-room');
            expect(spyPersist).toHaveBeenCalled();
        });
    });

    describe('handleAttack', () => {
         it('should throw if command type is invalid', async () => {
            await expect(actionEngine.handleAttack({ type: 'MOVE' })).rejects.toThrow('Invalid command type');
        });

        it('should delegate to resolveAttack', async () => {
             const spy = vi.spyOn(actionEngine, 'resolveAttack').mockResolvedValue({
                success: true,
                message: 'Hit',
                events: [],
                stateDiff: { updates: [], creates: [], deletes: [] }
            });
            
             const command = { type: 'ATTACK', payload: { actorId: 'legacy-actor', targetId: 'target' } };
             await actionEngine.handleAttack(command);
             
             expect(spy).toHaveBeenCalledWith(command, 'legacy-room');
        });
    });

    describe('handleModifyTerrain', () => {
        it('should execute terrain modification logic', async () => {
            // validating payload extraction and voxel engine call
            const command = {
                type: 'MODIFY_TERRAIN',
                payload: {
                    actorId: 'legacy-actor',
                    center: { x: 10, y: 10, z: 0 },
                    radius: 2,
                    type: 'Lava'
                }
            };
            
            // We need to spy on the voxel engine service
            const voxelMock = { editTerrain: vi.fn().mockResolvedValue(undefined) };
            mockStrapi.service = vi.fn().mockReturnValue(voxelMock);
            
            // handleModifyTerrain calls strapi.service('api::voxel-engine.voxel-engine')
            // It does NOT call resolveModifyTerrain? Wait.
            // The file shows resolveModifyTerrain delegates to handleModifyTerrain via strapi.service('api::game.action-engine')!
            // But handleModifyTerrain implementation is IN THIS FILE.
            
            // Testing handleModifyTerrain directly:
            const result = await actionEngine.handleModifyTerrain(command);
            
            expect(result.success).toBe(true);
            expect(voxelMock.editTerrain).toHaveBeenCalled();
            // Check loop count? radius 2 -> area ~13 blocks.
            // modifications count > 0.
            expect(result.message).toMatch(/Modified \d+/);
        });
    });
});
