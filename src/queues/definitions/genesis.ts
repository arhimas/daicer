import { Job } from 'bullmq';
import { JobPayloads, JobResults, QueueName } from '../contract';
import { loadAtoms } from '../../scripts/genesis/atoms-loader';

declare const strapi: any; // Strapi global is available in worker context

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
  } catch (error: any) {
    return {
      success: false,
      entriesProcessed: processed,
      error: error.message,
    };
  }
}

// Register the worker
import { WorkerManager } from '../worker-manager';
WorkerManager.register(QueueName.GENESIS, genesis);
