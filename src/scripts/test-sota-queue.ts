/**
 * Manual Test Script for SOTA Queues.
 * Usage: yarn ts-node src/scripts/test-sota-queue.ts
 */
import { getStrapi } from '../cli/utils/bootstrap';
import { QueueManager } from '../queues/queue-manager';
import { QueueName } from '../queues/contract';

async function main() {
  // 1. Boot Strapi (Headless)
  const strapi = await getStrapi();

  try {
    // 2. Initialize QueueManager explicitly for this process
    QueueManager.init(strapi);
    const queueManager = QueueManager.get();

    console.log('🚀 Adding Embedding Job...');

    await queueManager.add(QueueName.EMBEDDING, 'test-embedding-job-' + Date.now(), {
      entityId: 1,
      entityType: 'api::character.character',
      action: 'upsert',
      sourceType: 'manual',
    });

    console.log('✅ Job Added! Check console/logs for worker output.');

    console.log('🚀 Adding Maintenance Job...');
    await queueManager.add(QueueName.MAINTENANCE, 'test-maintenance-' + Date.now(), {
      task: 'vacuum-db',
    });
    console.log('✅ Maintenance Job Added!');
  } catch (err) {
    console.error('❌ Error:', err);
  }

  setTimeout(() => {
    console.log('👋 Exiting test script...');
    process.exit(0);
  }, 5000);
}

main();
