#!/usr/bin/env node
import { Command } from 'commander';
import { exploreCommand } from './commands/explore';
import { statusCommand } from './commands/status';
import { schemaCommand } from './commands/schema';
import { knowledgeCommand } from './commands/knowledge';
import { genesisCommand, runGenesis } from './commands/genesis';
import { compileCommand, runCompile } from './commands/compile';
import { embedCommand, runEmbed } from './commands/embed';
import { logsCommand } from './commands/logs';
import { ui } from './utils/ui';

const program = new Command();

program
  .name('daicer-cli')
  .description('🎲 Daicer Backend CLI - Debug and Inspect your Game World')
  .version('0.1.0')
  .configureOutput({
    // Custom error handling if needed, but default is usually fine
  });

// Register Commands
program.addCommand(exploreCommand);
program.addCommand(statusCommand);
program.addCommand(schemaCommand);
program.addCommand(knowledgeCommand);
program.addCommand(genesisCommand);
program.addCommand(compileCommand);
program.addCommand(embedCommand);
program.addCommand(logsCommand);

// Global Hook: Welcome Banner
// preAction is only called if an action is matched.
// We'll handle the welcome manually in the default action.

program.action(async () => {
    // Default Action: Interactive Menu
    await runInteractiveMenu();
});

// Run
(async () => {
    try {
        await program.parseAsync(process.argv);
    } catch (_err) {
        // Commander usually handles errors, but if something bubbles up:
        // console.error(err);
        process.exit(1);
    }
})();

async function runInteractiveMenu() {
    await ui.welcome();

    const { select } = await import('@inquirer/prompts');

    // Import command runners
    const { runExplore } = await import('./commands/explore');
    const { runKnowledge } = await import('./commands/knowledge');
    const { runStatus } = await import('./commands/status');
    const { runSchema } = await import('./commands/schema');

    await ui.panel(
        '1. Human Friendly: Colors, Tables, Emojis.\n' +
        '2. Agent Native: Strict JSON via --json.\n' +
        '3. Schema First: Inspect before you Query.\n' +
        '4. Truth: Direct Database Access.',
        { title: 'PHILOSOPHY OF THE DAICER CLI', style: 'double', color: 'cyan' }
    );

    let keepRunning = true;

    while (keepRunning) {
      await ui.header('MAIN MENU');

      const action = await select({
        message: 'Where do you want to go today?',
        choices: [
          { name: '🔍 Explore Data (Entities)', value: 'explore' },
          { name: '🧠 Knowledge Base (RAG)', value: 'knowledge' },
          { name: '🔮 Schema Inspector', value: 'schema' },
          { name: '📡 Backend Status', value: 'status' },
          { name: '--------------------------------', value: 'sep1', disabled: true },
          { name: '⚛️  Genesis (Seed Data)', value: 'genesis' },
          { name: '🛠️  Compile Entities', value: 'compile' },
          { name: '🧠 Re-Embed All', value: 'embed' },
          { name: '📜 Logs Viewer', value: 'logs' },
          { name: '--------------------------------', value: 'sep2', disabled: true },
          { name: '🚪 Exit', value: 'exit' },
        ],
        pageSize: 15,
      });

      try {
        if (action === 'exit') {
          await ui.log('\nGoodbye! 👋\n');
          keepRunning = false;
        } else if (action === 'explore') {
          await runExplore({});
        } else if (action === 'knowledge') {
          await runKnowledge({});
        } else if (action === 'schema') {
          await runSchema({});
        } else if (action === 'status') {
          await runStatus({});
        } else if (action === 'genesis') {
          const type = await select({
            message: 'Seed Type:',
            choices: ['atoms', 'molecules', 'compounds', 'blueprints', 'all'].map(t => ({ value: t })),
          });
          const queue = await select({
            message: 'Run via Queue?',
            choices: [{ name: 'Yes', value: true }, { name: 'No (Foreground)', value: false }],
          });
          await runGenesis(type, { queue });
        } else if (action === 'compile') {
          await runCompile({ phase: 'Atom', queue: false }); // Shortcut for menu
        } else if (action === 'embed') {
           const queue = await select({
            message: 'Run via Queue?',
            choices: [{ name: 'Yes', value: true }, { name: 'No (Foreground)', value: false }],
          });
           await runEmbed('all', { queue });
        } else if (action === 'logs') {
           await ui.warn("Please run 'yarn cli logs' directly for the interactive viewer.");
        }
      } catch (error: any) {
        // Catch command errors to prevent crashing the menu
         await ui.error('Command Failed', error);
      }
    }
}

