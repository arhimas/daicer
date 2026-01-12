#!/usr/bin/env node
import { Command } from 'commander';
// import chalk from 'chalk';
import { exploreCommand } from './commands/explore';
import { statusCommand } from './commands/status';
import { schemaCommand } from './commands/schema';
import { knowledgeCommand } from './commands/knowledge';

const program = new Command();

program.name('daicer-cli').description('🎲 Daicer Backend CLI - Debug and Inspect your Game World').version('0.1.0');

// Register Commands
program.addCommand(exploreCommand);
program.addCommand(statusCommand);
program.addCommand(schemaCommand);
program.addCommand(knowledgeCommand);

// Parse Arguments
// Global Pre-Action: Banner logic
program.hook('preAction', async (_thisCommand, _actionCommand) => {
  // If JSON flag is strictly present on the command or globally?
  // Commander passes options. But 'explore' might have --json.
  // We need to check process.argv or specific command options.
  const isJson = process.argv.includes('--json');

  if (!isJson) {
    const { default: boxen } = await import('boxen');
    const { default: gradient } = await import('gradient-string');
    const { default: chalk } = await import('chalk');

    console.log(
      boxen(gradient.passion('  🎲  DAICER CLI  🎲  ') + `\n${chalk.dim('  The Lens of the Agent  ')}`, {
        padding: 0,
        borderStyle: 'classic',
        borderColor: 'magenta',
        float: 'center',
        dimBorder: true,
      })
    );
  }
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  (async () => {
    const { default: boxen } = await import('boxen');
    const { default: gradient } = await import('gradient-string');
    const { default: chalk } = await import('chalk');
    const { select } = await import('@inquirer/prompts');

    // Import command runners
    const { runExplore } = await import('./commands/explore');
    const { runKnowledge } = await import('./commands/knowledge');
    const { runStatus } = await import('./commands/status');
    const { runSchema } = await import('./commands/schema');

    console.log(
      boxen(
        chalk.bold('  PHILOSOPHY OF THE DAICER CLI  ') +
          '\n\n' +
          '  1. ' +
          chalk.cyan('Human Friendly') +
          ': Colors, Tables, Emojis.\n' +
          '  2. ' +
          chalk.magenta('Agent Native') +
          ': Strict JSON via ' +
          chalk.bgBlack.white(' --json ') +
          '.\n' +
          '  3. ' +
          chalk.green('Schema First') +
          ': Inspect before you Query.\n' +
          '  4. ' +
          chalk.yellow('Truth') +
          ': Direct Database Access (No Admin UI lies).',
        { padding: 1, borderStyle: 'double', borderColor: 'cyan' }
      )
    );

    let keepRunning = true;

    while (keepRunning) {
      console.log(gradient.retro('\n  🎲  MAIN MENU  🎲  \n'));

      const action = await select({
        message: 'Where do you want to go today?',
        choices: [
          { name: '🔍 Explore Data (Entities)', value: 'explore' },
          { name: '🧠 Knowledge Base (RAG)', value: 'knowledge' },
          { name: '🔮 Schema Inspector', value: 'schema' },
          { name: '📡 Backend Status', value: 'status' },
          { name: '🚪 Exit', value: 'exit' },
        ],
        pageSize: 10,
      });

      try {
        if (action === 'exit') {
          console.log(chalk.dim('\nGoodbye! 👋\n'));
          keepRunning = false;
        } else if (action === 'explore') {
          await runExplore({}).catch((e) => {
            throw e;
          });
        } else if (action === 'knowledge') {
          // Default to interactive search if no args
          await runKnowledge({}).catch((e) => {
            throw e;
          });
        } else if (action === 'schema') {
          await runSchema({}).catch((e) => {
            throw e;
          });
        } else if (action === 'status') {
          await runStatus({});
        }
      } catch {
        // Catch command errors to prevent crashing the menu
        // console.error(chalk.red('\n💥 Command Failed:'), error.message);
      }
    }
  })();
}
