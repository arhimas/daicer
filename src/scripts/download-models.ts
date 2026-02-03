import 'dotenv/config'; // Load .env for HF_TOKEN
import { env } from '@huggingface/transformers';
// import path from 'path';
import { localLLM } from '@/utils/llm/local';
import { LocalModel } from '@/utils/llm/types';

const MODELS_TO_DOWNLOAD = [
  LocalModel.GEMMA_3_1B_IT,
  LocalModel.GEMMA_3N_1B_IT,
  LocalModel.GEMMA_3_4B_IT,
  LocalModel.GEMMA_3_12B_IT,
  // LocalModel.GEMMA_3_27B_IT, // 27B is HUGE (50GB+), keep commented by default to save user disk unless requested
];

async function main() {
  console.log('🤖 Starting Model Download...');
  console.log(`📂 Cache Directory: ${env.cacheDir}`);

  const results: Record<string, string> = {};

  for (const model of MODELS_TO_DOWNLOAD) {
    console.log(`\n⬇️  Downloading/Verifying: ${model}`);
    try {
      // Use q4 (model_q4.onnx) which exists for 1B
      await localLLM.loadModel(model, 'q4');
      results[model] = '✅ OK';
      console.log(`✅ ${model} Ready.`);
    } catch (error: any) {
      console.error(`❌ Failed: ${model} - ${error.message}`);
      // Continue to next model
      results[model] = '❌ Failed';
    }
  }

  console.log('\n📊 Download Summary:');
  console.table(results);
  process.exit(0);
}

main();
