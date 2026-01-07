import { Command } from 'commander';
import { getStrapiUrl } from '../utils/client';
// Dynamic imports moved inside action for performance/lazy-loading

export const statusCommand = new Command('status')
  .description('Check the connection status of the Strapi Backend')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    await runStatus(options);
  });

export async function runStatus(options: { json?: boolean }) {
  const isRaw = !!options.json;
  const url = getStrapiUrl();
  const rootUrl = url.replace(/\/api\/?$/, '');

  try {
    const start = Date.now();
    await fetch(rootUrl, { method: 'HEAD', timeout: 2000 } as any).catch((e) => {
      throw e;
    });
    const duration = Date.now() - start;

    if (isRaw) {
      console.log(JSON.stringify({ status: 'online', url: rootUrl, latency: duration }));
    } else {
      const { default: chalk } = await import('chalk');
      const { default: boxen } = await import('boxen');
      const { default: gradient } = await import('gradient-string');

      console.log(
        boxen(
          gradient.pastel(`  🎲  DAICER BACKEND  🎲  `) +
            `\n\n` +
            `${chalk.green.bold('  ●  ONLINE')}   ${chalk.dim(duration + 'ms')}\n` +
            `${chalk.dim('  🔗  ' + rootUrl)}`,
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
            float: 'center',
          }
        )
      );
    }
  } catch (error: any) {
    const isConnRefused = error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED';

    if (isRaw) {
      console.log(
        JSON.stringify({
          status: 'offline',
          error: error.message,
          hint: isConnRefused ? 'Server likely not running' : 'Unknown Error',
        })
      );
    } else {
      const { default: chalk } = await import('chalk');
      const { default: boxen } = await import('boxen');

      console.log(
        boxen(
          chalk.red.bold(`  💀  DAICER BACKEND OFFLINE  💀  `) +
            `\n\n` +
            `${chalk.yellow('  ⚠️  CONNECTION REFUSED')}\n` +
            `${chalk.dim('  Action: Run ')}${chalk.cyan.bold('yarn develop')}${chalk.dim(' in backend')}`,
          {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'red',
            float: 'center',
          }
        )
      );
      // Do not exit, just throw?
      // Actually for status, maybe we just return?
      // If we throw, the menu will catch it and show error.
      // But status "offline" is technically a valid result for the check.
      // Users might want to go back to menu.
      // So we just return.
      // process.exit(1);
    }
  }
}
