
import { env, pipeline } from '@huggingface/transformers';
import path from 'path';

// Configure cache
env.cacheDir = path.join(process.cwd(), '.cache', 'models');
env.allowLocalModels = false; // Force using the hub first

async function testLoad() {
  const modelId = 'onnx-community/gemma-3-1b-it-ONNX';
  console.log(`Testing load for: ${modelId}`);

  try {
    // Attempt 1: Explicitly requesting q4 which we know exists
    console.log('Attempting q4 load...');
    const pipe = await pipeline('text-generation', modelId, {
      dtype: 'q4', // Should map to model_q4.onnx
      device: 'cpu',
    });
    console.log('✅ Success!');
    const out = await pipe('Hello gemma!', { max_new_tokens: 10 });
    console.log(out);
  } catch (err: any) {
    console.error('❌ Failed q4:', err.message);
  }
}

async function testLoad4B() {
    const modelId = 'onnx-community/gemma-3-4b-it-ONNX';
    console.log(`\nTesting load for: ${modelId}`);
    
    try {
        console.log('Attempting load with type override...');
        // We might need to monkey patch the config if possible or just try loading
        // Transformers.js reads config.json, sees "gemma3_text", throws error.
        
        // There is no easy public API to register new models in JS version yet aside from editing source.
        // However, we can try to pass a config object if the API supports it.
        // Or we rely on the fact that if we can't load it, we can't use it.
        
        await pipeline('text-generation', modelId, {
            dtype: 'q4',
        });
        console.log('✅ Success 4B!');
    } catch (err: any) {
        console.error('❌ Failed 4B:', err.message);
    }
}

testLoad().then(() => testLoad4B());
