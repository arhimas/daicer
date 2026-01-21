
import { PythonBridge } from './python-bridge';
import { LocalModel, LocalConfig } from './types';

/**
 * Singleton manager for Local LLM inference.
 * Bridges to a Python environment to run quantized models (Gemma 3).
 * WARNING: High memory usage.
 */
class LocalLLMManager {
  private static instance: LocalLLMManager;
  private bridge: PythonBridge;
  private currentModel: LocalModel | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    this.bridge = new PythonBridge();
  }

  public static getInstance(): LocalLLMManager {
    if (!LocalLLMManager.instance) {
      LocalLLMManager.instance = new LocalLLMManager();
    }
    return LocalLLMManager.instance;
  }

  /**
   * Initialize or switch the loaded local model.
   * This is a heavy blocking operation that may take seconds to minutes.
   * 
   * @param model - The model identifier (LocalModel enum).
   * @param quantization - Quantization level (q4 recommended for most consumer hardware).
   */
  public async loadModel(model: LocalModel, quantization: 'q8' | 'q4' | 'fp16' | 'int8' = 'q4') {
    if (this.currentModel === model) {
      // Already loaded
      return; 
    }

    if (this.loadingPromise) {
      await this.loadingPromise;
      if (this.currentModel === model) return;
    }

    this.loadingPromise = (async () => {
      console.log(`[LocalLLM] Loading model ${model} via Python Bridge...`);
      
      let repoId = 'google/gemma-3-1b-it';
      
      switch (model) {
        // Now valid because we are using real transformers python lib
        case LocalModel.GEMMA_3_27B_IT:
          repoId = 'google/gemma-3-27b-it';
          break;
        case LocalModel.GEMMA_3_12B_IT:
            repoId = 'google/gemma-3-12b-it';
            break;
        case LocalModel.GEMMA_3_4B_IT:
            repoId = 'google/gemma-3-4b-it';
            break;
        case LocalModel.GEMMA_3_1B_IT:
            repoId = 'google/gemma-3-1b-it';
            break;
        case LocalModel.GEMMA_3N_1B_IT:
          repoId = 'google/gemma-3n-1b-it';
          break;
        default:
          repoId = model;
      }
      
      // Map TS quantization types to what our python bridge expects (simple string identifiers)
      // q4/q8 in TS (from ONNX legacy) map to 4bit/8bit in bitsandbytes
      let pyQuant: string | null = null;
      if (quantization === 'q8') pyQuant = '8bit';
      else if (quantization === 'int8') pyQuant = '8bit';
      else if (quantization === 'q4') pyQuant = '4bit';
      
      // otherwise null = full precision / auto

      try {
        await this.bridge.loadModel(repoId, pyQuant as any);
        this.currentModel = model;
        console.log(`[LocalLLM] Model ${model} loaded successfully.`);
      } catch (error) {
        console.error(`[LocalLLM] Failed to load model ${model}:`, error);
        throw error;
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  public async generate(prompt: string, config: LocalConfig = {}) {
    if (!this.currentModel) {
      // Default auto-load if not loaded
      await this.loadModel(config.model || LocalModel.GEMMA_3N_1B_IT, config.quantization);
    }

    const output = await this.bridge.generate(
      prompt, 
      config.maxTokens || 256,
      config.temperature || 0.7
    );

    return output;
  }

  /**
   * RESET STATE
   */
  public reset() {
     this.currentModel = null;
  }
}

export const localLLM = LocalLLMManager.getInstance();
