import { QueueName, JobPayloads, JobSchemas } from './contract';
import type { Core } from '@strapi/strapi';

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
  async add<T extends QueueName>(
    queueName: T,
    jobName: string,
    data: JobPayloads[T],
    opts?: any
  ) {
    // 1. Runtime Validation (SOTA Safety)
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
}
