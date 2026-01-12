export {}; // Isolate module
import { embeddingService } from '../services/embedding-service';

async function test() {
  console.log('🚀 Testing EmbeddingService (Jina V3 Python Bridge)...');
  
  try {
    const text = 'SOTA Embedding Test';
    console.log(`Input: "${text}"`);
    
    const start = Date.now();
    const vec = await embeddingService.generateEmbedding(text, 'text-matching');
    const duration = Date.now() - start;
    
    console.log(`✅ Success! Vector length: ${vec.length}`);
    console.log(`⏱️ Latency: ${duration}ms`);
    
    if (vec.length !== 1024) { // Jina V3 default is 1024
        console.warn(`⚠️ Warning: Expected 1024 dimensions, got ${vec.length}. (Check model config)`);
    }

    process.exit(0);
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exit(1);
  }
}

// Give service time to spawn
setTimeout(test, 3000);
