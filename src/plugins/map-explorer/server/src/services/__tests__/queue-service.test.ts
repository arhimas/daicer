import { describe, it, expect, vi, beforeEach } from 'vitest';
import queueServiceFactory from '../queue-service';

// Hoisted mocks to ensure they are available for the factory
const mocks = vi.hoisted(() => ({
    queue: {
        add: vi.fn(),
        getJobCounts: vi.fn(),
        getJob: vi.fn(),
        getJobs: vi.fn(),
    },
    worker: {
        on: vi.fn(),
        close: vi.fn(),
    }
}));

vi.mock('bullmq', () => {
    return {
        Queue: class {
            constructor() {
                return mocks.queue;
            }
        },
        Worker: class {
            constructor() {
                return mocks.worker;
            }
        }
    };
});

// Mock Entity Geometry
vi.mock('../utils/entity-geometry', () => ({
    getPixelDimensions: vi.fn(() => 32),
}));

describe('QueueService', () => {
    let service: any;
    let mockStrapi: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStrapi = {
            config: {
                get: vi.fn((path) => {
                    if (path === 'plugin::map-explorer.redis') return { host: 'localhost' };
                    if (path === 'plugin::map-explorer.queue') return { retentionSuccess: 50 };
                    return null;
                })
            },
            log: {
                info: vi.fn(),
                error: vi.fn(),
            },
            plugin: vi.fn().mockReturnValue({
                service: vi.fn().mockReturnValue({
                    generatePixelData: vi.fn(),
                    generateVoxelStructure: vi.fn(),
                    generateBlueprint: vi.fn(),
                })
            })
        };
        service = queueServiceFactory({ strapi: mockStrapi });
    });

    describe('initialize', () => {
        it('should create queues and workers', async () => {
             await service.initialize();
             expect(mockStrapi.config.get).toHaveBeenCalledWith('plugin::map-explorer.redis');
             expect(mockStrapi.log.info).toHaveBeenCalledWith(expect.stringContaining('Initialized'));
        });

        it('should throw if redis config missing', async () => {
             mockStrapi.config.get.mockReturnValue(null);
             await expect(service.initialize()).rejects.toThrow('Redis configuration is MANDATORY');
        });
    });

    describe('Job Management', () => {
        beforeEach(async () => {
             await service.initialize();
             mocks.queue.add.mockResolvedValue({ id: '1' });
        });

        it('should add pixel job', async () => {
             await service.addPixelJob({ size: 'Medium' });
             expect(mocks.queue.add).toHaveBeenCalledWith(
                 'generate-sprite',
                 expect.objectContaining({ width: 32, height: 32 }),
                 expect.anything()
             );
        });

        it('should add blueprint job', async () => {
            await service.addBlueprintJob({ size: 'Medium' });
             expect(mocks.queue.add).toHaveBeenCalledWith(
                 'generate-blueprint',
                 expect.objectContaining({ width: 32 }),
                 expect.anything()
             );
        });

        it('should route legacy addJob to blueprint', async () => {
             await service.addJob({ type: 'Blueprint', size: 'Medium' });
             expect(mocks.queue.add).toHaveBeenCalledWith('generate-blueprint', expect.anything(), expect.anything());
        });

        it('should route legacy addJob to pixel', async () => {
             await service.addJob({ type: 'Entity', size: 'Medium' });
             expect(mocks.queue.add).toHaveBeenCalledWith('generate-sprite', expect.anything(), expect.anything());
        });
    });

    describe('getJob', () => {
        beforeEach(async () => { await service.initialize(); });

        it('should find job in pixel queue', async () => {
             mocks.queue.getJob.mockResolvedValueOnce({ id: '1', name: 'pixel' });
             const job = await service.getJob('1');
             expect(job).toEqual({ id: '1', name: 'pixel' });
        });

        it('should fallback to blueprint queue', async () => {
             mocks.queue.getJob
                .mockResolvedValueOnce(null) // Pixel miss
                .mockResolvedValueOnce({ id: '1', name: 'blueprint' }); // Blueprint hit
             
             const job = await service.getJob('1');
             expect(job).toEqual({ id: '1', name: 'blueprint' });
        });
    });

    describe('getQueueSummary', () => {
        beforeEach(async () => { await service.initialize(); });

        it('should aggregate counts', async () => {
             mocks.queue.getJobCounts.mockResolvedValue({ active: 1, completed: 2, failed: 0, waiting: 0 });
             mocks.queue.getJobs.mockResolvedValue([]);

             const summary = await service.getQueueSummary();
             
             // Queues are merged (pixel + blueprint)
             // Pixel returns 1 active, Blueprint returns 1 active (mock returns same obj)
             expect(summary.counts.total.active).toBe(2); 
             expect(summary.counts.total.completed).toBe(4);
        });
    });
});
