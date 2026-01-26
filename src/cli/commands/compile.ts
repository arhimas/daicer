import { Command } from 'commander';
import { getStrapi, stopStrapi } from '../utils/bootstrap';
import { QueueName } from '../../queues/contract';

export const compileCommand = new Command('compile')
  .description('Compilation Service: Validate and Hydrate Entities')
  .option('--phase <phase>', 'Compilation Phase (Atom, Molecule, Compound, Blueprint)')
  .option('--target <uid>', 'Target Entity UID (e.g. api::spell.spell)')
  .option('--id <id>', 'Target Entity Document ID or ID') // DocumentId preferred in Strapi 5
  .option('--queue', 'Run via Queue (Background)', false)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    try {
      await runCompile(options);
    } catch (error: any) {
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: error.message }));
      } else {
        console.error('❌ Error:', error.message);
      }
      process.exit(1);
    }
  });

export async function runCompile(options: { phase?: string; target?: string; id?: string; queue?: boolean; json?: boolean }) {
  const { default: chalk } = await import('chalk');

  if (!options.json) {
    console.log(chalk.bold(`\n🛠️  Compilation`));
  }

  if (!options.phase && (!options.target || !options.id)) {
    throw new Error('Must specify --phase OR --target and --id');
  }

  // Bootstrap Strapi
  const strapi = await getStrapi();

  if (options.queue) {
    // 1. Queue Mode
    if (!options.json) console.log(chalk.yellow('   Dispatching to Queue...'));
    
    // Lazy load QueueManager
    const { QueueManager } = await import('../../queues/queue-manager');
    const queueManager = QueueManager.init(strapi);

    const job = await queueManager.add(QueueName.COMPILE, `compile-${Date.now()}`, {
      phase: options.phase,
      targetUid: options.target,
      targetId: options.id,
    });

    if (options.json) {
      console.log(JSON.stringify({ success: true, jobId: job.id, message: 'Dispatched to queue' }));
    } else {
      console.log(chalk.green(`   ✅ Job dispatched! ID: ${job.id}`));
    }
  } else {
    // 2. Direct Mode
    if (!options.json) console.log(chalk.yellow('   Running directly...'));

    const { CompilationOrchestrator } = await import('../../api/game/src/engine/compilation/CompilationOrchestrator');
    const orchestrator = new CompilationOrchestrator();

    let result;
    if (options.phase) {
      // @ts-expect-error - Runtime dynamic dispatch
      await orchestrator.runPhase(options.phase);
      result = { success: true, phase: options.phase };
    } else if (options.target && options.id) {
      result = await orchestrator.compileEntity(options.target, options.id);
    }

    if (options.json) {
      console.log(JSON.stringify(result));
    } else {
      console.log(chalk.green('   ✅ Compilation Complete.'));
    }
  }

  await stopStrapi();
}
