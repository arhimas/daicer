#!/usr/bin/env node
import { Command } from 'commander';
// import chalk from 'chalk';
import { exploreCommand } from './commands/explore';
import { statusCommand } from './commands/status';

const program = new Command();

program.name('daicer-cli').description('🎲 Daicer Backend CLI - Debug and Inspect your Game World').version('0.1.0');

// Register Commands
program.addCommand(exploreCommand);
program.addCommand(statusCommand);

program.hook('preAction', async (thisCommand) => {
  const { default: chalk } = await import('chalk');
  console.log(chalk.bold.hex('#FFD700')(`\n🎲 Daicer Backend CLI\n`));
});

// Parse Arguments
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
