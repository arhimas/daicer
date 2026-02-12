import { describe, it, expect, vi, beforeEach } from 'vitest';
import voxelEngineControllerFactory from '../voxel-engine';

describe('VoxelEngine Controller', () => {
    let strapi: any;
    let controller: any;
    let mockService: any;

    beforeEach(() => {
        mockService = {
            getChunk: vi.fn(),
        };
        strapi = {
            service: vi.fn(() => mockService),
            log: { error: vi.fn() },
        };
        controller = voxelEngineControllerFactory({ strapi });
    });

    describe('voxelPreview', () => {
        it('should return bad request if config missing', async () => {
            const ctx = {
                request: { body: {} },
                badRequest: vi.fn(),
            };
            await controller.voxelPreview(ctx);
            expect(ctx.badRequest).toHaveBeenCalledWith('Missing config');
        });

        it('should handle single chunk request', async () => {
            const ctx = {
                request: { body: { x: 1, y: 2, config: {}, world: 'w1' } },
                body: null,
            };
            mockService.getChunk.mockResolvedValue({ id: 'chunk-data' });

            await controller.voxelPreview(ctx);

            expect(mockService.getChunk).toHaveBeenCalledWith(1, 2, {}, 'w1');
            expect(ctx.body).toEqual({ id: 'chunk-data' });
        });

        it('should default to 0,0 if coords missing', async () => {
             const ctx = {
                request: { body: { config: {} } },
                body: null,
            };
            mockService.getChunk.mockResolvedValue({});

            await controller.voxelPreview(ctx);

            expect(mockService.getChunk).toHaveBeenCalledWith(0, 0, {}, undefined);
        });

        it('should handle batch chunk requests', async () => {
            const ctx = {
                request: { 
                    body: { 
                        chunks: [{ x: 0, y: 0 }, { x: 1, y: 1 }], 
                        config: { mode: 'batch' } 
                    } 
                },
                body: null,
            };
            mockService.getChunk.mockResolvedValueOnce('chunkA').mockResolvedValueOnce('chunkB');

            await controller.voxelPreview(ctx);

            expect(mockService.getChunk).toHaveBeenCalledTimes(2);
            expect(ctx.body).toEqual(['chunkA', 'chunkB']);
        });

        it('should handle errors gracefully', async () => {
            const ctx = {
                request: { body: { config: {} } },
                internalServerError: vi.fn(),
            };
            mockService.getChunk.mockRejectedValue(new Error('Boom'));

            await controller.voxelPreview(ctx);

            expect(strapi.log.error).toHaveBeenCalled();
            expect(ctx.internalServerError).toHaveBeenCalledWith('Failed to generate chunk', expect.any(Error));
        });
    });
});
