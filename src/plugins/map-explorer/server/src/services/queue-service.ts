import type { Queue as QueueType, Worker as WorkerType } from 'bullmq';
import { EntityGeometry } from '../utils/EntityGeometry';

// Stealth require to bypass Strapi Plugin Build CJS Interop issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const req = require as any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Queue, Worker } = req('bullmq');

const QUEUE_NAME = 'pixel-forge';

export default ({ strapi }) => {
  let queue: QueueType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let worker: WorkerType;

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
            const { action } = job.data;
            const service = strapi.plugin('map-explorer').service('geminiService');
            
            if (action === 'generate_blueprint') {
                return await service.generateBlueprint(job.data);
            }

            if (action === 'generate_voxel') {
                return await service.generateVoxelStructure(job.data);
            }
            
            const result = await service.generatePixelData(job.data);
            return result;
        } catch (error) {
            strapi.log.error(`Pixel Forge Job ${job.id} Failed`, error);
            throw error;
        }
      }, { 
          connection,
          concurrency: 3, 
          lockDuration: 600000, // 10 Minutes: Allow long generation times without stalling
          limiter: {
              max: 10,
              duration: 1000 
          } 
      });

      strapi.log.info('Pixel Forge Queue Initialized (Concurrency: 3)');
    },

    async addJob(data: Record<string, unknown>) {
        if (!queue) {
             throw new Error("Queue not initialized (Redis missing?)");
        }
        
        // Inject Dimensions based on Size
        if (typeof data.size === 'string' && EntityGeometry.isValidSize(data.size)) {
            const { width, height } = EntityGeometry.getPixelDimensions(data.size);
            data.width = width;
            data.height = height;
            strapi.log.info(`Pixel Forge: Injected Dimensions for ${data.size} Entity: ${width}x${height}`);
        }

        const config = strapi.config.get('plugin::map-explorer.queue') || {};
        const keepSuccess = config.retentionSuccess || 100;
        const keepFailed = config.retentionFailed || 200;

        return await queue.add('generate-sprite', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: {
                count: keepSuccess
            },
            removeOnFail: {
                count: keepFailed
            }
        });
    },

    async getJob(jobId: string) {
        if (!queue) return null;
        return await queue.getJob(jobId);
    },

    async getQueueSummary() {
        if (!queue) return { error: "Queue not initialized" };
        
        const counts = await queue.getJobCounts();
        const active = await queue.getJobs(['active'], 0, 10, true);
        const waiting = await queue.getJobs(['waiting'], 0, 10, true);
        const failed = await queue.getJobs(['failed'], 0, 10, true);
        const completed = await queue.getJobs(['completed'], 0, 10, true);

        return {
            counts,
            jobs: {
                active: active.map(j => ({ id: j.id, data: j.data, progress: j.progress })),
                waiting: waiting.map(j => ({ id: j.id, data: j.data })),
                failed: failed.map(j => ({ id: j.id, data: j.data, failedReason: j.failedReason })),
                completed: completed.map(j => ({ id: j.id, data: j.data, returnvalue: j.returnvalue }))
            }
        };
    }
  };
};
