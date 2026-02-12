
import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../queue-service';

// Hoist mocks
const { MockQueue, MockWorker, mockQueueInstance, mockWorkerInstance, queueSpy, workerSpy } = vi.hoisted(() => {
  const qInstance = {
    add: vi.fn(),
    getJob: vi.fn(),
    getJobCounts: vi.fn(),
    getJobs: vi.fn(),
  };
  const wInstance = {
    on: vi.fn(),
    close: vi.fn(),
  };

  const queueSpy = vi.fn();
  const workerSpy = vi.fn();

  const MockQueue = class {
      constructor(...args: any[]) { queueSpy(...args); return qInstance; }
  };
  const MockWorker = class {
      constructor(...args: any[]) { workerSpy(...args); return wInstance; }
  };

  return {
    MockQueue,
    MockWorker,
    mockQueueInstance: qInstance,
    mockWorkerInstance: wInstance,
    queueSpy,
    workerSpy
  };
});

vi.mock('bullmq', () => ({
  Queue: MockQueue,
  Worker: MockWorker,
}));

// Mock utils - Fix path to ../../utils/entity-geometry
vi.mock('../../utils/entity-geometry', () => ({
    getPixelDimensions: vi.fn().mockReturnValue(64)
}));

describe('QueueService', () => {
  let strapi: any;
  let queueService: any;

  beforeEach(() => {
    strapi = {
      config: {
        get: vi.fn((key) => {
          if (key === 'plugin::map-explorer.redis') return { host: 'localhost' };
          if (key === 'plugin::map-explorer.queue') return {};
          return null;
        }),
      },
      log: { info: vi.fn(), error: vi.fn() },
      plugin: vi.fn().mockReturnValue({
        service: vi.fn().mockReturnValue({
            generatePixelData: vi.fn(),
            generateVoxelStructure: vi.fn(),
            generateBlueprint: vi.fn()
        })
      })
    };
    
    // Reset mocks
    mockQueueInstance.add.mockClear();
    mockQueueInstance.getJob.mockClear();
    mockQueueInstance.getJobCounts.mockClear();
    mockQueueInstance.getJobs.mockClear();
    queueSpy.mockClear();
    workerSpy.mockClear();
    
    queueService = service({ strapi });
  });

  describe('initialize', () => {
    it('should initialize queues and workers if redis config exists', async () => {
      await queueService.initialize();
      expect(strapi.config.get).toHaveBeenCalledWith('plugin::map-explorer.redis');
      expect(queueSpy).toHaveBeenCalledTimes(2);
      expect(workerSpy).toHaveBeenCalledTimes(2);
    });

    it('should throw if redis config is missing', async () => {
      strapi.config.get.mockReturnValue(null);
      await expect(queueService.initialize()).rejects.toThrow('Pixel Forge Queue: Redis configuration is MANDATORY');
    });
  });

  describe('addJob', () => {
    beforeEach(async () => {
        await queueService.initialize();
    });

    it('should add pixel job with dimensions', async () => {
      const data = { size: 'medium' }; 
      mockQueueInstance.add.mockResolvedValue({ id: 'job-1' });

      await queueService.addPixelJob(data);

      expect(mockQueueInstance.add).toHaveBeenCalledWith(
          'generate-sprite', 
          expect.objectContaining({ 
              size: 'medium',
              width: 64,
              height: 64 
          }), 
          expect.any(Object)
      );
    });

    it('should add blueprint job', async () => {
         const data = { type: 'Blueprint' };
         mockQueueInstance.add.mockResolvedValue({ id: 'job-2' });

         await queueService.addBlueprintJob(data);

         expect(mockQueueInstance.add).toHaveBeenCalledWith(
             'generate-blueprint',
             expect.objectContaining({ type: 'Blueprint' }),
             expect.any(Object)
         );
    });

    it('should route generic addJob to blueprint', async () => {
        const spy = vi.spyOn(queueService, 'addBlueprintJob');
        await queueService.addJob({ type: 'Blueprint' });
        expect(spy).toHaveBeenCalled();
    });

    it('should route generic addJob to pixel', async () => {
        const spy = vi.spyOn(queueService, 'addPixelJob');
        await queueService.addJob({ type: 'Sprite' });
        expect(spy).toHaveBeenCalled();
    });

     it('should throw if queues not initialized', async () => {
        // Reset service to uninitialized state
        queueService = service({ strapi });
        await expect(queueService.addPixelJob({})).rejects.toThrow('Pixel Queue not initialized');
        await expect(queueService.addBlueprintJob({})).rejects.toThrow('Blueprint Queue not initialized');
    });
  });
  
  describe('getQueueSummary', () => {
      beforeEach(async () => {
          await queueService.initialize();
      });

      it('should return aggregated summary', async () => {
          mockQueueInstance.getJobCounts.mockResolvedValue({ active: 1, completed: 1, failed: 0, waiting: 0 });
          mockQueueInstance.getJobs.mockResolvedValue([{ id: '1', queueName: 'pixel', data: {}, returnvalue: {} }]);

          const summary = await queueService.getQueueSummary();

          expect(summary).toHaveProperty('counts');
          expect(summary.counts.total.active).toBe(2); // 1 pixel + 1 blueprint
          expect(summary.jobs.completed).toHaveLength(2); // 1 pixel + 1 blueprint
      });

      it('should return error if not initialized', async () => {
          queueService = service({ strapi });
          const summary = await queueService.getQueueSummary();
          expect(summary).toHaveProperty('error');
      });
  });

  describe('getJob', () => {
      beforeEach(async () => {
          await queueService.initialize();
      });

      it('should find job in pixel queue', async () => {
          mockQueueInstance.getJob.mockResolvedValueOnce({ id: '1' });
          const job = await queueService.getJob('1');
          expect(job).toEqual({ id: '1' });
      });

       it('should check blueprint queue if not in pixel', async () => {
          mockQueueInstance.getJob.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: '2' });
          const job = await queueService.getJob('2');
          expect(job).toEqual({ id: '2' });
      });
  });
});
