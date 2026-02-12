import { describe, it, expect, vi, beforeEach } from 'vitest';
import controller from '../engine';

describe('Engine Controller', () => {
    let mockServices: any;
    let strapi: any;
    let engineController: any;
    let ctx: any;

    beforeEach(() => {
        mockServices = {
            'api::game.spawn-service': {
                spawnMonster: vi.fn(),
                spawnCharacter: vi.fn(),
            },
            'api::game.turn-processing': {
                executeDeterministicTurn: vi.fn(),
            }
        };

        strapi = {
            service: vi.fn().mockImplementation((name) => mockServices[name]),
            log: { error: vi.fn(), info: vi.fn() }
        };

        engineController = controller({ strapi });

        ctx = {
            request: { body: {} },
            state: {},
            badRequest: vi.fn(),
            body: null,
        };
    });

    describe('spawn', () => {
        it('should spawn monster', async () => {
            ctx.request.body = {
                roomId: 'r1', type: 'monster', entityId: 'm1', position: { x: 0, y: 0 }
            };
            mockServices['api::game.spawn-service'].spawnMonster.mockResolvedValue({ id: 'spawned-m1' });

            await engineController.spawn(ctx);

            expect(mockServices['api::game.spawn-service'].spawnMonster).toHaveBeenCalledWith('r1', 'm1', { x: 0, y: 0 });
            expect(ctx.body).toEqual({ id: 'spawned-m1' });
        });

        it('should spawn character', async () => {
             ctx.request.body = {
                 roomId: 'r1', type: 'character', entityId: 'c1', position: { x: 0, y: 0 }
             };
             mockServices['api::game.spawn-service'].spawnCharacter.mockResolvedValue({ id: 'spawned-c1' });
 
             await engineController.spawn(ctx);
 
             expect(mockServices['api::game.spawn-service'].spawnCharacter).toHaveBeenCalledWith('r1', 'c1', { x: 0, y: 0 });
        });

        it('should validate required fields', async () => {
            ctx.request.body = { roomId: 'r1' }; // Missing others
            await engineController.spawn(ctx);
            expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Missing required fields'));
        });

        it('should validate type', async () => {
            ctx.request.body = { roomId: 'r1', type: 'invalid', entityId: 'e1', position: {} };
            await engineController.spawn(ctx);
            expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Invalid type'));
        });

        it('should handle service errors', async () => {
             ctx.request.body = { roomId: 'r1', type: 'monster', entityId: 'm1', position: {} };
             mockServices['api::game.spawn-service'].spawnMonster.mockRejectedValue(new Error('Spawn Fail'));
             
             await engineController.spawn(ctx);
             
             expect(ctx.badRequest).toHaveBeenCalledWith('Spawn failed', { error: 'Spawn Fail' });
        });
    });

    describe('execute', () => {
        it('should delegate execution to turn-processing', async () => {
            ctx.request.body = { roomId: 'r1', actions: [] };
            ctx.state.user = { id: 1 };
            mockServices['api::game.turn-processing'].executeDeterministicTurn.mockResolvedValue({ success: true });

            await engineController.execute(ctx);

            expect(mockServices['api::game.turn-processing'].executeDeterministicTurn).toHaveBeenCalledWith('r1', [], { id: 1 });
            expect(ctx.body).toEqual({ success: true });
        });

        it('should handle errors', async () => {
             ctx.request.body = { roomId: 'r1' };
             mockServices['api::game.turn-processing'].executeDeterministicTurn.mockRejectedValue(new Error('Exec Fail'));

             await engineController.execute(ctx);

             expect(ctx.badRequest).toHaveBeenCalledWith('Execution failed', { error: 'Exec Fail' });
        });
    });
});
