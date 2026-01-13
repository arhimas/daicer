import { Context } from 'koa';
import { Queue } from 'bullmq';
import { QueueName } from '../constants';

export interface DashboardContext extends Context {
  body: {
    queues:
      | Array<{
          name: string;
          counts: {
            [index: string]: number;
          };
          isPaused: boolean;
          jobs?: {
            active: any[];
            waiting: any[];
            failed: any[];
          };
        }>
      | [];
    message?: string;
    error?: string;
  };
  params: {
    queueName: string;
  };
}

const getQueueService = () => strapi.plugin('bullmq').service('queue');

const getQueues = (): Queue[] => {
  const service = getQueueService();
  const queues: Queue[] = [];
  for (const name of Object.values(QueueName)) {
    const q = service.get(name);
    if (q) queues.push(q);
  }
  return queues;
};

export default {
  async getStats(ctx: DashboardContext) {
    try {
      const queues = getQueues();

      if (queues.length === 0) {
        return (ctx.body = { queues: [] });
      }

      const stats = await Promise.all(
        queues.map(async (q: Queue) => {
          try {
            const counts = await q.getJobCounts();
            const isPaused = await q.isPaused();
            
            const [active, waiting, failed] = await Promise.all([
                q.getActive(0, 4),
                q.getWaiting(0, 4),
                q.getFailed(0, 4)
            ]);

            const mapJob = (j: any) => ({
                id: j.id,
                name: j.name,
                data: j.data,
                timestamp: j.timestamp,
                failedReason: j.failedReason,
                stacktrace: j.stacktrace,
                progress: j.progress,
                finishedOn: j.finishedOn,
                processedOn: j.processedOn
            });

            return {
              name: q.name,
              counts,
              isPaused,
              jobs: {
                active: active.map(mapJob),
                waiting: waiting.map(mapJob),
                failed: failed.map(mapJob)
              }
            };
          } catch (qErr) {
            return {
              name: q.name,
              counts: { active: 0, completed: 0, failed: 0, waiting: 0, delayed: 0 },
              isPaused: true,
              jobs: { active: [], waiting: [], failed: [] }, // Fallback
              error: 'Failed to query queue',
            };
          }
        })
      );

      ctx.body = { queues: stats };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.body = { queues: [], error: message };
    }
  },

  async pause(ctx: DashboardContext) {
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

  async resume(ctx: DashboardContext) {
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

  async clean(ctx: DashboardContext) {
    const { queueName } = ctx.params;
    const type = ((ctx.query.type as string) || 'failed');

    try {
      const queues = getQueues();
      const queue = queues.find((q) => q.name === queueName);

      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.clean(0, 1000, type as any);
      ctx.body = { queues: [], message: `Cleaned ${type} jobs from ${queueName}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.badRequest(message);
    }
  },

  async retry(ctx: DashboardContext) {
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
