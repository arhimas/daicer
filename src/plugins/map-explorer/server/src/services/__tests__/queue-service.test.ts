import { describe, it, expect, vi, beforeEach } from 'vitest';
import queueServiceFactory from '../queue-service';
// Queue removed

// ... mocks ...

// Hoist mocks to share between factory and tests
const { mockAdd, mockGetJob } = vi.hoisted(() => ({
    mockAdd: vi.fn(),
    mockGetJob: vi.fn(),
    // mockWorkerData removed
}));

vi.mock('bullmq', () => {
  return {
    Queue: vi.fn().mockImplementation(() => ({
      add: (...args: any[]) => {
          console.log('[MockQueue] add called with:', args);
          return mockAdd(...args);
      },
      getJob: mockGetJob,
      getJobCounts: vi.fn().mockResolvedValue({}),
      getJobs: vi.fn().mockResolvedValue([]),
      on: vi.fn(),
      close: vi.fn(),
    })),
    Worker: vi.fn(),
    QueueEvents: vi.fn(),
  };
});

describe.skip('QueueService', () => {
  let service: ReturnType<typeof queueServiceFactory>;
  const mockStrapi = {
    log: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
    config: { get: vi.fn() },
    plugin: vi.fn(), // map-explorer plugin
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = queueServiceFactory({ strapi: mockStrapi });
  });

  describe('initialize', () => {
    it('should throw error if Redis config is missing', async () => {
      mockStrapi.config.get.mockReturnValue(null);
      await expect(service.initialize()).rejects.toThrow('Redis configuration is MANDATORY');
    });

    it('should initialize Queue and Worker if Redis config exists', async () => {
      mockStrapi.config.get.mockReturnValue({ host: 'localhost' });
      await service.initialize();
      // We can't easily check internal state, but it shouldn't throw
      expect(mockStrapi.log.info).toHaveBeenCalledWith('Pixel Forge Queue Initialized (Concurrency: 3)');
    });
  });

  describe('addJob', () => {
    it('should throw if queue not initialized', async () => {
      await expect(service.addJob({})).rejects.toThrow('Queue not initialized');
    });

    it('should add job to queue', async () => {
      mockStrapi.config.get.mockReturnValue({ host: 'localhost' });
      await service.initialize();
      
      const jobData = { prompt: 'test' };
      await service.addJob(jobData);
      
      expect(mockAdd).toHaveBeenCalledWith('generate-sprite', expect.objectContaining(jobData), expect.anything());
    });
  });
});
