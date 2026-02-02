import { Command } from 'commander';
import { getStrapi, stopStrapi } from '../utils/bootstrap';
import { QueueName } from '../../queues/contract';

export const embedCommand = new Command('embed')
  .description('Embedding Service: Vectorize Entities')
  .argument('[type]', 'Content Type to embed (or "all")', 'all')
  .option('--queue', 'Run via Queue (Background)', false)
  .option('--json', 'Output raw JSON')
  .action(async (type, options) => {
    try {
      await runEmbed(type, options);
    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: error.message }));
      } else {
        console.error('❌ Error:', error.message);
      }
      process.exit(1);
    }
  });

export async function runEmbed(typeArg: string, options: { queue?: boolean; json?: boolean }) {
  const { default: chalk } = await import('chalk');
  // const { JuicyProgressBar } = await import('../../scripts/utils/progressBar'); // Assuming this exists or copy logic

  if (!options.json) {
    console.log(chalk.bold(`\n🧠  Embedding: ${chalk.cyan(typeArg)}`));
  }

  const strapi = await getStrapi();

  // Resolve Types
  const { EMBEDDABLE_MODELS } = await import('../../config/embedding');
  const models = typeArg === 'all' ? EMBEDDABLE_MODELS : [typeArg];

  const { entityKnowledgeService } = await import('../../services/entity-knowledge-service');
  const { QueueManager } = await import('../../queues/queue-manager');
  const queueManager = QueueManager.init(strapi);

  let totalDispatched = 0;
  let totalProcessed = 0;

  for (const model of models) {
    // Check if model exists
    if (!strapi.contentTypes[model]) {
      if (!options.json) console.warn(chalk.yellow(`   Skip ${model}: Not found`));
      continue;
    }

    // Find all IDs
    const entries = await strapi.entityService.findMany(model as any, { fields: ['id'] });
    const ids = Array.isArray(entries) ? entries.map((e: any) => e.id) : [];

    if (ids.length === 0) continue;

    if (!options.json) console.log(`   Processing ${model} (${ids.length} entries)...`);

    if (options.queue) {
      // Dispatch Jobs
      for (const id of ids) {
        await queueManager.add(QueueName.EMBEDDING, `embed-${model}-${id}`, {
          entityId: id,
          entityType: model,
          action: 'upsert',
        });
      }
      totalDispatched += ids.length;
    } else {
      // Direct
      let idx = 0;
      for (const id of ids) {
        await entityKnowledgeService.syncEntity(model, id);
        idx++;
        if (!options.json && idx % 10 === 0) process.stdout.write('.');
      }
      totalProcessed += ids.length;
      if (!options.json) process.stdout.write('\n');
    }
  }

  if (options.json) {
    console.log(
      JSON.stringify({
        success: true,
        mode: options.queue ? 'queue' : 'direct',
        count: options.queue ? totalDispatched : totalProcessed,
      })
    );
  } else {
    console.log(
      chalk.green(
        `\n✅ Operation Complete. ${options.queue ? 'Dispatched' : 'Processed'} ${options.queue ? totalDispatched : totalProcessed} items.`
      )
    );
  }

  await stopStrapi();
}
