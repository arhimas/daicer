'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const getQueueService = () => strapi.plugin('bullmq').service('queue');
const getQueues = () => {
  const service = getQueueService();
  const queues = [];
  const configuredQueues = strapi.plugin('queue-dashboard').config('queues') || [];
  for (const name of configuredQueues) {
    const q = service.get(name);
    if (q) queues.push(q);
  }
  return queues;
};
exports.default = {
  /**
   * Retrieves statistics for all registered BullMQ queues.
   * Includes counts, active jobs, and status.
   * GET /api/queue-dashboard/stats
   *
   * @param ctx - Koa Context
   */
  async getStats(ctx) {
    try {
      const queues = getQueues();
      if (queues.length === 0) {
        return (ctx.body = { queues: [] });
      }
      const stats = await Promise.all(
        queues.map(async (q) => {
          try {
            const counts = await q.getJobCounts();
            const isPaused = await q.isPaused();
            const [active, waiting, failed, completed, delayed] = await Promise.all([
              q.getActive(0, 10),
              q.getWaiting(0, 10),
              q.getFailed(0, 10),
              q.getCompleted(0, 10), // Show last 10 successful
              q.getDelayed(0, 10),
            ]);

            const mapJob = (j) => ({
              id: j.id,
              name: j.name,
              data: j.data,
              timestamp: j.timestamp,
              failedReason: j.failedReason,
              stacktrace: j.stacktrace,
              progress: j.progress,
              finishedOn: j.finishedOn,
              processedOn: j.processedOn,
              returnvalue: j.returnvalue,
            });
            return {
              name: q.name,
              counts,
              isPaused,
              jobs: {
                active: active.map(mapJob),
                waiting: waiting.map(mapJob),
                failed: failed.map(mapJob),
                completed: completed.map(mapJob), // Added
                delayed: delayed.map(mapJob),
              },
            };
          } catch {
            return {
              name: q.name,
              counts: { active: 0, completed: 0, failed: 0, waiting: 0, delayed: 0 },
              isPaused: true,
              jobs: { active: [], waiting: [], failed: [], completed: [], delayed: [] }, // Fallback
              error: 'Failed to query queue',
            };
          }
        })
      );
      ctx.body = { queues: stats };
    } catch (err) {
      const message = err.message || String(err);
      ctx.body = { queues: [], error: message };
    }
  },
  /**
   * Pauses a specific queue.
   * POST /api/queue-dashboard/queue/:queueName/pause
   */
  async pause(ctx) {
    const { queueName } = ctx.params;
    try {
      const queues = getQueues();
      const queue = queues.find((q) => q.name === queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      await queue.pause();
      ctx.body = { queues: [], message: `Queue ${queueName} paused` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.badRequest(message);
    }
  },
  /**
   * Resumes a paused queue.
   * POST /api/queue-dashboard/queue/:queueName/resume
   */
  async resume(ctx) {
    const { queueName } = ctx.params;
    try {
      const queues = getQueues();
      const queue = queues.find((q) => q.name === queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      await queue.resume();
      ctx.body = { queues: [], message: `Queue ${queueName} resumed` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.badRequest(message);
    }
  },
  /**
   * Cleans (removes) jobs of a specific type from a queue.
   * POST /api/queue-dashboard/queue/:queueName/clean?type=failed
   */
  async clean(ctx) {
    const { queueName } = ctx.params;
    const type = ctx.query.type || 'failed';
    try {
      const queues = getQueues();
      const queue = queues.find((q) => q.name === queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.clean(0, 1000, type);
      ctx.body = { queues: [], message: `Cleaned ${type} jobs from ${queueName}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.badRequest(message);
    }
  },
  async retry(ctx) {
    const { queueName } = ctx.params;
    try {
      const queues = getQueues();
      const queue = queues.find((q) => q.name === queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }
      const failed = await queue.getFailed();
      await Promise.all(failed.map((job) => job.retry()));
      ctx.body = { queues: [], message: `Retrying ${failed.length} failed jobs in ${queueName}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.badRequest(message);
    }
  },
};
