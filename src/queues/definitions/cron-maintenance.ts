import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * MAINTENANCE WORKER LOGIC
 */
async function maintenanceProcessor(job: { data: JobPayloads[QueueName.MAINTENANCE] }, strapi: Core.Strapi) {
  const { task } = job.data;
  strapi.log.info(`[MaintenanceWorker] Executing task: ${task}`);

  // Simulation of work
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { processed: 1 };
}

WorkerManager.register(QueueName.MAINTENANCE, maintenanceProcessor);
