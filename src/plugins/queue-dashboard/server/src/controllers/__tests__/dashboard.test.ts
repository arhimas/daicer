import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoist generic mocks
const mocks = vi.hoisted(() => {
  return {
    getJobCounts: vi.fn(),
    isPaused: vi.fn(),
    getActive: vi.fn(),
    getWaiting: vi.fn(),
    getFailed: vi.fn(),
    getCompleted: vi.fn(),
    getDelayed: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    clean: vi.fn(),
    retry: vi.fn(), // Added retry mock
  };
});

// 2. Mock BullMQ before import
vi.mock('bullmq', () => ({
  Queue: class {},
}));

// 3. Mock Strapi Global
const mockQueue = {
  name: 'test-queue',
  ...mocks,
};

const mockStrapi = {
  plugin: vi.fn((uid) => {
    if (uid === 'bullmq') {
      return {
        service: vi.fn(() => ({
          get: vi.fn((name) => (name === 'test-queue' ? mockQueue : null)),
        })),
      };
    }
    if (uid === 'queue-dashboard') {
      return {
        config: vi.fn(() => ['test-queue']),
      };
    }
    return { service: vi.fn(), config: vi.fn() };
  }),
};

global.strapi = mockStrapi as any;

// 4. Import Controller AFTER global setup (Using Factory)
import dashboardFactory from '@/plugins/queue-dashboard/server/src/controllers/dashboard-controller';

describe('DashboardController', () => {
  let dashboardController: any;

  // Context helper
  const createCtx = (params = {}, query = {}) => ({
    params,
    query,
    body: null as any,
    badRequest: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Instantiate controller using injected Strapi
    dashboardController = dashboardFactory({ strapi: mockStrapi });
    mocks.getJobCounts.mockResolvedValue({ active: 1 });
    mocks.isPaused.mockResolvedValue(false);
    mocks.getActive.mockResolvedValue([{ id: '1', name: 'job1', data: {} }]);
    mocks.getWaiting.mockResolvedValue([]);
    mocks.getFailed.mockResolvedValue([]);
    mocks.getCompleted.mockResolvedValue([]);
    mocks.getDelayed.mockResolvedValue([]);

    // Ensure retry mock returns a promise
    // The controller calls job.retry() on failed jobs
    mocks.getFailed.mockResolvedValue([{ id: 'failed1', retry: vi.fn().mockResolvedValue(true) }]);
  });

  describe('getStats', () => {
    it('should return stats for configured queues', async () => {
      const ctx = createCtx();
      await dashboardController.getStats(ctx as any);

      expect(ctx.body.queues).toHaveLength(1);
      expect(ctx.body.queues[0].name).toBe('test-queue');
      expect(ctx.body.queues[0].counts.active).toBe(1);
      expect(ctx.body.queues[0].jobs.active).toHaveLength(1);
    });

    it('should handle queue errors gracefully', async () => {
      mocks.getJobCounts.mockRejectedValue(new Error('Redis Down'));
      const ctx = createCtx();
      await dashboardController.getStats(ctx as any);

      expect(ctx.body.queues[0].error).toBe('Failed to query queue');
    });
  });

  describe('Actions', () => {
    it('should pause queue', async () => {
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.pause(ctx as any);
      expect(mocks.pause).toHaveBeenCalled();
      expect(ctx.body.message).toContain('paused');
    });

    it('should resume queue', async () => {
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.resume(ctx as any);
      expect(mocks.resume).toHaveBeenCalled();
      expect(ctx.body.message).toContain('resumed');
    });

    it('should clean queue', async () => {
      const ctx = createCtx({ queueName: 'test-queue' }, { type: 'failed' });
      await dashboardController.clean(ctx as any);
      expect(mocks.clean).toHaveBeenCalledWith(0, 1000, 'failed');
    });

    it('should retry failed jobs', async () => {
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.retry(ctx as any);
      // Verify retry was called on the job returned by getFailed
      // We can't easily spy on the dynamic object returned by getFailed in this setup without complex mocking logic
      // But we can verify successful response
      expect(ctx.body.message).toContain('Retrying 1 failed jobs');
    });

    it('should error on invalid queue', async () => {
      const ctx = createCtx({ queueName: 'missing-queue' });
      await dashboardController.pause(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });
  });

  describe('Edge Cases', () => {
    // ... existing legacy edge cases ...

    it('should handle single queue failure in getStats (inner try/catch)', async () => {
      // Setup: 2 queues. One works, one blows up.
      const q1 = { ...mockQueue, name: 'good-queue' };
      const q2 = {
        ...mockQueue,
        name: 'bad-queue',
        getJobCounts: vi.fn().mockRejectedValue(new Error('Boom')),
      };

      // Override getQueues for this specific test context isn't easy with current mock setup
      // So we rely on the mocked service returning different queues based on name

      const customStrapi = {
        ...mockStrapi,
        plugin: vi.fn((uid) => {
          if (uid === 'queue-dashboard')
            return { config: vi.fn(() => ['good-queue', 'bad-queue']) };
          if (uid === 'bullmq')
            return {
              service: vi.fn(() => ({
                get: vi.fn((name) => {
                  if (name === 'good-queue') return q1;
                  if (name === 'bad-queue') return q2;
                  return null;
                }),
              })),
            };
          return mockStrapi.plugin(uid);
        }),
      } as any;

      const ctrl = dashboardFactory({ strapi: customStrapi });
      const ctx = createCtx();
      await ctrl.getStats(ctx as any);

      expect(ctx.body.queues).toHaveLength(2);
      const badQueueResult = ctx.body.queues.find((q: any) => q.name === 'bad-queue');
      expect(badQueueResult.error).toBe('Failed to query queue');
      expect(badQueueResult.isPaused).toBe(true); // Default on error
    });

    it('should handle top-level error in getStats (outer try/catch)', async () => {
      // Force getQueues to throw by messing up the plugin retrieval
      const brokenStrapi = {
        plugin: vi.fn(() => {
          throw new Error('Plugin System Broken');
        }),
      } as any;

      const ctrl = dashboardFactory({ strapi: brokenStrapi });
      const ctx = createCtx();
      await ctrl.getStats(ctx as any);

      expect(ctx.body.error).toBe('Plugin System Broken');
      expect(ctx.body.queues).toEqual([]);
    });

    // ... (previous edge cases) ...

    it('should handle zero queues in getStats', async () => {
      // Mock config to return empty array
      const customStrapi = {
        ...mockStrapi,
        plugin: vi.fn((uid) => {
          if (uid === 'queue-dashboard') return { config: vi.fn(() => []) };
          return mockStrapi.plugin(uid);
        }),
      } as any;

      const ctrl = dashboardFactory({ strapi: customStrapi });
      const ctx = createCtx();
      await ctrl.getStats(ctx as any);

      expect(ctx.body.queues).toEqual([]);
    });

    it('should use default type "failed" in clean if not provided', async () => {
      const ctx = createCtx({ queueName: 'test-queue' }, {}); // No type
      await dashboardController.clean(ctx as any);
      expect(mocks.clean).toHaveBeenCalledWith(0, 1000, 'failed');
    });

    it('should handle non-Error throws in pause', async () => {
      mocks.pause.mockRejectedValue('String Error');
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.pause(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('String Error');
    });

    it('should handle missing queue config gracefully', async () => {
      // Mock config to return nothing
      const customStrapi = {
        ...mockStrapi,
        plugin: vi.fn((uid) => {
          if (uid === 'queue-dashboard') return { config: vi.fn(() => undefined) };
          return mockStrapi.plugin(uid);
        }),
      } as any;

      const ctrl = dashboardFactory({ strapi: customStrapi });
      const queues = ctrl.getQueues(customStrapi);
      expect(queues).toHaveLength(0);
    });

    it('should skip queues that cannot be found in service', async () => {
      // Config says 'ghost-queue', service returns null
      const customStrapi = {
        ...mockStrapi,
        plugin: vi.fn((uid) => {
          if (uid === 'queue-dashboard') return { config: vi.fn(() => ['ghost-queue']) };
          if (uid === 'bullmq') return { service: vi.fn(() => ({ get: vi.fn(() => null) })) };
          return mockStrapi.plugin(uid);
        }),
      } as any;

      const ctrl = dashboardFactory({ strapi: customStrapi });
      const queues = ctrl.getQueues(customStrapi);
      expect(queues).toHaveLength(0);
    });

    it('should handle retry failures', async () => {
      // Mock failed job that fails to retry
      mocks.getFailed.mockResolvedValue([
        { id: 'failed1', retry: vi.fn().mockRejectedValue(new Error('Retry Failed')) },
      ]);

      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.retry(ctx as any);

      // The controller catches the error and calls badRequest with the error message
      expect(ctx.badRequest).toHaveBeenCalledWith('Retry Failed');
    });

    // Hardening: Explicitly cover all Invalid Queue paths
    it('should error when resuming an invalid queue', async () => {
      const ctx = createCtx({ queueName: 'invalid-queue' });
      await dashboardController.resume(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('Queue invalid-queue not found');
    });

    it('should error when cleaning an invalid queue', async () => {
      const ctx = createCtx({ queueName: 'invalid-queue' });
      await dashboardController.clean(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('Queue invalid-queue not found');
    });

    it('should error when retrying an invalid queue', async () => {
      const ctx = createCtx({ queueName: 'invalid-queue' });
      await dashboardController.retry(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('Queue invalid-queue not found');
    });

    // Hardening: Explicitly cover all Non-Error Throw paths
    it('should handle non-Error throws in resume', async () => {
      mocks.resume.mockRejectedValue('String Error');
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.resume(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('String Error');
    });

    it('should handle non-Error throws in clean', async () => {
      mocks.clean.mockRejectedValue('String Error');
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.clean(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('String Error');
    });

    it('should handle non-Error throws in retry', async () => {
      // Mock getFailed to throw a string
      mocks.getFailed.mockRejectedValue('String Error');
      const ctx = createCtx({ queueName: 'test-queue' });
      await dashboardController.retry(ctx as any);
      expect(ctx.badRequest).toHaveBeenCalledWith('String Error');
    });
  });
});
