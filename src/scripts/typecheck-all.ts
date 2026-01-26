
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Chalk logic reused slightly modified from plugin-tools
let chalk: any;
async function initChalk() {
  try {
    const m = await import('chalk');
    chalk = m.default;
  } catch (_e) {
    chalk = {
      blue: { bold: (s: string) => `[INFO] ${s}` },
      cyan: (s: string) => `[Start] ${s}`,
      green: (s: string) => `[Success] ${s}`,
      red: (s: string) => `[Error] ${s}`,
      yellow: (s: string) => `[Warn] ${s}`,
    };
    chalk.green.bold = (s: string) => `[DONE] ${s}`;
    chalk.blue.bold = (s: string) => `[INFO] ${s}`;
  }
}

const PLUGINS_DIR = path.join(process.cwd(), 'src', 'plugins');

function getPluginDirectories(): string[] {
  if (!fs.existsSync(PLUGINS_DIR)) {
    return [];
  }
  return fs.readdirSync(PLUGINS_DIR).filter((file) => {
    return fs.statSync(path.join(PLUGINS_DIR, file)).isDirectory();
  });
}

function runCommand(command: string, cwd: string, name: string) {
    try {
        console.log(chalk.cyan(`Checking ${name}...`));
        execSync(command, { cwd, stdio: 'inherit' });
        console.log(chalk.green(`✓ ${name} passed.`));
    } catch (_e) {
        console.error(chalk.red(`✗ ${name} failed typecheck.`));
        process.exit(1);
    }
}

async function runTypecheck() {
    await initChalk();
    
    console.log(chalk.blue.bold(`\n🕵️  Starting Comprehensive Typecheck...\n`));

    // 1. Check Root
    runCommand('tsc --noEmit', process.cwd(), 'ROOT');

    // 2. Check Plugins
    const plugins = getPluginDirectories();
    for (const plugin of plugins) {
        const pluginPath = path.join(PLUGINS_DIR, plugin);
        
        // Check Plugin Server
        const serverTsConfig = path.join(pluginPath, 'server', 'tsconfig.json');
        if (fs.existsSync(serverTsConfig)) {
             runCommand('tsc -p server/tsconfig.json --noEmit', pluginPath, `${plugin} (Server)`);
        } else {
             // Fallback: Check if there is a root tsconfig in the plugin 
             const rootTsConfig = path.join(pluginPath, 'tsconfig.json');
             if (fs.existsSync(rootTsConfig)) {
                runCommand('tsc -p tsconfig.json --noEmit', pluginPath, `${plugin} (Root)`);
             }
        }

        // Check Plugin Admin
        const adminTsConfig = path.join(pluginPath, 'admin', 'tsconfig.json');
        if (fs.existsSync(adminTsConfig)) {
            runCommand('tsc -p admin/tsconfig.json --noEmit', pluginPath, `${plugin} (Admin)`);
        }
    }

    console.log(chalk.green.bold(`\n✓ All systems typechecked successfully.\n`));
}

runTypecheck();
