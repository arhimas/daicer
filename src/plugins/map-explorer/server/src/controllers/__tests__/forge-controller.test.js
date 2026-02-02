"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const forge_controller_1 = __importDefault(require("../forge-controller"));
(0, vitest_1.describe)('ForgeController', () => {
    let controller;
    const mockQueueService = {
        addJob: vitest_1.vi.fn(),
        addPixelJob: vitest_1.vi.fn(),
        addBlueprintJob: vitest_1.vi.fn(),
        getJob: vitest_1.vi.fn(),
    };
    const mockStrapi = {
        plugin: vitest_1.vi.fn(() => ({
            service: vitest_1.vi.fn(() => mockQueueService),
        })),
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        controller = (0, forge_controller_1.default)({ strapi: mockStrapi });
    });
    (0, vitest_1.describe)('dispatch', () => {
        (0, vitest_1.it)('should enqueue Pixel job and return jobId', async () => {
            const ctx = {
                request: {
                    body: { prompt: 'Test Sprite', type: 'Monster' }
                },
                body: {},
                throw: vitest_1.vi.fn()
            };
            mockQueueService.addPixelJob.mockResolvedValue({ id: 'job-123' });
            // @ts-expect-error - Mocking context
            await controller.dispatch(ctx);
            (0, vitest_1.expect)(mockQueueService.addPixelJob).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                prompt: 'Test Sprite',
                type: 'Monster'
            }));
            (0, vitest_1.expect)(ctx.body).toEqual({ jobId: 'job-123', status: 'queued' });
        });
        (0, vitest_1.it)('should enqueue Blueprint job and return jobId', async () => {
            const ctx = {
                request: {
                    body: { prompt: 'Test Blue', type: 'Blueprint' }
                },
                body: {},
                throw: vitest_1.vi.fn()
            };
            mockQueueService.addBlueprintJob.mockResolvedValue({ id: 'job-456' });
            // @ts-expect-error - Mocking context
            await controller.dispatch(ctx);
            (0, vitest_1.expect)(mockQueueService.addBlueprintJob).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                prompt: 'Test Blue',
                type: 'Blueprint'
            }));
            (0, vitest_1.expect)(ctx.body).toEqual({ jobId: 'job-456', status: 'queued' });
        });
        (0, vitest_1.it)('should handle errors', async () => {
            const ctx = {
                request: { body: { type: 'Monster' } },
                throw: vitest_1.vi.fn()
            };
            mockQueueService.addPixelJob.mockRejectedValue(new Error('Queue Error'));
            // @ts-expect-error - Mocking context
            await controller.dispatch(ctx);
            (0, vitest_1.expect)(ctx.throw).toHaveBeenCalledWith(500, vitest_1.expect.any(Error));
        });
    });
    (0, vitest_1.describe)('status', () => {
        (0, vitest_1.it)('should return job status and result', async () => {
            const ctx = {
                params: { jobId: 'job-123' },
                body: {},
                notFound: vitest_1.vi.fn(),
                throw: vitest_1.vi.fn()
            };
            const mockJob = {
                id: 'job-123',
                getState: vitest_1.vi.fn().mockResolvedValue('completed'),
                returnvalue: { pixelData: [] },
                progress: 100
            };
            mockQueueService.getJob.mockResolvedValue(mockJob);
            // @ts-expect-error - Mocking context
            await controller.status(ctx);
            (0, vitest_1.expect)(mockQueueService.getJob).toHaveBeenCalledWith('job-123');
            (0, vitest_1.expect)(ctx.body).toEqual({
                id: 'job-123',
                state: 'completed',
                result: { pixelData: [] },
                progress: 100
            });
        });
        (0, vitest_1.it)('should return 404 if job not found', async () => {
            const ctx = {
                params: { jobId: 'missing' },
                notFound: vitest_1.vi.fn()
            };
            mockQueueService.getJob.mockResolvedValue(null);
            // @ts-expect-error - Mocking context
            await controller.status(ctx);
            (0, vitest_1.expect)(ctx.notFound).toHaveBeenCalledWith('Job not found');
        });
    });
});
