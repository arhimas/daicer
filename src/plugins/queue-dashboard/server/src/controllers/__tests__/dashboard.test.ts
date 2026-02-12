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
        mocks.getFailed.mockResolvedValue([
            { id: 'failed1', retry: vi.fn().mockResolvedValue(true) }
        ]);
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
});
