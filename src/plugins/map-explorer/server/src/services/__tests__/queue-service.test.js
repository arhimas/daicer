"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const queue_service_1 = __importDefault(require("../queue-service"));
// Queue removed
// ... mocks ...
// Hoist mocks to share between factory and tests
const { mockAdd, mockGetJob } = vitest_1.vi.hoisted(() => ({
    mockAdd: vitest_1.vi.fn(),
    mockGetJob: vitest_1.vi.fn(),
    // mockWorkerData removed
}));
vitest_1.vi.mock('bullmq', () => {
    return {
        Queue: vitest_1.vi.fn().mockImplementation(function () {
            return {
                add: (...args) => {
                    console.log('[MockQueue] add called with:', args);
                    return mockAdd(...args);
                },
                getJob: mockGetJob,
                getJobCounts: vitest_1.vi.fn().mockResolvedValue({}),
                getJobs: vitest_1.vi.fn().mockResolvedValue([]),
                on: vitest_1.vi.fn(),
                close: vitest_1.vi.fn(),
                events: {
                    on: vitest_1.vi.fn(),
                },
            };
        }),
        Worker: vitest_1.vi.fn(),
        QueueEvents: vitest_1.vi.fn(),
    };
});
(0, vitest_1.describe)('QueueService', () => {
    let service;
    const mockStrapi = {
        log: { warn: vitest_1.vi.fn(), info: vitest_1.vi.fn(), error: vitest_1.vi.fn() },
        config: { get: vitest_1.vi.fn() },
        plugin: vitest_1.vi.fn(), // map-explorer plugin
    };
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = (0, queue_service_1.default)({ strapi: mockStrapi });
    });
    (0, vitest_1.describe)('initialize', () => {
        (0, vitest_1.it)('should throw error if Redis config is missing', async () => {
            mockStrapi.config.get.mockReturnValue(null);
            await (0, vitest_1.expect)(service.initialize()).rejects.toThrow('Redis configuration is MANDATORY');
        });
        (0, vitest_1.it)('should initialize Pixel and Blueprint Queues', async () => {
            mockStrapi.config.get.mockReturnValue({ host: 'localhost' });
            await service.initialize();
            // Expect 2 queues initialized
            (0, vitest_1.expect)(mockStrapi.log.info).toHaveBeenCalledWith('Pixel Forge Queues Initialized (Pixel: 1, Blueprint: 2)');
        });
    });
    (0, vitest_1.describe)('addPixelJob', () => {
        (0, vitest_1.it)('should throw if queues not initialized', async () => {
            await (0, vitest_1.expect)(service.addPixelJob({})).rejects.toThrow('Pixel Queue not initialized');
        });
        (0, vitest_1.it)('should add job to pixel queue', async () => {
            mockStrapi.config.get.mockReturnValue({ host: 'localhost' });
            await service.initialize();
            const jobData = { prompt: 'test' };
            await service.addPixelJob(jobData);
            (0, vitest_1.expect)(mockAdd).toHaveBeenCalledWith('generate-sprite', vitest_1.expect.objectContaining(jobData), vitest_1.expect.anything());
        });
    });
    (0, vitest_1.describe)('addBlueprintJob', () => {
        (0, vitest_1.it)('should add job to blueprint queue', async () => {
            mockStrapi.config.get.mockReturnValue({ host: 'localhost' });
            await service.initialize();
            const jobData = { prompt: 'blue test', type: 'Blueprint' };
            await service.addBlueprintJob(jobData);
            (0, vitest_1.expect)(mockAdd).toHaveBeenCalledWith('generate-blueprint', vitest_1.expect.objectContaining(jobData), vitest_1.expect.anything());
        });
    });
});
