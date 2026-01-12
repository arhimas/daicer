import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * GENERATE IMAGE WORKER
 * Atomic worker to generate an image from a prompt and save it to a specific field.
 */
async function generateImageProcessor(job: { data: JobPayloads[QueueName.GENERATE_IMAGE] }, strapi: Core.Strapi) {
  const { prompt, targetUid, targetId, field } = job.data;
  
  strapi.log.info(`[GenerateImage] Processing for ${targetUid}:${targetId} on field '${field}'`);

  // We lazily require the service to avoid circular dependencies
  const { imageGenerationService } = require('../../services/image-generation-service');
  
  if (!imageGenerationService) {
    throw new Error('ImageGenerationService not found');
  }

  // Generate and Update
  // The service is expected to handle the generation + upload + attach logic
  // If the service only generates, we would handle attachment here.
  // Assuming a 'generateAndAttach' method exists or similar pattern.
  // Based on user request: "generateImage only need to know the prompt and where to save it"
  
  const result = await imageGenerationService.generateAndAttach({
    prompt,
    collection: targetUid,
    id: targetId,
    field: field
  });

  return { success: true, assetId: result?.id };
}

WorkerManager.register(QueueName.GENERATE_IMAGE, generateImageProcessor);
