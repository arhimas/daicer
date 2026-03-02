import { describe, it, expect, vi, beforeEach } from 'vitest';
import queueServiceFactory from '../queue-service';
// import { Queue, Worker } from 'bullmq'; // Unused

// Shared Mocks (Hoisted)
const sharedMocks = vi.hoisted(() => ({
  add: vi.fn(),
  getJob: vi.fn(),
  getJobCounts: vi.fn(),
  getJobs: vi.fn(),
  workerFn: vi.fn(),
}));

// Mock BullMQ Module
vi.mock('bullmq', () => {
  return {
    Queue: class {
      constructor() {
        return {
          add: sharedMocks.add,
          getJob: sharedMocks.getJob,
          getJobCounts: sharedMocks.getJobCounts,
          getJobs: sharedMocks.getJobs,
        };
      }
    },
    Worker: class {
      constructor(name, processor) {
        sharedMocks.workerFn(name, processor);
      }
    },
  };
});

// Mock Strapi
const mockConfigGet = vi.fn();
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();

const mockStrapi: any = {
  config: {
    get: mockConfigGet,
  },
  log: {
    info: mockLogInfo,
    error: mockLogError,
  },
  plugin: vi.fn(),
};

describe('Queue Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup BullMQ Mocks
    // No need to set implementation, it's baked into the class above.

    service = queueServiceFactory({ strapi: mockStrapi });

    // Default Strapi Config Mocks
    mockConfigGet.mockImplementation((key) => {
      if (key === 'plugin::map-explorer.redis') return { host: 'localhost' };
      if (key === 'plugin::map-explorer.queue') return { retentionSuccess: 10 };
      return null;
    });

    sharedMocks.getJobCounts.mockResolvedValue({ active: 1, completed: 1, failed: 0, waiting: 0 });
    sharedMocks.getJobs.mockResolvedValue([]);
  });

  describe('initialize', () => {
    it('should initialize queues if redis config exists', async () => {
      await service.initialize();
      // Queue is not a spy anymore, it's a class. We can't spy on constructor calls easily without proxy.
      // But we can check if Worker (vi.fn) was called.
      // Or we can spy on Queue prototype if we needed to, but we just need to know it passed.
      // Let's just check Worker calls as proxy for initialization success.
      expect(sharedMocks.workerFn).toHaveBeenCalledTimes(2);
      expect(mockLogInfo).toHaveBeenCalledWith(expect.stringContaining('Initialized'));
    });

    it('should throw if redis config missing', async () => {
      mockConfigGet.mockReturnValue(null);
      await expect(service.initialize()).rejects.toThrow('Redis configuration is MANDATORY');
    });
  });

  describe('Job Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should add pixel job', async () => {
      sharedMocks.add.mockResolvedValue({ id: 'job1' });
      const data = { size: 'medium' };
      await service.addPixelJob(data);
      expect(sharedMocks.add).toHaveBeenCalledWith(
        'generate-sprite',
        expect.objectContaining({ size: 'medium' }),
        expect.any(Object)
      );
    });

    it('should add blueprint job', async () => {
      await service.addBlueprintJob({ type: 'blueprint' });
      expect(sharedMocks.add).toHaveBeenCalledWith(
        'generate-blueprint',
        expect.anything(),
        expect.anything()
      );
    });

    it('should route addJob correctly', async () => {
      await service.addJob({ type: 'Blueprint' });
      expect(sharedMocks.add).toHaveBeenCalledWith(
        'generate-blueprint',
        expect.anything(),
        expect.anything()
      );

      await service.addJob({ type: 'Pixel' });
      expect(sharedMocks.add).toHaveBeenCalledWith(
        'generate-sprite',
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Accessors', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get job from pixel queue first', async () => {
      sharedMocks.getJob.mockResolvedValueOnce({ id: 'j1', name: 'pixel' });
      const job = await service.getJob('j1');
      expect(job.name).toBe('pixel');
    });

    it('should fall back to blueprint queue', async () => {
      sharedMocks.getJob
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'j1', name: 'bp' });
      const job = await service.getJob('j1');
      expect(job.name).toBe('bp');
    });

    it('should return null if not found in either', async () => {
      sharedMocks.getJob.mockResolvedValue(null);
      const job = await service.getJob('j1');
      expect(job).toBeNull();
    });

    it('should return summary', async () => {
      sharedMocks.getJobCounts.mockResolvedValue({
        active: 5,
        completed: 0,
        failed: 0,
        waiting: 0,
      });
      sharedMocks.getJobs.mockResolvedValue([{ id: '1', queueName: 'q', data: {} }]);

      const summary = await service.getQueueSummary();

      expect(summary.counts.total.active).toBe(10);
      expect(summary.jobs.active).toHaveLength(2);
    });
  });

  describe('Hardened Edge Cases', () => {
    it('should inject dimensions when size is a string', async () => {
      await service.initialize();
      const data = { size: 'medium' };
      // getPixelDimensions('medium') returns 64 (mock relevant if needed, but logic is imported)
      // We can just verify width/height are added
      await service.addPixelJob(data);

      /*
          // Debugging matcher failure
          // console.log('Mock Calls:', JSON.stringify(sharedMocks.add.mock.calls, null, 2));
           
          // Verify call args (relaxed for debug)
          expect(sharedMocks.add).toHaveBeenCalledTimes(1);
          const args = sharedMocks.add.mock.calls[0];
          expect(args[0]).toBe('generate-sprite');
          expect(args[1]).toMatchObject({ width: 32, height: 32 }); // 'medium' -> 32x32
          expect(args[2]).toHaveProperty('attempts', 3);
          */

      expect(sharedMocks.add).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ width: 32, height: 32 }), // 'medium' -> 32x32
        expect.objectContaining({ attempts: 3 })
      );
    });

    it('should use default queue config if missing', async () => {
      // Reset mocks explicitly
      mockConfigGet.mockReset();
      sharedMocks.add.mockClear();

      // Sequence:
      // 1. initialize() calls config.get('plugin::map-explorer.redis')
      // 2. addPixelJob() -> _addToQueue() calls config.get('plugin::map-explorer.queue')

      mockConfigGet
        .mockReturnValueOnce({ host: 'localhost' }) // For initialize
        .mockReturnValueOnce(null); // For queue config (trigger defaults)

      const testService = queueServiceFactory({ strapi: mockStrapi });
      await testService.initialize();

      await testService.addPixelJob({});

      // Verify call args
      expect(sharedMocks.add).toHaveBeenCalledTimes(1);
      expect(sharedMocks.add).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        })
      );
    });
  });

  describe('Worker Logic', () => {
    it('should process pixel jobs', async () => {
      const mockGeneratePixel = vi.fn();
      const mockGenerateVoxel = vi.fn();

      mockStrapi.plugin.mockReturnValue({
        service: vi.fn(() => ({
          generatePixelDataV2: mockGeneratePixel,
          generateVoxelStructure: mockGenerateVoxel,
        })),
      });

      await service.initialize();

      const pixelCall = sharedMocks.workerFn.mock.calls.find((call) => call[0] === 'pixel-forge');
      const processor = pixelCall[1];

      await processor({ id: 'j1', data: { action: 'generate_pixel' } });
      expect(mockGeneratePixel).toHaveBeenCalled();

      await processor({ id: 'j2', data: { action: 'generate_voxel' } });
      expect(mockGenerateVoxel).toHaveBeenCalled();
    });

    it('should process blueprint jobs', async () => {
      const mockGenerateBlueprint = vi.fn();
      mockStrapi.plugin.mockReturnValue({
        service: vi.fn(() => ({
          generateBlueprint: mockGenerateBlueprint,
        })),
      });

      await service.initialize();

      const bpCall = sharedMocks.workerFn.mock.calls.find((call) => call[0] === 'blueprint-forge');
      const processor = bpCall[1];

      await processor({ id: 'b1', data: {} });
      expect(mockGenerateBlueprint).toHaveBeenCalled();
    });

    it('should handle pixel worker errors', async () => {
      const mockGeneratePixel = vi.fn().mockRejectedValue(new Error('Pixel Fail'));
      mockStrapi.plugin.mockReturnValue({
        service: vi.fn(() => ({ generatePixelDataV2: mockGeneratePixel })),
      });

      await service.initialize();
      const pixelCall = sharedMocks.workerFn.mock.calls.find((call) => call[0] === 'pixel-forge');
      const processor = pixelCall[1];

      await expect(processor({ id: 'j1', data: {} })).rejects.toThrow('Pixel Fail');
      expect(mockLogError).toHaveBeenCalledWith(
        expect.stringContaining('Job j1 Failed'),
        expect.anything()
      );
    });

    it('should handle blueprint worker errors', async () => {
      const mockGenerateBlueprint = vi.fn().mockRejectedValue(new Error('BP Fail'));
      mockStrapi.plugin.mockReturnValue({
        service: vi.fn(() => ({ generateBlueprint: mockGenerateBlueprint })),
      });

      await service.initialize();
      const bpCall = sharedMocks.workerFn.mock.calls.find((call) => call[0] === 'blueprint-forge');
      const processor = bpCall[1];

      await expect(processor({ id: 'b1', data: {} })).rejects.toThrow('BP Fail');
      expect(mockLogError).toHaveBeenCalledWith(
        expect.stringContaining('Job b1 Failed'),
        expect.anything()
      );
    });
  });

  describe('Uninitialized State', () => {
    it('should return error in getQueueSummary if not initialized', async () => {
      // New instance without initialize
      const freshService = queueServiceFactory({ strapi: mockStrapi });
      const summary = await freshService.getQueueSummary();
      expect(summary).toEqual({ error: 'Queues not initialized' });
    });

    it('should throw when adding job if not initialized', async () => {
      const freshService = queueServiceFactory({ strapi: mockStrapi });
      await expect(freshService.addPixelJob({})).rejects.toThrow('Pixel Queue not initialized');
      await expect(freshService.addBlueprintJob({})).rejects.toThrow(
        'Blueprint Queue not initialized'
      );
    });
  });
});
