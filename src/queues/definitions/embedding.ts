import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * EMBEDDING WORKER LOGIC
 */
async function embeddingProcessor(job: { data: JobPayloads[QueueName.EMBEDDING] }, strapi: Core.Strapi) {
  const { entityId, entityType, action } = job.data;

  strapi.log.info(`[EmbeddingWorker] Processing ${action} for ${entityType}:${entityId}`);

  // In a real scenario, we would import the service.
  // For now, we dynamically require to avoid circular dependency issues during bootstrap if needed
  // (though ES modules usually handle it, require is safer inside function scope in Strapi)
  const { entityKnowledgeService } = await import('../../services/entity-knowledge-service');

  if (action === 'upsert') {
    // We assume syncEntity handles the embedding generation using the sourceType if provided
    await entityKnowledgeService.syncEntity(entityType, entityId);
  } else if (action === 'delete') {
    // Logic for cleanup would go here
    strapi.log.info('[EmbeddingWorker] Delete action not fully implemented yet, skipping.');
  }

  return { success: true };
}

// Register the worker
WorkerManager.register(QueueName.EMBEDDING, embeddingProcessor);
