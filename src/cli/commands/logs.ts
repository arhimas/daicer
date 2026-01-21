
import { Command } from 'commander';

export const logsCommand = new Command('logs')
  .description('📜 View and follow application logs')
  .option('-f, --follow', 'Follow log output', false)
  .option('-l, --lines <number>', 'Number of lines to show', '100')
  .option('-r, --raw', 'Show raw JSON instead of pretty print', false)
  .action(async (options) => {
    const { default: chalk } = await import('chalk');
    const { default: boxen } = await import('boxen');
    const { spawn } = await import('child_process');
    const path = await import('path');
    
    // We assume logs are being piped or we are reading a file.
    // Since Strapi logs to stdout in container/PM2, this CLI command is more about 
    // convenient access if we had a log file.
    // However, the user request implies improving development logging visibility.
    // If the user runs `yarn dev`, logs are already in console.
    // This command might be useful if we had a log file.
    // Since we don't have a configured file transport in config/logger.ts (only console),
    // this command might be limited to just echoing "Use yarn dev to see logs".
    // BUT, the user prompt asked for "how debug and theses thoings our log is not that great ... better controll colors".
    
    // IF we want to view logs from a file, we need to ensure the logger writes to a file.
    // For now, let's assume this command explains how to view logs or tails a specific log file if it existed.
    
    // Let's make it smarter: If there is a 'logs/backend.log' (which is piped in package.json dev script), we tail it.
    
    const logFile = path.join(process.cwd(), 'logs', 'backend.log');
    
    console.log(boxen(chalk.blue.bold('  📜 LOG VIEWER  '), { padding: 1, borderStyle: 'round', borderColor: 'blue' }));
    console.log(chalk.dim(`Reading from: ${logFile}\n`));
    
    const tailArgs = ['-n', options.lines];
    if (options.follow) tailArgs.push('-f');
    tailArgs.push(logFile);
    
    const tail = spawn('tail', tailArgs);
    
    if (options.raw) {
        tail.stdout.pipe(process.stdout);
    } else {
        // Pipe to pino-pretty
        const pinoPretty = spawn('npx', ['pino-pretty', '-c', '-t', 'SYS:standard'], {
            stdio: ['pipe', 'inherit', 'inherit']
        });
        tail.stdout.pipe(pinoPretty.stdin);
    }
    
    tail.stderr.on('data', (data) => console.error(chalk.red(`tail error: ${data}`)));
  });

export const runLogs = async (options: any) => {
    // Programmatic runner if needed
};
