
import { createStrapi } from '@strapi/strapi';
import { QueueName } from '../queues/contract';
import { QueueManager } from '../queues/queue-manager';
import { localLLM as _localLLM } from '../utils/llm/local';
import { LocalModel } from '../utils/llm/types';

// Mock DB update so we don't need real entities
// Actually we can't easily mock strapi.documents in E2E script unless we monkey patch
// Or we just target a non-existent UID and expect it to fail at SAVE step but succeed at GENERATION step.
// The worker returns { success, text } or { success, error }.
// Let's rely on logging or inspecting the job result if possible.

async function main() {
  console.log('🚀 Starting Local Queue Verification...');
  
  // 1. Boot Strapi (needed for Queue/Redis connection)
  const strapi = await createStrapi({ distDir: './dist' }).load();
  await strapi.start(); // Helper to start

  console.log('✅ Strapi Booted');

  // 2. Ensure QueueManager is initialized in this script context
  // (In case of split-brain between src/dist or missed bootstrap)
  QueueManager.init(strapi);

  // Access the queue directly from the plugin service
  const queueService = strapi.plugin('bullmq').service('queue');
  const queue = queueService.get(QueueName.GENERATE_TEXT_LOCAL);
  if (!queue) {
      console.error('❌ Queue GENERATE_TEXT_LOCAL not found!');
      process.exit(1);
  }

  // 3. Add a Job
  console.log('📤 Adding Job to Queue...');
  // QueueManager.get().add(queueName, jobName, data)
  const job = await QueueManager.get().add(QueueName.GENERATE_TEXT_LOCAL, 'verify-gemma-1b', {
      prompt: "Explain why D&D 5e is awesome in one sentence.",
      targetUid: "api::article.article", // Dummy
      targetId: "dummy-id",              // Dummy
      field: "content",                  // Dummy
      model: LocalModel.GEMMA_3_1B_IT    // Use the 1B model we verified
  });

  console.log(`✅ Job Added: ${job.id}`);

  // 4. Wait for completion
  console.log('⏳ Waiting for result (this involves loading the model in Python)...');
  
  // Poll job status
  const checkInterval = setInterval(async () => {
      const state = await job.getState();
      console.log(`   Job State: ${state}`);
      
      if (state === 'completed') {
          clearInterval(checkInterval);
          // In BullMQ, job.returnvalue might be a promise or getter.
          // However, verify we shouldn't rely on the job instance being auto-updated.
          // Depending on the version, we might need to fetch the job again to see the result.
          // But returnvalue is stored in Redis.
          const result = await job.returnvalue;
          
          console.log('\n🎉 Job Completed!');
          console.log('Result:', result);
          
          if (!result) {
              console.error('❌ Result is null/undefined. Worker might have returned nothing.');
              process.exit(1);
          }
          
          if (result.success && result.text) {
             console.log('\n🤖 Generated Text:\n', result.text);
             console.log('\n✅ VERIFICATION PASSED');
             process.exit(0);
          } else {
             // It might fail on save (expected since dummy ID), but if text is there, inference worked!
             if (result.text) {
                 console.log('\n🤖 Generated Text (Save Failed as expected):\n', result.text);
                 console.log('\n✅ VERIFICATION PASSED (Inference worked)');
                 process.exit(0);
             } else {
                 console.error('❌ Job failed to generate text:', result);
                 process.exit(1);
             }
          }
      } else if (state === 'failed') {
          clearInterval(checkInterval);
          console.error('\n❌ Job Failed in Queue:', job.failedReason);
          process.exit(1);
      }
  }, 2000);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
