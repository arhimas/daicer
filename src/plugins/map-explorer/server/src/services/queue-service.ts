import type { Queue as QueueType, Worker as WorkerType, JobType } from 'bullmq';
import { EntityGeometry } from '../utils/EntityGeometry';

// Stealth require removed in favor of standard import for better testing support
// If build fails, verify if @strapi/plugin-bullmq or similar handles this differently.
import { Queue, Worker } from 'bullmq';

const QUEUE_PIXEL = 'pixel-forge';
const QUEUE_BLUEPRINT = 'blueprint-forge';

export default ({ strapi }) => {
  let queuePixel: QueueType;
  let queueBlueprint: QueueType;

  let _workerPixel: WorkerType;
  let _workerBlueprint: WorkerType;

  return {
    async initialize() {
      const connection = strapi.config.get('plugin::map-explorer.redis');
      
      if (!connection) {
          throw new Error('Pixel Forge Queue: Redis configuration is MANDATORY. Please check plugin config.');
      }

      // --- PIXEL FORGE QUEUE ---
      queuePixel = new Queue(QUEUE_PIXEL, { connection });

      _workerPixel = new Worker(QUEUE_PIXEL, async (job) => {
        strapi.log.info(`Pixel Forge [Pixel]: Processing Job ${job.id}`);
        try {
            const service = strapi.plugin('map-explorer').service('geminiService');
            // Pixel Worker handles: generatePixelData, generateVoxelStructure
            if (job.data.action === 'generate_voxel') {
                return await service.generateVoxelStructure(job.data);
            }
            return await service.generatePixelData(job.data);
        } catch (error) {
            strapi.log.error(`Pixel Forge [Pixel] Job ${job.id} Failed`, error);
            throw error;
        }
      }, { 
          connection,
          concurrency: 1, 
          lockDuration: 600000,
          limiter: { max: 10, duration: 1000 } 
      });

      // --- BLUEPRINT FORGE QUEUE ---
      queueBlueprint = new Queue(QUEUE_BLUEPRINT, { connection });

      _workerBlueprint = new Worker(QUEUE_BLUEPRINT, async (job) => {
        strapi.log.info(`Pixel Forge [Blueprint]: Processing Job ${job.id}`);
        try {
            const service = strapi.plugin('map-explorer').service('geminiService');
            // Blueprint Worker handles: generateBlueprint
            return await service.generateBlueprint(job.data);
        } catch (error) {
            strapi.log.error(`Pixel Forge [Blueprint] Job ${job.id} Failed`, error);
            throw error;
        }
      }, { 
          connection,
          concurrency: 2, // Higher concurrency for Blueprints (pure text/structure)
          lockDuration: 300000,
          limiter: { max: 20, duration: 1000 } 
      });

      strapi.log.info('Pixel Forge Queues Initialized (Pixel: 1, Blueprint: 2)');
    },

    async addPixelJob(data: Record<string, unknown>) {
        if (!queuePixel) throw new Error("Pixel Queue not initialized");
        
        this._injectDimensions(data);
        return await this._addToQueue(queuePixel, 'generate-sprite', data);
    },

    async addBlueprintJob(data: Record<string, unknown>) {
        if (!queueBlueprint) throw new Error("Blueprint Queue not initialized");

        this._injectDimensions(data);
        return await this._addToQueue(queueBlueprint, 'generate-blueprint', data);
    },

    // Legacy/Router wrapper for backward compatibility if needed, 
    // but Controller should call specific methods.
    async addJob(data: Record<string, unknown>) {
        // Fallback router
        if (data.type === 'Blueprint' || data.action === 'generate_blueprint') {
            return this.addBlueprintJob(data);
        }
        return this.addPixelJob(data);
    },

    async getJob(jobId: string) {
        if (!queuePixel || !queueBlueprint) return null;
        // Try Pixel first, then Blueprint
        let job = await queuePixel.getJob(jobId);
        if (!job) {
            job = await queueBlueprint.getJob(jobId);
        }
        return job;
    },

    async getQueueSummary() {
        if (!queuePixel || !queueBlueprint) return { error: "Queues not initialized" };
        
        const [countsPixel, countsBlueprint] = await Promise.all([
            queuePixel.getJobCounts(),
            queueBlueprint.getJobCounts()
        ]);
        
        // Helper to fetch jobs from both
        const fetchJobs = async (status: JobType, limit: number) => {
            const [pJobs, bJobs] = await Promise.all([
                queuePixel.getJobs([status], 0, limit, true),
                queueBlueprint.getJobs([status], 0, limit, true)
            ]);
            return [...pJobs, ...bJobs].sort((a, b) => parseInt(b.id || '0') - parseInt(a.id || '0')).slice(0, limit);
        };

        const active = await fetchJobs('active', 10);
        const waiting = await fetchJobs('waiting', 10);
        const failed = await fetchJobs('failed', 100);
        const completed = await fetchJobs('completed', 10);

        return {
            counts: {
                merged: true,
                pixel: countsPixel,
                blueprint: countsBlueprint,
                total: {
                    active: countsPixel.active + countsBlueprint.active,
                    completed: countsPixel.completed + countsBlueprint.completed,
                    failed: countsPixel.failed + countsBlueprint.failed,
                    waiting: countsPixel.waiting + countsBlueprint.waiting
                }
            },
            jobs: {
                active: active.map(j => ({ id: j.id, queue: j.queueName, data: j.data, progress: j.progress })),
                waiting: waiting.map(j => ({ id: j.id, queue: j.queueName, data: j.data })),
                failed: failed.map(j => ({ id: j.id, queue: j.queueName, data: j.data, failedReason: j.failedReason, stacktrace: j.stacktrace })),
                completed: completed.map(j => ({ id: j.id, queue: j.queueName, data: j.data, returnvalue: j.returnvalue }))
            }
        };
    },

    // Private Helpers
    _injectDimensions(data: Record<string, unknown>) {
        if (typeof data.size === 'string' && EntityGeometry.isValidSize(data.size)) {
            const { width, height } = EntityGeometry.getPixelDimensions(data.size);
            data.width = width;
            data.height = height;
        }
    },

    async _addToQueue(queue: QueueType, name: string, data: Record<string, unknown>) {
        const config = strapi.config.get('plugin::map-explorer.queue') || {};
        const keepSuccess = config.retentionSuccess || 100;
        const keepFailed = config.retentionFailed || 200;

        return await queue.add(name, data, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: { count: keepSuccess },
            removeOnFail: { count: keepFailed }
        });
    }
  };
};
