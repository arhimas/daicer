import { describe, it, expect, vi, beforeEach } from 'vitest';
import forgeControllerFactory from '../forge-controller';

describe('ForgeController', () => {
  let controller: ReturnType<typeof forgeControllerFactory>;
  
  const mockQueueService = {
    addJob: vi.fn(),
    getJob: vi.fn(),
  };

  const mockStrapi = {
    plugin: vi.fn(() => ({
      service: vi.fn(() => mockQueueService),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = forgeControllerFactory({ strapi: mockStrapi });
  });

  describe('dispatch', () => {
    it('should enqueue job and return jobId', async () => {
      const ctx = {
        request: {
          body: { prompt: 'Test Sprite', type: 'Monster' }
        },
        body: {},
        throw: vi.fn()
      };

      mockQueueService.addJob.mockResolvedValue({ id: 'job-123' });

      // @ts-expect-error - Mocking context
      await controller.dispatch(ctx);

      expect(mockQueueService.addJob).toHaveBeenCalledWith(expect.objectContaining({
        prompt: 'Test Sprite'
      }));
      expect(ctx.body).toEqual({ jobId: 'job-123', status: 'queued' });
    });

    it('should handle errors', async () => {
      const ctx = {
        request: { body: {} },
        throw: vi.fn()
      };

      mockQueueService.addJob.mockRejectedValue(new Error('Queue Error'));

      // @ts-expect-error - Mocking context
      await controller.dispatch(ctx);

      expect(ctx.throw).toHaveBeenCalledWith(500, expect.any(Error));
    });
  });

  describe('status', () => {
    it('should return job status and result', async () => {
       const ctx = {
           params: { jobId: 'job-123' },
           body: {},
           notFound: vi.fn(),
           throw: vi.fn()
       };

       const mockJob = {
           id: 'job-123',
           getState: vi.fn().mockResolvedValue('completed'),
           returnvalue: { pixelData: [] },
           progress: 100
       };

       mockQueueService.getJob.mockResolvedValue(mockJob);

       // @ts-expect-error - Mocking context
       await controller.status(ctx);

       expect(mockQueueService.getJob).toHaveBeenCalledWith('job-123');
       expect(ctx.body).toEqual({
           id: 'job-123',
           state: 'completed',
           result: { pixelData: [] },
           progress: 100
       });
    });

    it('should return 404 if job not found', async () => {
        const ctx = {
            params: { jobId: 'missing' },
            notFound: vi.fn()
        };
 
        mockQueueService.getJob.mockResolvedValue(null);
 
        // @ts-expect-error - Mocking context
        await controller.status(ctx);
 
        expect(ctx.notFound).toHaveBeenCalledWith('Job not found');
     });
  });
});
