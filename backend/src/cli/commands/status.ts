import { Command } from 'commander';
// import chalk from 'chalk';
import fetch from 'node-fetch'; // Standard fetch might be available in node 20 without import, but using what we have.
// Actually, backend uses node 20, fetch is native. We can use global fetch.
import { getStrapiUrl } from '../utils/client';

export const statusCommand = new Command('status')
  .description('Check the connection status of the Strapi Backend')
  .option('--json', 'Output raw JSON')
  .action(async function runStatus(options: { json?: boolean }) {
    const { default: chalk } = await import('chalk');
    const isRaw = !!options.json;
    const url = getStrapiUrl();

    try {
      // Strapi usually has a /_health or we just check /api/users-permissions/roles which is often publicish or returns 403 (which means UP).
      // Let's try root URL or parsed URL.
      // STRAPI_URL usually includes /api. Let's strip it to hit root.
      const rootUrl = url.replace(/\/api\/?$/, '');

      const start = Date.now();
      const res = await fetch(rootUrl, { method: 'HEAD', timeout: 2000 } as any).catch((e) => {
        throw e;
      });
      const duration = Date.now() - start;

      if (isRaw) {
        console.log(JSON.stringify({ status: 'online', url: rootUrl, latency: duration }));
      } else {
        console.log(`\n${chalk.green.bold('✅  Daicer Backend is ONLINE')}`);
        console.log(`${chalk.dim('URL:')} ${rootUrl}`);
        console.log(`${chalk.dim('Latency:')} ${duration}ms\n`);
      }
    } catch (error: any) {
      // Check for connection refused
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
        console.log(`\n${chalk.red.bold('❌  Daicer Backend is OFFLINE')}`);

        if (isConnRefused) {
          console.log(chalk.yellow('\n⚠️  CONNECTION REFUSED'));
          console.log(chalk.white('The CLI cannot connect to the backend server.'));
          console.log(chalk.bold('\n👉 Action Required:'));
          console.log(
            `Run ${chalk.cyan('yarn develop')} in the ${chalk.bold('backend')} workspace to start the server.`
          );
        } else {
          console.error(chalk.red('\nError Details:'), error.message);
        }
        console.log(''); // Newline
        process.exit(1);
      }
    }
  });
