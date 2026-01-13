import { Command } from 'commander';
import fs from 'fs';
import { getStrapi, stopStrapi } from '../utils/bootstrap';
import { discoverContentTypes } from '../utils/schema';

// Types
interface ExploreOptions {
  type?: string;
  action?: 'find' | 'findOne' | 'count';
  limit?: string;
  page?: string;
  documentId?: string;
  json?: boolean;
  save?: string;
  filters?: string;
}

export const exploreCommand = new Command('explore')
  .description('Interactive explorer for Content Types')
  .option('-t, --type <uid>', 'Content Type UID (e.g. api::monster.monster)')
  .option('-a, --action <action>', 'Action to perform (find, findOne, count)')
  .option('-l, --limit <number>', 'Limit for find action (default: 10)')
  .option('-p, --page <number>', 'Page for find action (default: 1)')
  .option('-d, --document-id <id>', 'Document ID for findOne or mutation')
  .option('--json', 'Output raw JSON for Agents (Strict Envelope)')
  .option('--save <path>', 'Save result to JSON file (optional)')
  .option('--filters <json>', 'JSON string for filters (e.g. \'{"name": "foo"}\')')
  .action(async (options) => {
    try {
      await runExplore(options);
    } catch (error) {
      if (options.json) {
        console.log(
          JSON.stringify({
            meta: { success: false, error: error.message || String(error) },
            data: null,
          })
        );
      } else {
        const { default: chalk } = await import('chalk');

        console.error(chalk.red('\n❌ Error:'), (error as any).message || error);
      }
      throw error;
    }
  });

export async function runExplore(options: ExploreOptions) {
  // Lazy load UI libs
  const { default: chalk } = await import('chalk');
  const { default: ora } = await import('ora');
  const { default: boxen } = await import('boxen');
  const { default: gradient } = await import('gradient-string');
  const { default: Table } = await import('cli-table3');
  const { default: prettyjson } = await import('prettyjson');
  const { input, select } = await import('@inquirer/prompts');

  const isRaw = !!options.json;

  // --- HELPER: Spinner ---
  const withSpinner = async <T>(text: string, fn: () => Promise<T>): Promise<T> => {
    if (isRaw) return fn();
    const spinner = ora(text).start();
    try {
      const res = await fn();
      spinner.stop();
      return res;
    } catch (err) {
      spinner.fail();
      throw err;
    }
  };

  // --- 1. Selection & Setup ---
  let selectedUid = options.type;
  const allTypes = discoverContentTypes();

  if (!selectedUid) {
    if (isRaw) throw new Error('Missing required argument: --type <uid> is required in JSON mode.');

    if (allTypes.length === 0) {
      console.log(
        boxen(chalk.yellow('⚠️  No Content Types found in src/api.\nAre you in the backend root?'), {
          padding: 1,
          borderColor: 'yellow',
          borderStyle: 'classic',
        })
      );
      return;
    }

    console.log(gradient.atlas('\n  🌌  DAICER EXPLORER  🌌  \n'));

    selectedUid = await select({
      message: 'Select Content Type:',
      choices: allTypes.map((t) => ({
        name: `${chalk.bold(t.info.displayName)} ${chalk.dim(`(${t.uid})`)}`,
        value: t.uid,
        description: t.info.description || t.uid,
      })),
      pageSize: 12,
    });
  }

  const selectedType = allTypes.find((t) => t.uid === selectedUid);
  // Fallback metadata for manual UIDs (plugins, etc)
  const finalType = selectedType || {
    uid: selectedUid!,
    kind: 'collectionType',
    apiName: selectedUid!.split('::')[1]?.split('.')[0] || selectedUid,
    info: {
      pluralName: selectedUid!.split('.').pop() || 'unknown',
      displayName: selectedUid!,
    },
  };

  // --- 2. Action Logic ---
  const action = options.action;
  let currentAction = action || 'find'; // Default
  let currentPage = parseInt(options.page || '1', 10);
  const currentLimit = parseInt(options.limit || '10', 10);

  let currentFilters: any = options.filters ? JSON.parse(options.filters) : {};
  let currentDocId = options.documentId;

  // Interactive Loop (Human only)
  let keepRunning = true;

  // Initialize Strapi once
  const strapi = await withSpinner('Booting Strapi...', async () => getStrapi());

  while (keepRunning) {
    if (!isRaw && !action) {
      // If no action flag, ask user
      console.log(
        boxen(
          `${chalk.bold('Target:')} ${chalk.cyan(finalType.info.displayName)}\n` +
            `${chalk.bold('UID:')}    ${chalk.dim(finalType.uid)}`,
          { padding: { top: 0, bottom: 0, left: 1, right: 1 }, borderStyle: 'round', borderColor: 'blue' }
        )
      );

      currentAction = (await select({
        message: 'Choose an action:',
        choices: [
          { name: 'Find All (List entries)', value: 'find' },
          { name: 'Find One (Get by Document ID)', value: 'findOne' },
          { name: 'Count (Total entries)', value: 'count' },
        ],
      })) as 'find' | 'findOne' | 'count';
    }

    // Prepare Params

    let populateVal: any = '*';

    if (currentAction === 'findOne' || isRaw) {
      const { buildDeepPopulate } = await import('../utils/schema');
      const deepPop = buildDeepPopulate(finalType.uid, 2);
      populateVal = deepPop;
    }

    const params: any = {
      populate: populateVal,
    };

    if (currentAction === 'find') {
      params.start = (currentPage - 1) * currentLimit;
      params.limit = currentLimit;
      params.filters = currentFilters;
    } else if (currentAction === 'findOne') {
      params.documentId = currentDocId;
      if (!currentDocId) {
        if (isRaw) throw new Error('--document-id is required for findOne');
        currentDocId = await input({ message: 'Enter Document ID:' });
        params.documentId = currentDocId;
      }
    } else if (currentAction === 'count') {
      params.filters = currentFilters;
    }

    // Execute
    let result: unknown;
    let meta: Record<string, unknown> = {};

    await withSpinner('Executing Query...', async () => {
      // Use Strapi Document Service

      const uid = finalType.uid as any;

      if (finalType.kind === 'singleType') {
        const res = await strapi.documents(uid).findFirst(params);
        result = res;
        meta = { type: 'singleType' };
      } else {
        if (currentAction === 'findOne') {
          // findOne needs documentId as first arg in Strapi 5 beta, OR proper structure
          // strapi.documents(uid).findOne({ documentId: '...' })
          const res = await strapi.documents(uid).findOne({ documentId: params.documentId, populate: params.populate });
          result = res;
          meta = { action: 'findOne', documentId: currentDocId };
        } else if (currentAction === 'count') {
          const count = await strapi.documents(uid).count({ filters: params.filters });
          result = count;
          meta = { action: 'count' };
        } else {
          // Find Many
          const res = await strapi.documents(uid).findMany(params);
          const count = await strapi.documents(uid).count({ filters: params.filters });

          result = res;
          meta = {
            pagination: {
              page: currentPage,
              pageSize: currentLimit,
              total: count,
              pageCount: Math.ceil(count / currentLimit),
            },
          };
        }
      }
    });

    // --- 3. Render Output ---

    if (isRaw) {
      // 🤖 LLM Strict Mode
      console.log(
        JSON.stringify(
          {
            meta: {
              type: finalType.uid,
              action: currentAction,
              filters: currentFilters,
              ...meta,
            },
            data: result,
          },
          null,
          2
        )
      );
      keepRunning = false; // LLM is one-shot
    } else {
      // 🧑 Human Mode
      if (currentAction === 'count') {
        console.log(`\n${chalk.green('Total Entries:')} ${chalk.bold(result)}`);
        keepRunning = false;
      } else if (currentAction === 'findOne' || finalType.kind === 'singleType') {
        console.log('\n' + prettyjson.render(result));
        keepRunning = false;
      } else {
        // Table View for 'find'

        const data = Array.isArray(result) ? result : [result].filter(Boolean); // handle null

        if (data.length === 0) {
          console.log(chalk.yellow('\n(No results found)'));
        } else {
          // Derive headers
          const firstKey = Object.keys(data[0] || {}).filter((k) => k !== 'id' && k !== 'documentId');
          const headers = ['documentId', 'id', ...firstKey.slice(0, 3)];

          const table = new Table({
            head: headers.map((h) => chalk.cyan(h)),
            style: { head: [], border: [] },
          });

          data.forEach((row: any) => {
            const values = headers.map((h) => {
              const val = row[h];
              if (typeof val === 'object') return chalk.dim('[Obj]');
              return String(val).substring(0, 30);
            });
            table.push(values);
          });

          console.log('\n' + table.toString());

          // Pagination Info
          if (meta.pagination) {
            const p = meta.pagination as any;
            console.log(
              boxen(
                `${chalk.dim('Page')} ${chalk.bold(p.page)} ${chalk.dim('of')} ${chalk.bold(p.pageCount)}  ` +
                  `${chalk.dim('|')}  ${chalk.dim('Total:')} ${chalk.bold(p.total)}`,
                { padding: { top: 0, bottom: 0, left: 1, right: 1 }, borderStyle: 'classic', borderColor: 'gray' }
              )
            );
          }
        }

        // --- Interactive Pagination ---
        const choices = [];

        if (meta.pagination && (meta.pagination as any).page < (meta.pagination as any).pageCount) {
          choices.push({ name: 'Next Page ➡️', value: 'next' });
        }
        if (currentPage > 1) {
          choices.push({ name: 'Previous Page ⬅️', value: 'prev' });
        }
        choices.push({ name: 'Modify Filters 🔎', value: 'filter' });
        choices.push({ name: 'Show Detail (findOne) 📄', value: 'detail' });
        choices.push({ name: 'Exit', value: 'exit' });

        const nextStep = await select({
          message: 'Navigation:',
          choices,
        });

        if (nextStep === 'exit') {
          keepRunning = false;
        } else if (nextStep === 'next') {
          currentPage++;
        } else if (nextStep === 'prev') {
          currentPage--;
        } else if (nextStep === 'filter') {
          const filterStr = await input({ message: 'Enter JSON filter:', default: JSON.stringify(currentFilters) });
          try {
            currentFilters = JSON.parse(filterStr);
            currentPage = 1;
          } catch {
            console.log(chalk.red('Invalid JSON'));
          }
        } else if (nextStep === 'detail') {
          const did = await input({ message: 'Enter Document ID:' });
          currentAction = 'findOne';
          currentDocId = did;
        }
      }

      if (options.save && !keepRunning) {
        fs.writeFileSync(options.save, JSON.stringify(result, null, 2));
        console.log(chalk.green(`\n✅ Saved to ${options.save}`));
      }
    }
  }

  // Graceful Shutdown
  await stopStrapi();
}
