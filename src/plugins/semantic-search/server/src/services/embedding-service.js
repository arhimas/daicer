'use strict';

const path = require('path');

// lazy load transformers to avoid startup perf hit if not used immediately
let pipeline;
let env;

module.exports = ({ strapi }) => ({
  pipelineInstance: null,
  modelName: 'Xenova/jina-embeddings-v2-small-en',

  /**
   * Initializes the Transformers.js pipeline.
   * Lazy loads the model into memory.
   */
  async init() {
    if (this.pipelineInstance) return;

    try {
      const transformers = await import('@huggingface/transformers');
      pipeline = transformers.pipeline;
      env = transformers.env;

      const cacheDir = path.resolve(process.cwd(), 'local_models');
      env.cacheDir = cacheDir;
      env.allowLocalModels = true; // Use cached if available

      strapi.log.info(`🔌 [SemanticSearch] Initializing local Jina model (${this.modelName})...`);
      
      this.pipelineInstance = await pipeline('feature-extraction', this.modelName, {
        dtype: 'q8',
        device: 'auto',
      });

      strapi.log.info('✅ [SemanticSearch] Model Ready');
    } catch (error) {
      strapi.log.error('❌ [SemanticSearch] Failed to initialize model:', error);
      throw error;
    }
  },

  /**
   * Generates a Vector Embedding for the given text.
   * @param {string} text 
   * @returns {Promise<number[]>} 1xn Vector
   */
  async generateEmbedding(text) {
    if (!text || !text.trim()) return [];

    try {
      await this.init();
      if (!this.pipelineInstance) return [];

      // Jina v2-small-en context limit is 8192, we can be generous
      const result = await this.pipelineInstance(text, {
        pooling: 'mean',
        normalize: true,
      });

      // result.tolist() returns [ [ ... ] ] for single input
      const raw = result.tolist();
      if (Array.isArray(raw) && raw.length > 0) {
         return raw[0];
      }
      return [];
    } catch (e) {
      strapi.log.error('Embedding Generation Failed:', e.message);
      return [];
    }
  },
});
