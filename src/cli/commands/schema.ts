import { Command } from 'commander';
import { discoverContentTypes, readAllSchemas, SchemaDefinition, SchemaAttribute } from '../utils/schema';
import { ui } from '../utils/ui';
import fs from 'fs';
import path from 'path';

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
  const { select } = await import('@inquirer/prompts');
  const { chalk } = await ui.tools();

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
        ui.json({ error: '--type <uid> is required when using --json' });
        process.exit(1);
      }

      await ui.header('Schema Explorer');

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
        ui.json(types);
        return;
      }

      await ui.header('Available Content Types');
      await ui.table(
        ['UID', 'Display Name', 'Kind'],
        types.map(t => [t.uid, t.info.displayName, `${t.info.singularName}`])
      );
      return;
    }

    if (mode === 'all') {
      result = readAllSchemas();
    } else if (mode === 'single') {
      // Use Deep Read by default for single inspection
      const { readSchemaDeep } = await import('../utils/schema'); 
      result = readSchemaDeep(options.type!, 2); // Depth 2 as requested

      if (!result) {
        if (options.json) {
          ui.json({ error: `Schema not found for UID: ${options.type}` });
        } else {
          await ui.error(`Schema not found for UID: ${options.type}`);
        }
        throw new Error('Schema not found');
      }

      // Human pretty print for single schema
      if (!options.json && !options.save) {
        await printHumanSchema(result, 0); // Start depth 0
        return;
      }
    }

    const output = JSON.stringify(result, null, 2);

    if (options.save) {
      const savePath = path.resolve(process.cwd(), options.save);
      fs.writeFileSync(savePath, output);
      if (!options.json) await ui.success(`Saved schema output to ${savePath}`);
    } else {
      if (options.json) {
        ui.json(result);
      } else {
        console.log(output);
      }
    }
  } catch (error: any) {
    if (options.json) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    } else {
      await ui.error('Error during schema inspection', error);
      throw error;
    }
  }
}

async function printHumanSchema(schema: SchemaDefinition, indentLevel = 0) {
  const { chalk } = await ui.tools();
  const pad = ' '.repeat(indentLevel * 3);

  if (indentLevel === 0) {
    await ui.panel(
        `${schema.info.description || 'No description'}\nCollection: ${schema.collectionName}`,
        { title: schema.info.displayName, style: 'round', color: 'blue' }
    );
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
      printHumanSchema((value as any).__targetSchema, indentLevel + 1);
    }

    if ((value as any).__schema) {
      printHumanSchema((value as any).__schema, indentLevel + 1);
    }
  });
  if (indentLevel === 0) console.log('');
}
