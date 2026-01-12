
import { QueueManager } from '../../../../queues/queue-manager';

export default {
  async getStats(ctx: any) {
    try {
      const manager = QueueManager.get();
      const queues = manager.getQueues();
      
      const stats = await Promise.all(queues.map(async (q: any) => {
        const counts = await q.getJobCounts();
        return {
          name: q.name,
          counts,
          isPaused: await q.isPaused(),
        };
      }));

      ctx.body = { queues: stats };
    } catch (err: any) {
       ctx.body = { queues: [], error: err.message };
    }
  },
};
