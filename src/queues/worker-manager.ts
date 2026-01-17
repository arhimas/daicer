import { QueueName } from './contract';
import type { Core } from '@strapi/strapi';
import { Worker, Job } from 'bullmq';

// Registry of Worker Handlers
const workerRegistry: Record<string, (job: Job, strapi: Core.Strapi) => Promise<unknown>> = {};

export class WorkerManager {
  private static instance: WorkerManager;
  private strapi: Core.Strapi;
  private workers: Worker[] = [];

  private constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  static init(strapi: Core.Strapi) {
    if (!this.instance) {
      this.instance = new WorkerManager(strapi);
      this.instance.startAll();
    }
    return this.instance;
  }

  static async stop() {
    if (this.instance) {
      await this.instance.destroy();
    }
  }

  /**
   * Register a processor for a queue.

   * Call this from your definition files.
   */
  static register(queueName: QueueName, handler: (job: Job, strapi: Core.Strapi) => Promise<unknown>) {
    workerRegistry[queueName] = handler;
  }

  private async startAll() {
    this.strapi.log.info(`[WorkerManager] Starting workers for ${Object.keys(workerRegistry).length} queues...`);

    // Resolve Redis Connection Config
    // We prioritize the plugin config, but fallback to manual env vars if needed
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    };

    for (const [queueName, handler] of Object.entries(workerRegistry)) {
      this.strapi.log.info(`[WorkerManager] Initializing native BullMQ Worker for: ${queueName}`);

      try {
        const worker = new Worker(
          queueName,
          async (job) => {
            this.strapi.log.info(`[Worker:${queueName}] Processing job ${job.id}`);
            try {
              return await handler(job, this.strapi);
            } catch (err) {
              this.strapi.log.error(`[Worker:${queueName}] Failed jid=${job.id}:`, err);
              throw err;
            }
          },
          {
            connection,
            concurrency: 1,
          }
        );

        worker.on('completed', (job) => {
          this.strapi.log.debug(`[WorkerManager] Job ${job.id} completed in ${queueName}`);
        });

        worker.on('failed', (job, err) => {
          this.strapi.log.error(`[Worker:${queueName}] Job ${job?.id} failed globally:`, err);
        });

        this.workers.push(worker);
      } catch (err) {
        this.strapi.log.error(`[WorkerManager] Failed to create worker for ${queueName}`, err);
      }
    }
  }

  async destroy() {
    this.strapi.log.info('[WorkerManager] Gracefully shutting down workers...');
    await Promise.all(this.workers.map((w) => w.close()));
  }
}
