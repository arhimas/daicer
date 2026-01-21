/**
 * LLM Gateway Service
 * 
 * The single entry point for all LLM operations in Daicer.
 * Routes requests to either Remote (Gemini) or Local (Gemma) queues.
 */

import { QueueName } from '../../../queues/contract';
import { JobSchemas } from '../../../queues/contract';
import type { Core } from '@strapi/strapi';
import { QueueManager } from '../../../queues/queue-manager';
import { LocalModel, LocalConfig, GeminiModel, GeminiConfig } from '../../../utils/llm/types';

interface GenerationRequest {
  prompt: string;
  targetUid: string;
  targetId: string | number;
  field: string;
}

interface LocalGenerationRequest extends GenerationRequest {
  provider: 'local';
  config?: LocalConfig;
}

interface RemoteGenerationRequest extends GenerationRequest {
  provider: 'remote';
  config?: GeminiConfig;
}

type LLMRequest = LocalGenerationRequest | RemoteGenerationRequest;

export const llmGateway = {
  /**
   * Queue a generation job.
   * Auto-routes to correct queue based on provider preference.
   */
  queue: async (request: LLMRequest) => {
    const { prompt, targetUid, targetId, field, provider } = request;

    if (provider === 'local') {
      const config = request.config || {};
      
      // Default to Gemma 3 4B if not specified
      const model = config.model || LocalModel.GEMMA_3_4B_IT;

      await QueueManager.get().add(QueueName.GENERATE_TEXT_LOCAL, `local-gen-${targetUid}-${targetId}`, {
        prompt,
        targetUid,
        targetId,
        field,
        model, 
        // We might want to pass full config, but for now stick to Schema
      });
      
      strapi.log.info(`[LLM-Gateway] Queued LOCAL generation for ${targetUid}:${targetId} using ${model}`);
    } else {
      // Remote
      await QueueManager.get().add(QueueName.GENERATE_TEXT_REMOTE, `remote-gen-${targetUid}-${targetId}`, {
        prompt,
        targetUid,
        targetId,
        field,
      });
      strapi.log.info(`[LLM-Gateway] Queued REMOTE generation for ${targetUid}:${targetId}`);
    }
  },

  /**
   * Direct Synchronous Generation (WARNING: BLOCKS EVENT LOOP if Local)
   * Use only for debugging or strictly required synchronous ops.
   */
  generateSync: async (prompt: string, provider: 'local' | 'remote' = 'remote', config: any = {}) => {
    if (provider === 'local') {
        const { localLLM } = await import('../../../utils/llm/local');
        return localLLM.generate(prompt, config);
    } else {
        const { llmService } = await import('../../../services/llm-service');
        return llmService.generate(prompt, config.model); // Legacy service for now
    }
  }
};
