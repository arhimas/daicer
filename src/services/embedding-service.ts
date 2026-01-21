import { pipeline, env, FeatureExtractionPipeline } from '@huggingface/transformers';
import path from 'path';

export type EmbeddingTask = 'retrieval.query' | 'retrieval.passage' | 'text-matching' | 'separation' | 'classification';

/**
 * Service for generating vector embeddings using Jina-Embeddings-v2 via local Transformer pipeline.
 *
 * 🚀 **Advanced Implementation**:
 * - Uses local `local_models` cache.
 * - Zero network latency after initial download.
 * - Supports quantized Jina v2 (8192 token context).
 */
export class EmbeddingService {
  private pipeline: FeatureExtractionPipeline | null = null;
  private modelName = 'Xenova/jina-embeddings-v2-small-en';
  private cacheDir: string;
  private isInitializing = false;

  constructor() {
    // Configure local cache directory at project root
    this.cacheDir = path.resolve(process.cwd(), 'local_models');
    
    // Configure transformers env
    env.cacheDir = this.cacheDir;
    env.allowLocalModels = true; 
    // We allow remote models so it can download them once, then it uses cache.
    // To strictly force offline after download, we'd toggle allowRemoteModels = false.
  }

  private async ensureInitialized(): Promise<void> {
    if (this.pipeline) return;
    if (this.isInitializing) {
      // Basic wait loop for concurrent requests during init
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.pipeline) return;
    }

    this.isInitializing = true;
    try {
      console.log(`🔌 [EmbeddingService] Initializing local Jina model (${this.modelName})...`);
      console.log(`📂 [EmbeddingService] Model Cache: ${this.cacheDir}`);

      this.pipeline = await pipeline('feature-extraction', this.modelName, {
        dtype: 'q8', // Quantized for mobile/low-memory usage (~40MB)
        device: 'auto',
      });

      console.log('✅ [EmbeddingService] Model Ready');
    } catch (error) {
      console.error('❌ [EmbeddingService] Failed to initialize model:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Generates a vector embedding for the given text.
   * @param text The text to embed.
   * @param task (Unused in v2-small-en pipeline pure usage, but kept for interface/future)
   */
  async generateEmbedding(text: string, _task: EmbeddingTask = 'text-matching'): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      await this.ensureInitialized();
      if (!this.pipeline) throw new Error('Pipeline failed to initialize');

      // Jina v2 handles long context, but let's be safe if it's absurdly huge
      // The model limit is 8192 tokens.
      
      const output = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true,
      });

      // output.tolist() returns number[][] because of batching, but we sent one string
      // so we want the first element.
      const raw = output.tolist(); 
      if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
          return raw[0] as number[];
      }
      return raw as unknown as number[]; // Fallback if shape differs, though mean pooling usually returns [dim]
      
    } catch (error) {
      console.error('❌ [EmbeddingService] Generation failed:', error);
      throw error;
    }
  }

  terminate() {
     // No-op for transformers.js usually, unless we want to dispose the session if possible.
     // In JS/ONNX runtime, explicit disposal isn't always strictly exposed via pipeline API easily 
     // without digging into the model session. For now, we leave it.
     this.pipeline = null;
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
