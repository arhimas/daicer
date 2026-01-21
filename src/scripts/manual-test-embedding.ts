export {}; // Isolate module
import { embeddingService } from '../services/embedding-service';

async function test() {
  console.log('🚀 Testing EmbeddingService (Local Transformers Jina V2)...');

  try {
    const text = 'Embedding Service Test';
    console.log(`Input: "${text}"`);
    console.log('Generating embedding (first run may take time to download model)...');

    const start = Date.now();
    const vec = await embeddingService.generateEmbedding(text, 'text-matching');
    const duration = Date.now() - start;

    console.log(`✅ Success! Vector length: ${vec.length}`);
    console.log(`⏱️ Latency: ${duration}ms`);

    if (vec.length !== 512) {
      // Jina V2 Small is 512 dimensions
      console.warn(`⚠️ Warning: Expected 512 dimensions, got ${vec.length}. (Check model config)`);
    }

// process.exit(0); // Let node exit naturally to avoid mutex lock issues with ONNX
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exit(1);
  }
}

// Run immediately, service handles initialization
test();
