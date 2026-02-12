import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../turn-processing';

// Mock Dependencies
vi.mock('../../src/engine/entropy', () => ({
    EntropySystem: class {
        constructor() { }
        advanceTurn() { return { newEvent: { visibility: 'dm' } }; }
        get state() { return {}; }
    }
}));

// Mock map-visualization import
vi.mock('../map-visualization', () => ({
    generateMapImage: vi.fn().mockResolvedValue(Buffer.from('image')),
}));

describe('TurnProcessing', () => {
    let strapi: any;
    let turnProcessing: any;
    let mockServices: any;
    let mockDocuments: any;
    let mockUpload: any;

    beforeEach(() => {
        mockServices = {
            'api::game.narrative-engine': { generateNarrativeResponse: vi.fn() },
            'api::game.turn-persistence': { 
                persistTurn: vi.fn(), 
                clearPlayerActions: vi.fn(),
                updateCharacterPosition: vi.fn()
            },
            'api::game.action-engine': { dispatch: vi.fn() },
            'api::game.game-ledger': { logEvent: vi.fn() },
            'api::game.spawn-service': { spawnMonster: vi.fn(), spawnCharacter: vi.fn() },
            'api::game.biome-spawn-service': { populateChunk: vi.fn() },
            'api::voxel-engine.voxel-engine': { getChunk: vi.fn() },
            'api::narrator.narrator': { processAction: vi.fn() }
        };

        mockDocuments = {
            update: vi.fn(),
            findOne: vi.fn(),
            findMany: vi.fn(),
        };

        mockUpload = {
            upload: vi.fn().mockResolvedValue([{ id: 'img-1' }])
        };

        strapi = {
            service: vi.fn().mockImplementation((name) => mockServices[name]),
            documents: vi.fn().mockReturnValue(mockDocuments),
            plugin: vi.fn().mockReturnValue({ service: () => mockUpload }),
            log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
        };

        turnProcessing = service({ strapi });
        mockServices['api::game.turn-processing'] = turnProcessing;
    });

    describe('processTurn', () => {
        it('should execute full turn cycle with map generation and entropy', async () => {
            const roomId = 'room-1';
            const mockResponse = { overall_summary: 'Summary', commands: [{ type: 'CMD' }] };
            const mockTurn = { documentId: 'turn-1' };
            const mockChunk = { tiles: [] };

            mockServices['api::game.narrative-engine'].generateNarrativeResponse.mockResolvedValue(mockResponse);
            mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: mockTurn, room: { documentId: roomId } });
            
            // Mock Room fetch for adapt entities
            mockDocuments.findOne.mockResolvedValue({ 
                entity_sheets: [{ documentId: 'p1', type: 'player', position: { x: 0, y: 0 } }],
                id: 1, // for upload ref
            });

            const result = await turnProcessing.processTurn(roomId, 'desc', [], [], 'en', {}, [], 'ctx', 'stream', mockChunk);

            // Entropy Check
            expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ entropyState: {} }) }));
            expect(mockServices['api::game.game-ledger'].logEvent).toHaveBeenCalledWith(roomId, expect.objectContaining({ type: 'ENTROPY_CHANGE' }));

            // Map Gen
            expect(mockUpload.upload).toHaveBeenCalled();
            expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({ 
                documentId: 'turn-1',
                data: { contextImage: 'img-1' }
            }));

            // God Mode Dispatch
            expect(mockServices['api::game.action-engine'].dispatch).toHaveBeenCalledWith(roomId, mockResponse.commands);
            
            expect(result.overall_summary).toBe('Summary');
        });

        it('should handle map generation failure gracefully', async () => {
             const roomId = 'room-1';
             mockDocuments.findOne.mockResolvedValue({});
             mockUpload.upload.mockRejectedValue(new Error('Upload Fail'));
             mockServices['api::game.narrative-engine'].generateNarrativeResponse.mockResolvedValue({});
             mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: {}, room: {} });

             // Should not throw
             await turnProcessing.processTurn(roomId, 'desc', [], [], 'en', {}, [], 'ctx', 'stream', {});
             expect(strapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to generate/upload'), expect.any(Error));
        });
    });

    describe('executeDeterministicTurn', () => {
        it('should handle move commands with exploration', async () => {
            const roomId = 'room-1';
            const actions = [{ type: 'move', entityId: 'ent-1', payload: { x: 16, y: 16, z: 0 } }]; // Move to 1,1 chunk
            
            const mockRoom = { 
                documentId: roomId, 
                entity_sheets: [{ documentId: 'ent-1', position: { x: 0, y: 0, z: 0 } }],
                exploredTiles: [],
                exploredChunks: [],
                world: { id: 'w1' }
            };
            mockDocuments.findOne.mockResolvedValue(mockRoom);
            mockServices['api::voxel-engine.voxel-engine'].getChunk.mockResolvedValue({ 
                tiles: { 3: { 8: { 8: { biome: 'forest' } } } } // Mock center tile helper access
            });
            
            mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: { documentId: 'turn-d' } });

            await turnProcessing.executeDeterministicTurn(roomId, actions);

            expect(mockServices['api::game.turn-persistence'].updateCharacterPosition).toHaveBeenCalledWith('ent-1', 16, 16, 0);
            
            // Exploration
            expect(mockServices['api::voxel-engine.voxel-engine'].getChunk).toHaveBeenCalled();
            expect(mockServices['api::game.biome-spawn-service'].populateChunk).toHaveBeenCalledWith(1, 1, 'forest', roomId);
            
            // DB Update for exploration
            expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    exploredChunks: expect.arrayContaining(['1,1'])
                })
            }));
        });

        it('should handle spawn commands', async () => {
             const roomId = 'room-1';
             const actions = [
                 { type: 'spawn', payload: { entityType: 'monster', id: 'm1', position: { x: 0, y: 0 } } },
                 { type: 'spawn', payload: { entityType: 'character', id: 'c1', position: { x: 1, y: 1 } } }
             ];
             
             mockDocuments.findOne.mockResolvedValue({ documentId: roomId });
             mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: {} });

             await turnProcessing.executeDeterministicTurn(roomId, actions);

             expect(mockServices['api::game.spawn-service'].spawnMonster).toHaveBeenCalledWith(roomId, 'm1', { x: 0, y: 0 });
             expect(mockServices['api::game.spawn-service'].spawnCharacter).toHaveBeenCalledWith(roomId, 'c1', { x: 1, y: 1 });
        });

        it('should handle attack commands via delegation', async () => {
             const roomId = 'room-1';
             const actions = [{ type: 'attack', entityId: 'actor-1', payload: { targetId: 'target-1' } }];
             
             mockDocuments.findOne.mockResolvedValue({ documentId: roomId });
             mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: {} });

             await turnProcessing.executeDeterministicTurn(roomId, actions);

             expect(mockServices['api::game.action-engine'].dispatch).toHaveBeenCalledWith(roomId, expect.any(Array));
             const callArgs = mockServices['api::game.action-engine'].dispatch.mock.calls[0][1];
             expect(callArgs[0]).toMatchObject({
                 type: 'ATTACK',
                 payload: { actorId: 'actor-1', targetId: 'target-1' }
             });
        });

        it('should handle collision (prevent move)', async () => {
             const roomId = 'room-1';
             const actions = [{ type: 'move', entityId: 'ent-1', payload: { x: 10, y: 10 } }];
             
             const mockRoom = { 
                 documentId: roomId, 
                 entity_sheets: [
                     { documentId: 'ent-1', position: { x: 0, y: 0 } },
                     { documentId: 'ent-2', position: { x: 10, y: 10 } } // Occupied
                 ] 
             };
             mockDocuments.findOne.mockResolvedValue(mockRoom);
             mockServices['api::game.turn-persistence'].persistTurn.mockResolvedValue({ turn: { documentId: 'turn-d' } });

             await turnProcessing.executeDeterministicTurn(roomId, actions);

             expect(mockServices['api::game.turn-persistence'].updateCharacterPosition).not.toHaveBeenCalled();
             expect(strapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Collision detected'));
        });
    });

    describe('submitAction', () => {
        it('should handle debug mode', async () => {
            const roomId = 'r1';
            await turnProcessing.submitAction(roomId, 'test', { documentId: 'u1' }, 'debug');
            expect(mockServices['api::narrator.narrator'].processAction).toHaveBeenCalledWith(expect.objectContaining({ mode: 'debug' }));
        });

        it('should throw if room not found', async () => {
            mockDocuments.findMany.mockResolvedValue([]);
            await expect(turnProcessing.submitAction('r1', 'a', {})).rejects.toThrow('Room not found');
        });

        it('should throw if user not in room', async () => {
             const roomId = 'room-abc';
             const user = { documentId: 'u999', id: 999 };
             const players = [{ user: { documentId: 'u1', id: 1 } }]; // Different user
             
             mockDocuments.findMany.mockResolvedValue([{ documentId: roomId, players }]);
 
             await expect(turnProcessing.submitAction(roomId, 'attack', user))
                 .rejects.toThrow('User is not a player in this room');
        });

        it('should update player action', async () => {
            const roomId = 'room-abc';
            const user = { documentId: 'u1' };
            const players = [{ user: { documentId: 'u1' }, action: '' }];
            
            mockDocuments.findMany.mockResolvedValue([{ documentId: roomId, players }]);

            await turnProcessing.submitAction(roomId, 'attack', user);

            expect(mockDocuments.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    players: expect.arrayContaining([expect.objectContaining({ action: 'attack', isReady: true })])
                })
            }));
        });
    });
});
