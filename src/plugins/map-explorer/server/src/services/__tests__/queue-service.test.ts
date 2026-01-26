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
  class MockQueue {
    add = mockAdd;
    getJob = mockGetJob;
  }
  
  return {
    Queue: MockQueue,
    Worker: vi.fn(),
    QueueEvents: vi.fn(),
  };
});

describe('QueueService', () => {
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
      expect(mockStrapi.log.info).toHaveBeenCalledWith('Pixel Forge Queue Initialized');
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
      
      expect(mockAdd).toHaveBeenCalledWith('generate-sprite', jobData);
    });
  });
});
