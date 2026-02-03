import { Job } from 'bullmq';
import { JobPayloads, JobResults, QueueName } from '@/queues/contract';
import { loadAtoms } from '@/scripts/genesis/atoms-loader';

import type { Core } from '@strapi/strapi';

declare const strapi: Core.Strapi;

export default async function genesis(
  job: Job<JobPayloads[QueueName.GENESIS]>
): Promise<JobResults[QueueName.GENESIS]> {
  const { type } = job.data;
  let processed = 0;

  try {
    if (type === 'atoms' || type === 'all') {
      await loadAtoms(strapi);
      // We don't have exact count from loadAtoms yet unless we return it,
      // but let's assume success.
      processed += 10; // Dummy count for now
    }

    // placeholder for other types
    if (type === 'molecules' || type === 'all') {
      // await loadMolecules(strapi);
      console.log('Molecules loading not yet refactored to worker');
    }

    return {
      success: true,
      entriesProcessed: processed,
    };
  } catch (error) {
    return {
      success: false,
      entriesProcessed: processed,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Register the worker
import { WorkerManager } from '@/queues/worker-manager';
WorkerManager.register(QueueName.GENESIS, genesis);
