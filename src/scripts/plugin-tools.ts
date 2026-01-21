
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Chalk is ESM, so we strictly use dynamic import or a fallback
// We'll wrap logging to be safe
let chalk: any;

async function initChalk() {
  try {
    const m = await import('chalk');
    chalk = m.default;
  } catch (_e) {
    // Fallback if chalk fails (shouldn't if installed)
    chalk = {
      blue: { bold: (s: string) => `[INFO] ${s}` },
      cyan: (s: string) => `[Start] ${s}`,
      green: (s: string) => `[Success] ${s}`,
      red: (s: string) => `[Error] ${s}`,
      yellow: (s: string) => `[Warn] ${s}`,
    };
    // shim nested
    chalk.green.bold = (s: string) => `[DONE] ${s}`;
    chalk.blue.bold = (s: string) => `[INFO] ${s}`;
  }
}

const PLUGINS_DIR = path.join(process.cwd(), 'src', 'plugins');

function getPluginDirectories(): string[] {
  if (!fs.existsSync(PLUGINS_DIR)) {
    if (chalk) console.log(chalk.yellow('No src/plugins directory found. Skipping plugin operations.'));
    return [];
  }

  return fs.readdirSync(PLUGINS_DIR).filter((file) => {
    return fs.statSync(path.join(PLUGINS_DIR, file)).isDirectory();
  });
}

function buildPlugins() {
  const plugins = getPluginDirectories();
  if (plugins.length === 0) return;

  console.log(chalk.blue.bold(`\n📦  Building ${plugins.length} plugins...\n`));

  plugins.forEach((plugin) => {
    const pluginPath = path.join(PLUGINS_DIR, plugin);
    const packageJsonPath = path.join(pluginPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.warn(chalk.yellow(`Skipping ${plugin} (no package.json)`));
      return;
    }

    console.log(chalk.cyan(`Building ${plugin}...`));
    try {
      execSync('npm run build', {
        cwd: pluginPath,
        stdio: 'inherit',
      });
      console.log(chalk.green(`✓ ${plugin} built successfully.`));
    } catch (_error) {
      console.error(chalk.red(`✗ Failed to build ${plugin}`));
      process.exit(1);
    }
  });

  console.log(chalk.green.bold('\n✓ All plugins built.\n'));
}

async function runWatch() {
    const plugins = getPluginDirectories();
    if (plugins.length === 0) {
        console.log(chalk.yellow("No plugins to watch."));
        return;
    }

    console.log(chalk.blue.bold(`\nReflecting watchers for ${plugins.length} plugins...\n`));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { concurrently } = require('concurrently');
    
    // Only watch plugins that actually have a package.json
    const jobs = plugins
        .filter(plugin => fs.existsSync(path.join(PLUGINS_DIR, plugin, 'package.json')))
        .map(plugin => ({
            command: `npm run watch`,
            name: `plugin:${plugin}`,
            cwd: path.join(PLUGINS_DIR, plugin),
    }));

     try {
        await concurrently(jobs, {
            prefix: 'name',
            killOthers: ['failure', 'success'],
            restartTries: 3,
            prefixColors: ['magenta', 'cyan', 'yellow', 'blue'] // varied colors
        }).result;
    } catch (_e) {
        // Concurrently throws when process exits
    }
}

// --- Main ---

(async () => {
    await initChalk();
    const mode = process.argv[2];

    if (mode === 'build') {
        buildPlugins();
    } else if (mode === 'watch') {
        await runWatch();
    } else {
        console.log(chalk.red('Usage: ts-node src/scripts/plugin-tools.ts [build|watch]'));
        process.exit(1);
    }
})();
