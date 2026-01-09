import { Command } from 'commander';
import fs from 'fs';
import { client } from '../utils/client';
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
        console.error(chalk.red('\n❌ Error:'), error);
      }
      // process.exit(1);
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
    } catch {
      spinner.fail();
      throw new Error('Spinner failed'); // or rethrow original if we captured it, but we removed catch(e) to avoid unused var?
      // Actually simpler to just use catch (err) and rethrow err.
      // Wait, 'e' is used in 'spinner.fail()' context? No.
      // If I remove 'e' from catch block: catch { ... } in newer TS.
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
    uid: selectedUid,
    kind: 'collectionType',
    apiName: selectedUid.split('::')[1]?.split('.')[0] || selectedUid,
    info: {
      pluralName: selectedUid.split('.').pop(),
      displayName: selectedUid,
    },
  };

  // --- 2. Action Logic ---
  const action = options.action;
  let currentAction = action || 'find'; // Default
  let currentPage = parseInt(options.page || '1', 10);
  const currentLimit = parseInt(options.limit || '10', 10);
  let currentFilters = options.filters ? JSON.parse(options.filters) : {};
  let currentDocId = options.documentId;

  // Interactive Loop (Human only)
  let keepRunning = true;

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
    const params: Record<string, unknown> = { populate: '*' };
    if (currentAction === 'find') {
      params['pagination[pageSize]'] = currentLimit;
      params['pagination[page]'] = currentPage;
      params.filters = currentFilters;
    } else if (currentAction === 'findOne') {
      if (!currentDocId && isRaw) throw new Error('--document-id is required for findOne');
      if (!currentDocId) currentDocId = await input({ message: 'Enter Document ID:' });
    }

    // Execute
    let result: unknown;
    let meta: Record<string, unknown> = {};

    await withSpinner('Executing Query...', async () => {
      const resourceName =
        finalType.kind === 'singleType'
          ? selectedType?.apiName || finalType.info.pluralName
          : finalType.info.pluralName;

      if (!resourceName) throw new Error(`Could not determine resource name for ${selectedUid}`);

      const resource = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (finalType.kind === 'singleType' ? client.single(resourceName) : client.collection(resourceName)) as any;

      if (finalType.kind === 'singleType') {
        result = await resource.find(params);
        meta = { type: 'singleType' };
      } else {
        if (currentAction === 'findOne') {
          result = await resource.findOne(currentDocId, params);
          meta = { action: 'findOne', documentId: currentDocId };
        } else if (currentAction === 'count') {
          // Optimization: standard find with limit 1 and withCount
          const countRes = await resource.find({
            ...params,
            'pagination[withCount]': 'true',
            'pagination[pageSize]': 1,
          }); // Min data
          result = countRes.meta?.pagination?.total || 0;
          meta = { action: 'count' };
        } else {
          const findRes = await resource.find(params);
          // Standardize Strapi V5 response
          // Strapi Client often unwraps .data, but sometimes not depending on usage.
          // Adjust based on observation: @strapi/client usually returns { data: [], meta: {} } OR just []
          // We normalize to ensure we have data/meta split.
          if (Array.isArray(findRes)) {
            result = findRes;
            meta = {
              pagination: { page: currentPage, pageSize: currentLimit, total: 'unknown' },
            };
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result = (findRes as any).data || findRes;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            meta = (findRes as any).meta || {};
          }
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
        // Pretty Print Single Item
        console.log('\n' + prettyjson.render(result));
        keepRunning = false;
      } else {
        // Table View for 'find'
        const data = Array.isArray(result) ? result : [result];

        if (data.length === 0) {
          console.log(chalk.yellow('\n(No results found)'));
        } else {
          // Derive headers from first item (limit to first 5 keys to fit screen)
          const firstKey = Object.keys(data[0] || {}).filter((k) => k !== 'id' && k !== 'documentId');
          const headers = ['documentId', 'id', ...firstKey.slice(0, 3)];

          const table = new Table({
            head: headers.map((h) => chalk.cyan(h)),
            style: { head: [], border: [] }, // minimal style
          });

          data.forEach((row: Record<string, unknown>) => {
            const values = headers.map((h) => {
              const val = row[h];
              if (typeof val === 'object') return chalk.dim('[Obj]');
              return String(val).substring(0, 30); // Truncate
            });
            table.push(values);
          });

          console.log('\n' + table.toString());

          // Pagination Info
          if (meta.pagination) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            currentPage = 1; // Reset to page 1 on new filter
          } catch {
            console.log(chalk.red('Invalid JSON'));
          }
        } else if (nextStep === 'detail') {
          const did = await input({ message: 'Enter Document ID:' });
          currentAction = 'findOne';
          currentDocId = did;
        }
      }

      // Handle --save if requested (and only at the end or on demand? For now, standard save logic)
      if (options.save && !keepRunning) {
        fs.writeFileSync(options.save, JSON.stringify(result, null, 2));
        console.log(chalk.green(`\n✅ Saved to ${options.save}`));
      }
    }
  }
}
