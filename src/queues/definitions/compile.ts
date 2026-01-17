import { Job } from 'bullmq';
import { JobPayloads, JobResults, QueueName } from '../contract';
import { CompilationOrchestrator } from '../../api/game/src/engine/compilation/CompilationOrchestrator';

export default async function compile(
  job: Job<JobPayloads[QueueName.COMPILE]>
): Promise<JobResults[QueueName.COMPILE]> {
  const { phase, targetUid, targetId } = job.data;
  
  try {
    const orchestrator = new CompilationOrchestrator();
    let count = 0;

    if (phase) {
      // @ts-ignore
      await orchestrator.runPhase(phase);
      count = 100; // Placeholder, orchestrator doesn't return count yet
    } else if (targetUid && targetId) {
      const result = await orchestrator.compileEntity(targetUid, targetId);
      count = 1;
    }

    return {
      success: true,
      compiledCount: count,
    };
  } catch (error: any) {
    return {
      success: false,
      compiledCount: 0,
      error: error.message,
    };
  }
}

// Register the worker
import { WorkerManager } from '../worker-manager';
WorkerManager.register(QueueName.COMPILE, compile);
