import { Queue, Worker } from 'bullmq';

const QUEUE_NAME = 'pixel-forge';

export default ({ strapi }) => {
  let queue: Queue;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let worker: Worker;

  return {
    async initialize() {
      const connection = strapi.config.get('plugin::map-explorer.redis');
      
      if (!connection) {
          throw new Error('Pixel Forge Queue: Redis configuration is MANDATORY. Please check plugin config.');
      }

      queue = new Queue(QUEUE_NAME, { connection });

      worker = new Worker(QUEUE_NAME, async (job) => {
        strapi.log.info(`Pixel Forge: Processing Job ${job.id}`);
        
        try {
            const result = await strapi.plugin('map-explorer').service('geminiService').generatePixelData(job.data);
            return result;
        } catch (error) {
            strapi.log.error(`Pixel Forge Job ${job.id} Failed`, error);
            throw error;
        }
      }, { connection });

      strapi.log.info('Pixel Forge Queue Initialized');
    },

    async addJob(data: Record<string, unknown>) {
        if (!queue) {
             throw new Error("Queue not initialized (Redis missing?)");
        }
        return await queue.add('generate-sprite', data);
    },

    async getJob(jobId: string) {
        if (!queue) return null;
        return await queue.getJob(jobId);
    }
  };
};
