import { describe, it, expect, vi, beforeEach } from 'vitest';
import narratorController from '@/api/narrator/controllers/narrator';

describe('Narrator Controller', () => {
    let ctx: any;
    let mockService: any;

    beforeEach(() => {
        mockService = {
            processAction: vi.fn(),
        };
        (global as any).strapi = {
            service: vi.fn(() => mockService),
        };
    });

    describe('handleAction', () => {
        it('should return bad request if roomId missing', async () => {
             ctx = {
                request: { body: { input: 'hello' } },
                badRequest: vi.fn(),
            };
            await narratorController.handleAction(ctx);
            expect(ctx.badRequest).toHaveBeenCalledWith('Missing roomId or input');
        });

        it('should return bad request if input missing', async () => {
             ctx = {
                request: { body: { roomId: 'r1' } },
                badRequest: vi.fn(),
            };
            await narratorController.handleAction(ctx);
            expect(ctx.badRequest).toHaveBeenCalledWith('Missing roomId or input');
        });

        it('should process action successfully', async () => {
             ctx = {
                request: { body: { roomId: 'r1', input: 'help', mode: 'dm' } },
                state: { user: { documentId: 'u1' } },
                body: null,
                badRequest: vi.fn(),
            };
            mockService.processAction.mockResolvedValue({ message: 'OK' });

            await narratorController.handleAction(ctx);

            expect(mockService.processAction).toHaveBeenCalledWith({
                roomId: 'r1',
                input: 'help',
                mode: 'dm',
                userId: 'u1'
            });
            expect(ctx.body).toEqual({ message: 'OK' });
        });

        it('should default mode to player', async () => {
             ctx = {
                request: { body: { roomId: 'r1', input: 'help' } },
                state: {},
                body: null,
            };
            mockService.processAction.mockResolvedValue({});

            await narratorController.handleAction(ctx);

            expect(mockService.processAction).toHaveBeenCalledWith(expect.objectContaining({
                mode: 'player'
            }));
        });

        it('should handle service errors', async () => {
             ctx = {
                request: { body: { roomId: 'r1', input: 'fail' } },
                state: {}, // Fix: Ensure state exists to avoid crash before service call
                badRequest: vi.fn(),
            };
            mockService.processAction.mockReturnValue(Promise.reject(new Error('Service Fail')));

            await narratorController.handleAction(ctx);

            expect(ctx.badRequest).toHaveBeenCalledWith('Narrator Error', { error: 'Service Fail' });
        });
    });
});
