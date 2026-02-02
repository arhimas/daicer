// Define shapes for our UI elements to ensure type safety even with lazy imports
export interface UIHelpers {
  chalk: typeof import('chalk').default;
  boxen: typeof import('boxen').default;
  gradient: typeof import('gradient-string').default;
  ora: typeof import('ora').default;
  table: any; // cli-table3 types are tricky with lazy import, we'll keep it loose or cast later
}

class UI {
  private _tools: UIHelpers | null = null;

  /**
   * Lazy load all ESM UI dependencies.
   * This is required because we are running in a TS-Node environment that might be CJS or mixed,
   * and these libs are pure ESM.
   */
  private async getTools(): Promise<UIHelpers> {
    if (this._tools) return this._tools;

    const [chalkMod, boxenMod, gradientMod, oraMod, tableMod] = await Promise.all([
      import('chalk'),
      import('boxen'),
      import('gradient-string'),
      import('ora'),
      import('cli-table3'),
    ]);

    this._tools = {
      chalk: chalkMod.default,
      boxen: boxenMod.default,
      gradient: gradientMod.default,
      ora: oraMod.default,
      table: tableMod.default,
    };
    return this._tools;
  }

  /**
   * Display the main application header with a big gradient banner.
   */
  async welcome(title = 'DAICER CLI', subtitle = 'The Agentic Lens') {
    const { boxen, gradient, chalk } = await this.getTools();

    console.error(
      boxen(
        gradient.passion.multiline(`  🎲  ${title}  🎲  `) +
          `\n${chalk.dim('─'.repeat(title.length + 8))}\n` +
          `  ${chalk.cyan(subtitle)}  `,
        {
          padding: 1,
          borderStyle: 'double',
          borderColor: 'magenta',
          float: 'center',
          dimBorder: true,
          title: 'v0.1.0',
          titleAlignment: 'right',
        }
      )
    );
  }

  /**
   * Print a standardized section header
   */
  async header(title: string, icon = '🔹') {
    const { chalk, gradient } = await this.getTools();
    console.error(`\n${icon}  ${chalk.bold(gradient.pastel(title))}\n`);
  }

  /**
   * Print a key-value pair or small info snippet
   */
  async kv(
    key: string,
    value: string | number,
    color: 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'magenta' = 'blue'
  ) {
    const { chalk } = await this.getTools();
    console.error(`  ${chalk.dim('•')} ${chalk.bold(key)}: ${chalk[color](value)}`);
  }

  /**
   * Display a "panel" of information (boxed content)
   */
  async panel(
    content: string,
    options: { title?: string; color?: string; style?: 'classic' | 'round' | 'double' } = {}
  ) {
    const { boxen, chalk } = await this.getTools();
    console.error(
      boxen(content, {
        padding: 1,
        margin: 1,
        borderStyle: options.style || 'round',
        borderColor: (options.color as any) || 'cyan',
        title: options.title ? chalk.bold(` ${options.title} `) : undefined,
        titleAlignment: 'left',
      })
    );
  }

  /**
   * Render a rich table
   */
  async table(headers: string[], rows: (string | number)[][]) {
    const { table: Table, chalk } = await this.getTools();

    const t = new Table({
      head: headers.map((h) => chalk.bold.cyan(h)),
      style: {
        head: [],
        border: ['dim'],
      },
      chars: {
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': '',
      },
    });

    rows.forEach((r) => t.push(r));
    console.error(t.toString());
  }

  /**
   * Create a spinner task
   */
  async spinner(text: string) {
    const { ora } = await this.getTools();
    return ora({
      text,
      color: 'magenta',
      spinner: 'dots',
    }).start();
  }

  /**
   * Logging helpers
   */
  async log(msg: string) {
    console.error(msg);
  }

  async success(msg: string) {
    const { chalk } = await this.getTools();
    console.error(`${chalk.green.bold('✅ SUCCESS:')} ${msg}`);
  }

  async warn(msg: string) {
    const { chalk } = await this.getTools();
    console.error(`${chalk.yellow.bold('⚠️  WARNING:')} ${msg}`);
  }

  async error(msg: string, err?: any) {
    const { chalk } = await this.getTools();
    console.error(`${chalk.red.bold('❌ ERROR:')} ${msg}`);
    if (err) {
      if (err instanceof Error) {
        console.error(chalk.dim(err.stack || err.message));
      } else {
        console.error(chalk.dim(JSON.stringify(err)));
      }
    }
  }

  /**
   * JSON Output handler for Agent Mode
   */
  json(data: any) {
    console.log('__JSON_START__');
    console.log(JSON.stringify(data, null, 2));
    console.log('__JSON_END__');
  }

  /**
   * Access underlying tools for advanced custom rendering
   */
  async tools() {
    return this.getTools();
  }
}

export const ui = new UI();
