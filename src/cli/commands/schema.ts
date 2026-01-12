import { Command } from 'commander';
import { discoverContentTypes, readAllSchemas, SchemaDefinition, SchemaAttribute } from '../utils/schema';
import fs from 'fs';
import path from 'path';

// Helper for dynamic imports avoids top-level await issues in some environments
async function getInteractiveTools() {
  const { default: chalk } = await import('chalk');
  const { select } = await import('@inquirer/prompts');
  return { chalk, select };
}

export const schemaCommand = new Command('schema')
  .description('Inspect Content Type Schemas')
  .option('-t, --type <uid>', 'Content Type UID (e.g. api::monster.monster)')
  .option('-a, --all', 'Dump all available schemas as a map')
  .option('-l, --list', 'List available Content Types')
  .option('--json', 'Output raw JSON (Agent Mode)')
  .option('--save <path>', 'Save output to file')
  .action(async (options) => {
    await runSchema(options);
  });

export async function runSchema(options: {
  list?: boolean;
  all?: boolean;
  type?: string;
  json?: boolean;
  save?: string;
}) {
  const { chalk, select } = await getInteractiveTools();

  try {
    let result: SchemaDefinition | Record<string, SchemaDefinition> | undefined;
    let mode: 'list' | 'all' | 'single' = 'single';

    // 1. Determine Mode & Inputs
    if (options.list) mode = 'list';
    else if (options.all) mode = 'all';
    else if (options.type) mode = 'single';
    else {
      // Interactive Mode (Human)
      if (options.json) {
        console.error(JSON.stringify({ error: '--type <uid> is required when using --json' }));
        process.exit(1);
      }

      console.log(chalk.bold.hex('#FFD700')('\n🔮 Schema Explorer\n'));

      const types = discoverContentTypes();
      const selectedUid = await select({
        message: 'Select Content Type to inspect:',
        choices: types.map((t) => ({
          name: `${chalk.bold(t.info.displayName)} ${chalk.dim(`(${t.uid})`)}`,
          value: t.uid,
          description: t.info.description,
        })),
        pageSize: 15,
      });

      options.type = selectedUid;
      mode = 'single';
    }

    // 2. Execute Logic
    if (mode === 'list') {
      const types = discoverContentTypes();
      if (options.json) {
        console.log(JSON.stringify(types, null, 2));
        return;
      }

      console.log(chalk.bold('\n📦 Available Content Types:\n'));
      types.forEach((t) => {
        console.log(`  • ${chalk.cyan(t.uid)}`);
        console.log(`    ${chalk.dim(t.info.displayName)} - ${t.info.singularName}/${t.info.pluralName}`);
      });
      console.log('');
      return;
    }

    if (mode === 'all') {
      result = readAllSchemas();
    } else if (mode === 'single') {
      // Use Deep Read by default for single inspection
      const { readSchemaDeep } = await import('../utils/schema'); // dynamic import or just standard import at top if possible
      result = readSchemaDeep(options.type!, 2); // Depth 2 as requested

      if (!result) {
        if (options.json) {
          console.error(JSON.stringify({ error: `Schema not found for UID: ${options.type}` }));
        } else {
          console.error(chalk.red(`\n❌ Schema not found for UID: ${options.type}\n`));
        }
        throw new Error('Schema not found');
      }

      // Human pretty print for single schema
      if (!options.json && !options.save) {
        printHumanSchema(result, chalk, 0); // Start depth 0
        return;
      }
    }

    const output = JSON.stringify(result, null, 2);

    if (options.save) {
      const savePath = path.resolve(process.cwd(), options.save);
      fs.writeFileSync(savePath, output);
      if (!options.json) console.log(chalk.green(`\n✅ Saved schema output to ${savePath}\n`));
    } else {
      console.log(output);
    }
  } catch (error) {
    if (options.json) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    } else {
      console.error(chalk.red('\n❌ Error:'), error);
      throw error;
    }
  }
}

function printHumanSchema(schema: SchemaDefinition, _chalk: unknown, indentLevel = 0) {
  const chalk = _chalk as typeof import('chalk').default;
  const pad = ' '.repeat(indentLevel * 3);

  if (indentLevel === 0) {
    console.log(chalk.bold(`\n📄 Schema: ${chalk.cyan(schema.info.displayName)}\n`));
    console.log(`   ${chalk.dim(schema.info.description || 'No description')}`);
    console.log(`   ${chalk.dim('Collection Name:')} ${schema.collectionName}\n`);
    console.log(chalk.bold('   Attributes:'));
  } else {
    console.log(
      `${pad} ${chalk.dim('↳')} ${chalk.bold(schema.info.displayName)} ${chalk.dim(`(${schema.collectionName || 'component'})`)}`
    );
  }

  Object.entries(schema.attributes).forEach(([key, value]) => {
    let typeStr = chalk.yellow(value.type);

    if (value.type === 'relation') {
      typeStr = `${chalk.magenta('relation')} -> ${value.target}`;
      // Check for deep schema
      if ((value as SchemaAttribute).__targetSchema) {
        // Info indicator
      }
    } else if (value.type === 'component') {
      typeStr = `${chalk.blue('component')} <${value.component}> ${value.repeatable ? '(args)' : ''}`;
    }

    const required = value.required ? chalk.red('*') : ' ';
    console.log(`${pad}   ${required} ${chalk.green(key.padEnd(20))} ${typeStr}`);

     
    if ((value as any).__targetSchema) {
       
      printHumanSchema((value as any).__targetSchema, chalk, indentLevel + 1);
    }
     
    if ((value as any).__schema) {
       
      printHumanSchema((value as any).__schema, chalk, indentLevel + 1);
    }
  });
  if (indentLevel === 0) console.log('');
}
