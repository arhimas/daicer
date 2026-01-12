import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * GENERATE TEXT WORKER
 * Atomic worker to generate text from a prompt and save it to a specific field.
 */
async function generateTextProcessor(job: { data: JobPayloads[QueueName.GENERATE_TEXT] }, strapi: Core.Strapi) {
  const { prompt, targetUid, targetId, field } = job.data;
  
  strapi.log.info(`[GenerateText] Processing for ${targetUid}:${targetId} on field '${field}'`);

  const { llmService } = require('../../services/llm-service');
  
  if (!llmService) {
    throw new Error('LLMService not found');
  }

  // Generate Text
  const generatedText = await llmService.generate(prompt);

  // Save to Entity
  // We use the strapi document service to update the specific field
  await strapi.documents(targetUid as any).update({
    documentId: targetId as string, // Assuming documentId usage
    data: {
      [field]: generatedText
    }
  });

  return { success: true, text: generatedText };
}

WorkerManager.register(QueueName.GENERATE_TEXT, generateTextProcessor);
