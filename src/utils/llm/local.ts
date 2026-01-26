
// import { StructuredGenerator } from './structured';
// import { PythonBridge } from './python-bridge';
// import { LocalModel, LocalConfig } from './types';

/**
 * Singleton manager for Local LLM inference.
 * Bridges to a Python environment to run quantized models (Gemma 3).
 * WARNING: High memory usage.
 */
// Stub replacement for LocalLLMManager
const resultStub = {
    loadModel: async (...args: unknown[]) => { console.warn('Local LLM via PythonBridge is pending replacement.', args); },
    generate: async (...args: unknown[]) => { 
        console.warn('Local LLM via PythonBridge is pending replacement.', args); 
        return "Local LLM disabled."; 
    },
    reset: () => {}
};

export const localLLM = resultStub;
/*
class LocalLLMManager {
  private static instance: LocalLLMManager;
  // private bridge: PythonBridge; // DELETED
  private currentModel: LocalModel | null = null;
  private loadingPromise: Promise<void> | null = null;

  private constructor() {
    // this.bridge = new PythonBridge();
  }
  // ... Implementation pending new Local Execution Strategy ...
}
*/
