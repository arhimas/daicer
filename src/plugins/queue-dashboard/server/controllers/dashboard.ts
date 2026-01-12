
import { QueueManager } from '../../../../queues/queue-manager';


import { Context } from 'koa';
import { Queue } from 'bullmq';

interface DashboardContext extends Context {
    body: {
        queues: Array<{
            name: string;
            counts: {
                [index: string]: number;
            };
            isPaused: boolean;
        }> | [];
        error?: string;
    };
}

export default {
  async getStats(ctx: DashboardContext) {
    try {
      const manager = QueueManager.get();
      const queues = manager.getQueues();
      
      const stats = await Promise.all(queues.map(async (q: Queue) => {
        const counts = await q.getJobCounts();
        return {
          name: q.name,
          counts,
          isPaused: await q.isPaused(),
        };
      }));

      ctx.body = { queues: stats };
    } catch (err) {
       const message = err instanceof Error ? err.message : String(err);
       ctx.body = { queues: [], error: message };
    }
  },
};

