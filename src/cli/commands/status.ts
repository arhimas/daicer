import { Command } from 'commander';
import { getStrapiUrl } from '../utils/client';
import { ui } from '../utils/ui';

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
    await fetch(rootUrl, { method: 'HEAD', timeout: 2000 } as RequestInit & { timeout?: number }).catch((e) => {
      throw e;
    });
    const duration = Date.now() - start;

    if (isRaw) {
      ui.json({ status: 'online', url: rootUrl, latency: duration });
    } else {
      await ui.welcome('DAICER BACKEND', 'Status Check');

      await ui.panel(`● ONLINE\nLatency: ${duration}ms\nURL: ${rootUrl}`, {
        title: 'CONNECTION ESTABLISHED',
        color: 'green',
        style: 'round',
      });
    }
  } catch (err: unknown) {
    const error = err as Error & { code?: string; cause?: { code?: string } };
    const isConnRefused = error.cause?.code === 'ECONNREFUSED' || error.code === 'ECONNREFUSED';

    if (isRaw) {
      ui.json({
        status: 'offline',
        error: error.message,
        hint: isConnRefused ? 'Server likely not running' : 'Unknown Error',
      });
    } else {
      await ui.panel(`💀 OFFLINE\n\nError: ${error.message}\nAction: Run 'yarn develop' in backend`, {
        title: 'CONNECTION FAILED',
        color: 'red',
        style: 'double',
      });
      //   process.exit(1);
    }
  }
}
