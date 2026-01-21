import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * GENERATE TEXT REMOTE WORKER
 * Atomic worker to generate text from a prompt using Remote API (Gemini).
 */
async function generateTextRemoteProcessor(job: { data: JobPayloads[QueueName.GENERATE_TEXT_REMOTE] }, strapi: Core.Strapi) {
  const { prompt, targetUid, targetId, field } = job.data;

  strapi.log.info(`[GenerateTextRemote] Processing for ${targetUid}:${targetId} on field '${field}'`);

  const { llmService } = await import('../../services/llm-service');

  if (!llmService) {
    throw new Error('LLMService not found');
  }

  // Generate Text
  const generatedText = await llmService.generate(prompt);

  // Save to Entity
  // We use the strapi document service to update the specific field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await strapi.documents(targetUid as any).update({
    documentId: targetId as string, // Assuming documentId usage
    data: {
      [field]: generatedText,
    },
  });

  return { success: true, text: generatedText };
}

WorkerManager.register(QueueName.GENERATE_TEXT_REMOTE, generateTextRemoteProcessor);
