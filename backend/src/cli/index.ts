#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { exploreCommand } from './commands/explore';

const program = new Command();

program.name('daicer-cli').description('🎲 Daicer Backend CLI - Debug and Inspect your Game World').version('0.1.0');

// Register Commands
program.addCommand(exploreCommand);

program.hook('preAction', (thisCommand) => {
  console.log(chalk.bold.hex('#FFD700')(`\n🎲 Daicer Backend CLI\n`));
});

// Parse Arguments
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
