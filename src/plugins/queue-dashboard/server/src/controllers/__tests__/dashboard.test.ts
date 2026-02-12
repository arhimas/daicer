import { describe, it, expect, vi, beforeEach } from 'vitest';
import dashboardController from '../dashboard';

// Mocks
const mockQueue = {
  name: 'test-queue',
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
};

const mockStrapi = {
  plugin: vi.fn((uid) => {
    if (uid === 'bullmq') {
      return {
        service: vi.fn(() => ({
          get: vi.fn((name) => (name === 'test-queue' ? mockQueue : null))
        }))
      };
    }
    if (uid === 'queue-dashboard') {
      return {
        config: vi.fn(() => ['test-queue'])
      };
    }
  })
};

// Global strapi
global.strapi = mockStrapi as any;

describe('DashboardController', () => {
    // Context helper
    const createCtx = (params = {}, query = {}) => ({
        params,
        query,
        body: null,
        badRequest: vi.fn(),
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockQueue.getJobCounts.mockResolvedValue({ active: 1 });
        mockQueue.isPaused.mockResolvedValue(false);
        mockQueue.getActive.mockResolvedValue([{ id: '1', name: 'job1', data: {} }]);
        mockQueue.getWaiting.mockResolvedValue([]);
        mockQueue.getFailed.mockResolvedValue([]);
        mockQueue.getCompleted.mockResolvedValue([]);
        mockQueue.getDelayed.mockResolvedValue([]);
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
             mockQueue.getJobCounts.mockRejectedValue(new Error('Redis Down'));
             const ctx = createCtx();
             await dashboardController.getStats(ctx as any);
             
             expect(ctx.body.queues[0].error).toBe('Failed to query queue');
        });
    });

    describe('Actions', () => {
        it('should pause queue', async () => {
             const ctx = createCtx({ queueName: 'test-queue' });
             await dashboardController.pause(ctx as any);
             expect(mockQueue.pause).toHaveBeenCalled();
             expect(ctx.body.message).toContain('paused');
        });

        it('should resume queue', async () => {
             const ctx = createCtx({ queueName: 'test-queue' });
             await dashboardController.resume(ctx as any);
             expect(mockQueue.resume).toHaveBeenCalled();
             expect(ctx.body.message).toContain('resumed');
        });

        it('should clean queue', async () => {
             const ctx = createCtx({ queueName: 'test-queue' }, { type: 'failed' });
             await dashboardController.clean(ctx as any);
             expect(mockQueue.clean).toHaveBeenCalledWith(0, 1000, 'failed');
        });
        
        it('should error on invalid queue', async () => {
             const ctx = createCtx({ queueName: 'missing-queue' });
             await dashboardController.pause(ctx as any);
             expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('not found'));
        });
    });
});
