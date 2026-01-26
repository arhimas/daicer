import { QueueName, QueueConfiguration } from './contract';
import type { Core } from '@strapi/strapi';
import { Worker, Job } from 'bullmq';
import { DevLogger } from '../utils/dev-logger';
import { ResourceGuard, SystemOverloadError } from './resource-guard';

// Registry of Worker Handlers
const workerRegistry: Record<string, (job: Job, strapi: Core.Strapi) => Promise<unknown>> = {};

export class WorkerManager {
  private static instance: WorkerManager;
  private strapi: Core.Strapi;
  private workers: Worker[] = [];
  private logger: DevLogger;

  private constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
    this.logger = new DevLogger('WorkerManager', strapi);
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
   *
   * Call this from your definition files.
   */
  static register(queueName: QueueName, handler: (job: Job, strapi: Core.Strapi) => Promise<unknown>) {
    workerRegistry[queueName] = handler;
  }

  private async startAll() {
    this.logger.info(`Starting workers for ${Object.keys(workerRegistry).length} queues...`);

    // Fetch Global Configuration
    let config: QueueConfiguration | null = null;
    try {
      config = (await this.strapi
        .documents('api::queue-configuration.queue-configuration')
        .findFirst({
          populate: ['queues', 'queues.settings'],
        })) as unknown as QueueConfiguration | null;
    } catch (_err) {
      this.logger.warn('Failed to fetch configuration, falling back to defaults.');
    }

    if (config && config.globalEnabled === false) {
      this.logger.warn('⚠️ Queues are globally disabled in configuration.');
      return;
    }

    // Resolve Redis Connection Config
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    };

    for (const [queueName, handler] of Object.entries(workerRegistry)) {
      // Resolve Queue Specific Config
      let concurrency = 1;
      let settings = undefined;

      if (config && config.queues) {
        const queueConfig = config.queues.find((q) => q.queueName === queueName);
        if (queueConfig) {
          if (queueConfig.enabled === false) {
            this.logger.info(`⏸️ Skipping worker for ${queueName} (Disabled in Config)`);
            continue;
          }
          concurrency = queueConfig.concurrency || 1;
          settings = queueConfig.settings;
        }
      }

      this.logger.info(`Initializing native BullMQ Worker for: ${queueName} (Concurrency: ${concurrency})`);

      try {
        const workerLogger = new DevLogger(`Worker:${queueName}`, this.strapi);
        
        const worker = new Worker(
          queueName,
          async (job) => {
            const tracker = workerLogger.start(`Job ${job.id}`);
            try {
              // Resource Guard: Admission Control
              if (settings) {
                 const { maxMemoryMB, maxCpuPercent } = settings;
                 await ResourceGuard.check({ maxMemoryMB, maxCpuPercent });
              }

              const result = await handler(job, this.strapi);
              tracker.end();
              return result;
            } catch (err) {
              if (err instanceof SystemOverloadError) {
                 workerLogger.warn(`[ResourceGuard] ${err.message}. Retrying later...`);
                 // Throwing error causes BullMQ to retry based on backoff settings
                 // We might want to add a distinct custom error or delay, 
                 // but standard retry is safest for now.
              }
              tracker.fail(err);
              throw err;
            }
          },
          {
            connection,
            concurrency,
            ...(settings ? {
               limiter: settings.rateLimit ? { max: settings.rateLimit, duration: 1000 } : undefined,
            } : {}),
            removeOnComplete: settings?.removeOnComplete ?? { count: 100 },
            removeOnFail: settings?.removeOnFail ?? { count: 500 },
          }
        );

        // worker.on('completed', (job) => { /* handled inside handler wrapper */ });

        worker.on('failed', (_job, _err) => {
             // We can log global failures here as a backup, but the try/catch inside the processor handles specific job failure context better
             // However, BullMQ might fail outside of the processor (e.g. stalled)
             // workerLogger.error(`Global Failure for ${job?.id}`, err);
        });
        
        // General worker errors (connection issues etc)
        worker.on('error', (err) => {
             workerLogger.error('Worker connection error', err);
        });

        this.workers.push(worker);
      } catch (err) {
        this.logger.error(`Failed to create worker for ${queueName}`, err);
      }
    }
  }

  async destroy() {
    this.logger.info('Gracefully shutting down workers...');
    await Promise.all(this.workers.map((w) => w.close()));
  }
}
