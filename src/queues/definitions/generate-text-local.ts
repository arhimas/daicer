import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';
import { localLLM } from '../../utils/llm/local';
import { LocalModel } from '../../utils/llm/types';

/**
 * GENERATE TEXT LOCAL WORKER
 * Atomic worker to generate text using LOCAL Gemma models.
 * Heavy resource usage.
 */
async function generateTextLocalProcessor(
  job: { data: JobPayloads[QueueName.GENERATE_TEXT_LOCAL] },
  strapi: Core.Strapi
) {
  const { prompt, targetUid, targetId, field, model } = job.data;

  strapi.log.info(`[GenerateTextLocal] Processing for ${targetUid}:${targetId} using ${model || 'default'}`);

  try {
    const generatedText = await localLLM.generate(prompt, {
      model: model as LocalModel,
      // Future: Pass more config from job if needed
    });

    // Save to Entity
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetService = strapi.documents(targetUid as any);
      if (targetService) {
        await targetService.update({
          documentId: targetId as string,
          data: {
            [field]: generatedText,
          },
        });
      }
    } catch (saveError) {
      // If save fails (e.g. dummy ID), we still want to return the text for verification
      strapi.log.warn(
        `[GenerateTextLocal] Text generated but failed to save to ${targetUid}:${targetId}: ${saveError}`
      );
      return { success: false, text: generatedText, error: `Save Failed: ${saveError}` };
    }

    return { success: true, text: generatedText };
  } catch (error) {
    strapi.log.error(`[GenerateTextLocal] Failed: ${error}`);
    return { success: false, error: String(error) };
  }
}

WorkerManager.register(QueueName.GENERATE_TEXT_LOCAL, generateTextLocalProcessor);
