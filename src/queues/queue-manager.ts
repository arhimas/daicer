import { QueueName, JobPayloads, JobSchemas, QueueConfiguration } from './contract';
import type { Core } from '@strapi/strapi';
import { JobsOptions } from 'bullmq';

export class QueueManager {
  private static instance: QueueManager;
  private strapi: Core.Strapi;

  private constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  static init(strapi: Core.Strapi) {
    if (!this.instance) {
      this.instance = new QueueManager(strapi);
    }
    return this.instance;
  }

  static get(): QueueManager {
    if (!this.instance) {
      throw new Error('QueueManager not initialized. Call init(strapi) first.');
    }
    return this.instance;
  }

  /**
   * Add a job to a queue with strict type checking.
   * @param queueName The name of the queue (enum)
   * @param jobName A descriptive name for this specific job instance
   * @param data The job payload, validated against the Zod schema
   * @param opts BullMQ job options (delay, priority, etc.)
   */
  async add<T extends QueueName>(queueName: T, jobName: string, data: JobPayloads[T], opts?: JobsOptions) {
    // 0. Check Configuration
    try {
      const config = (await this.strapi.documents('api::queue-configuration.queue-configuration').findFirst({
        populate: ['queues', 'queues.settings'],
      })) as unknown as QueueConfiguration | null;

      if (config) {
        if (config.globalEnabled === false) {
          throw new Error(`[QueueManager] Job rejected: Queues are globally disabled.`);
        }

        if (config.queues) {
          const queueConfig = config.queues.find((q) => q.queueName === queueName);
          if (queueConfig) {
            if (queueConfig.enabled === false) {
              throw new Error(`[QueueManager] Job rejected: Queue '${queueName}' is disabled.`);
            }

            // Merge Defaults from Config if opts not provided or partial
            const settings = queueConfig.settings;
            if (settings) {
              opts = {
                attempts: settings.retryAttempts ?? 3,
                backoff: {
                  type: 'fixed',
                  delay: settings.retryDelay ?? 1000,
                },
                removeOnComplete: settings.removeOnComplete ?? true,
                removeOnFail: settings.removeOnFail ?? false,
                ...opts, // Allow override per call
              };
            }
          }
        }
      }
    } catch (err: unknown) {
      // Don't fail if just config missing, but do fail if it was an explicit rejection above
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Job rejected')) {
        throw err;
      }
      // Otherwise validation/db errors on config fetch shouldn't block critical path defaults
      // this.strapi.log.warn('[QueueManager] Config fetch failed, proceeding with specific opts.', err);
    }

    // 1. Runtime Validation (Runtime Safety)
    const schema = JobSchemas[queueName];
    const validation = schema.safeParse(data);

    if (!validation.success) {
      this.strapi.log.error(
        `[ResultQueue] Validation failed for job '${jobName}' in queue '${queueName}':`,
        validation.error.format()
      );
      throw new Error(`Invalid job payload for ${queueName}`);
    }

    // 2. Get the BullMQ queue instance from the plugin
    // Note: strapi-plugin-bullmq exposes 'queue' service
    const queueService = this.strapi.plugin('bullmq').service('queue');
    const queue = queueService.get(queueName);

    if (!queue) {
      throw new Error(`Queue '${queueName}' not found or not initialized via plugin.`);
    }

    // 3. Add the job
    return await queue.add(jobName, data, opts);
  }

  /**
   * Returns all active queues for monitoring.
   */
  getQueues() {
    const queueService = this.strapi.plugin('bullmq').service('queue');
    const queues = [];

    for (const name of Object.values(QueueName)) {
      const q = queueService.get(name);
      if (q) {
        queues.push(q);
      }
    }
    return queues;
  }
}
