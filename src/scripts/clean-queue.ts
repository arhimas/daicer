import { Queue } from 'bullmq';
import { QueueName } from '../queues/contract';

// Manually connect to Redis if needed, or just use the queue instance default connection
// Assuming default localhost:6379
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

async function cleanQueue() {
  console.log('🧹 Cleaning Queues...');

  const queueNames = Object.values(QueueName);

  for (const name of queueNames) {
    const queue = new Queue(name, { connection });
    console.log(`Obliterating queue: ${name}...`);
    await queue.obliterate({ force: true });
    // Also drain just in case
    // await queue.drain();
    console.log(`✅ Queue ${name} cleared.`);
    await queue.close();
  }
}

cleanQueue()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error cleaning queues:', err);
    process.exit(1);
  });
