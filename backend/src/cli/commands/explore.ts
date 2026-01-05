import { Command, Option } from 'commander';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { client } from '../utils/client';
import { discoverContentTypes } from '../utils/schema';

export const exploreCommand = new Command('explore')
  .description('Interactive explorer for Content Types')
  .option('-t, --type <uid>', 'Content Type UID (e.g. api::monster.monster)')
  .option('-a, --action <action>', 'Action to perform (find, findOne, count)')
  .option('-l, --limit <number>', 'Limit for find action (default: 10)')
  .option('-p, --page <number>', 'Page for find action (default: 1)')
  .option('-d, --document-id <id>', 'Document ID for findOne or mutation')
  .option('--json', 'Output raw JSON to stdout (no colors, no spinner) - Ideal for LLMs')
  .option('--save <path>', 'Save result to JSON file (optional)')
  .action(async (options) => {
    try {
      await runExplore(options);
    } catch (error) {
      // In JSON mode, output error as JSON
      if (options.json) {
        console.log(JSON.stringify({ error: error.message || String(error) }));
      } else {
        console.error(chalk.red('\n❌ Error:'), error);
      }
      process.exit(1);
    }
  });

interface ExploreOptions {
  type?: string;
  action?: 'find' | 'findOne' | 'count';
  limit?: string;
  page?: string;
  documentId?: string;
  json?: boolean;
  save?: string;
}

async function runExplore(options: ExploreOptions) {
  const isRaw = !!options.json;

  // Spinner logic wrapper
  const withSpinner = async <T>(text: string, fn: () => Promise<T>): Promise<T> => {
    if (isRaw) return fn();
    const spinner = ora(text).start();
    try {
      const res = await fn();
      spinner.stop();
      return res;
    } catch (e) {
      spinner.fail();
      throw e;
    }
  };

  // 1. Content Type Selection
  let selectedUid = options.type;
  let allTypes = [];

  // Discovery is fast, just do it unless we are in raw mode and trusting the input blind (but we need metadata)
  // Actually we need metadata to know plural/singular names for client
  allTypes = discoverContentTypes();

  if (!selectedUid) {
    if (isRaw) {
      throw new Error('Missing required argument: --type <uid> is required in JSON mode.');
    }

    if (allTypes.length === 0) {
      console.log(chalk.yellow('⚠️  No Content Types found in src/api. Are you in the backend root?'));
      return;
    }

    selectedUid = await select({
      message: 'Select Content Type to explore:',
      choices: allTypes.map((t) => ({
        name: `${chalk.bold(t.info.displayName)} ${chalk.dim(`(${t.uid})`)}`,
        value: t.uid,
        description: t.info.description || t.uid,
      })),
      pageSize: 15,
    });
  }

  const selectedType = allTypes.find((t) => t.uid === selectedUid);

  // Fallback if type not found locally (maybe plugin?) - Try to construct a minimal type info if forced
  const finalType = selectedType || {
    uid: selectedUid,
    kind: 'collectionType', // Assumption risk, but okay for power users
    apiName: selectedUid.split('::')[1]?.split('.')[0] || selectedUid, // Hacky parse
    info: {
      pluralName: selectedUid.split('.').pop(), // Very hacky guess: api::foo.bar -> bar
      displayName: selectedUid,
    },
  };

  if (!selectedType && !isRaw) {
    console.warn(
      chalk.yellow(`⚠️  Type ${selectedUid} not found in local discovery. Attempting to derive metadata...`)
    );
  }

  // 2. Action Selection
  let action = options.action;
  if (!action) {
    if (isRaw)
      action = 'find'; // Default for flags
    else {
      if (!isRaw) console.log(chalk.blue(`\n🔍 Exploring ${chalk.bold(finalType.info.displayName)}`));
      action = (await select({
        message: 'Choose an action:',
        choices: [
          { name: 'Find All (List entries)', value: 'find' },
          { name: 'Find One (Get by Document ID)', value: 'findOne' },
          { name: 'Count (Total entries)', value: 'count' },
        ],
      })) as any;
    }
  }

  // 3. Parameters
  let params: any = { populate: '*' }; // Always populate * for debugging/CLI
  let documentId = options.documentId;

  if (action === 'find') {
    const limit = options.limit || (isRaw ? '50' : await input({ message: 'Limit:', default: '10' }));
    const page = options.page || (isRaw ? '1' : await input({ message: 'Page:', default: '1' }));

    params = {
      ...params,
      'pagination[pageSize]': limit,
      'pagination[page]': page,
    };
  } else if (action === 'findOne') {
    if (!documentId) {
      if (isRaw) throw new Error('--document-id is required for findOne action');
      documentId = await input({ message: 'Enter Document ID:' });
    }
  }

  // 4. Execution
  let result: any;

  await withSpinner('Fetching data...', async () => {
    const resourceName =
      finalType.kind === 'singleType'
        ? selectedType
          ? selectedType.apiName
          : finalType.info.pluralName // Fallback logic is tricky.
        : finalType.info.pluralName;

    // Safe guard against pluralName being undefined if heuristic failed
    if (!resourceName) throw new Error(`Could not determine resource name for ${selectedUid}`);

    const resource: any =
      finalType.kind === 'singleType' ? client.single(resourceName) : client.collection(resourceName);

    if (finalType.kind === 'singleType') {
      result = await resource.find(params);
    } else {
      if (action === 'findOne') {
        result = await resource.findOne(documentId, params);
      } else if (action === 'count') {
        // Using generic fetch hack or find with meta
        result = await resource.find({ ...params, 'pagination[withCount]': 'true', 'pagination[pageSize]': 1 }); // Min data
        if (!isRaw && result.meta) result = result.meta.pagination.total;
      } else {
        result = await resource.find(params);
      }
    }
  });

  // 5. Output
  if (isRaw) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

    if (result && result.meta && result.meta.pagination) {
      console.log(
        chalk.dim(
          `\nPagination: Page ${result.meta.pagination.page} of ${result.meta.pagination.pageCount} (Total: ${result.meta.pagination.total})`
        )
      );
    }
  }

  // 6. Save
  if (options.save) {
    fs.writeFileSync(options.save, JSON.stringify(result, null, 2));
    if (!isRaw) console.log(chalk.green(`✅ Saved to ${options.save}`));
  } else if (!isRaw) {
    const shouldSave = await confirm({ message: 'Save result to JSON file?', default: false });
    if (shouldSave) {
      let defaultName = `cli-output/${finalType.uid}-${Date.now()}.json`;
      const filePath = await input({ message: 'File path:', default: defaultName });

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
      console.log(chalk.green(`✅ Saved to ${filePath}`));
    }
  }
}
