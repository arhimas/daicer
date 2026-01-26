import { Command } from 'commander';
import { getStrapi, stopStrapi } from '../utils/bootstrap';
import { QueueName } from '../../queues/contract';

export const genesisCommand = new Command('genesis')
  .description('Genesis Service: Seed and Hydrate Data')
  .argument('[type]', 'Type to seed (atoms, molecules, compounds, blueprints, all)', 'atoms')
  .option('--queue', 'Run via Queue (Background)', false)
  .option('--clean', 'Clean DB before seeding (Not fully implemented yet)', false)
  .option('--json', 'Output raw JSON')
  .action(async (type, options) => {
    try {
      await runGenesis(type, options);
    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: error.message }));
      } else {
        console.error('❌ Error:', error.message);
      }
      process.exit(1);
    }
  });

export async function runGenesis(type: string, options: { queue?: boolean; clean?: boolean; json?: boolean }) {
  const { default: chalk } = await import('chalk');
  // const { default: ora } = await import('ora');

  if (!options.json) {
    console.log(chalk.bold(`\n⚛️  Genesis: ${chalk.cyan(type)}`));
  }

  // Bootstrap Strapi
  const strapi = await getStrapi();

  if (options.queue) {
    // 1. Queue Mode
    if (!options.json) console.log(chalk.yellow('   Dispatching to Queue...'));
    
    // Lazy load QueueManager because it requires Strapi context
    const { QueueManager } = await import('../../queues/queue-manager');
    const queueManager = QueueManager.init(strapi);

    const job = await queueManager.add(QueueName.GENESIS, `genesis-${type}-${Date.now()}`, {
      type: type as any,
      clean: options.clean,
    });

    if (options.json) {
      console.log(JSON.stringify({ success: true, jobId: job.id, message: 'Dispatched to queue' }));
    } else {
      console.log(chalk.green(`   ✅ Job dispatched! ID: ${job.id}`));
    }

  } else {
    // 2. Direct Mode
    if (!options.json) console.log(chalk.yellow('   Running directly (Foreground)...'));

      let result;
      // Depending on type, call specific loader
      if (type === 'atoms') {
        const { loadAtoms } = await import('../../scripts/genesis/atoms-loader');
        result = await loadAtoms(strapi);
      } else {
        // Fallback for others not yet refactored
        if (!options.json) console.warn(chalk.red(`   ⚠️ Type '${type}' not yet fully refactored for CLI direct run. Only 'atoms' is supported directly right now.`));
        // We could run the script via child_process if needed, or throw
        throw new Error(`Type '${type}' not supported in direct CLI mode yet.`);
      }

      if (options.json) {
        console.log(JSON.stringify(result || { success: true }));
      } else {
        console.log(chalk.green('   ✅ Genesis Complete.'));
      }
  }

  // Only stop strapi if we started it (getStrapi handles singleton)
  // But for CLI command, we usually process.exit(0) at the end or let the caller loop.
  // In `explore` we used `stopStrapi()` but here we might want to keep it open if using child process?
  // But here we await. So we can stop.
  
  // NOTE: If we use Queue, we just dispatched. We can close.
  // If we ran directly, we finished. We can close.
  // However, `stopStrapi` might kill the worker if we are running in the SAME process? 
  // No, CLI is separate process. The worker runs in the backend server.
  // Wait, if we use --queue, we are adding to Redis. The worker is in the MAIN backend process.
  
  // But what if we are running the CLI and expecting it to process it?
  // "The user wants to run the genesis on demand on other dbs to test..." 
  // Usually --queue implies there is a worker running somewhere.
  
  await stopStrapi();
}
