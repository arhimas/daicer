import { Command } from 'commander';
import { getStrapi, stopStrapi } from '../utils/bootstrap';

export const knowledgeCommand = new Command('knowledge')
  .description('RAG Knowledge Base & Snippets')
  .option('-q, --query <text>', 'Semantic search query')
  .option('-e, --entities', 'Search ONLY entities (shorthand for all entities)')
  .option('-t, --targets <items>', 'Granular targets (e.g. "spell,class,manual")')
  .option('-l, --list', 'List knowledge sources')
  .option('--json', 'Output raw JSON for Agents')
  .action(async (options) => {
    try {
      await runKnowledge(options);
    } catch (error) {
      if (options.json) {
        console.error(JSON.stringify({ meta: { success: false, error: error.message }, data: null }));
        process.exit(1);
      } else {
        const { default: chalk } = await import('chalk');

        console.error(chalk.red('\n❌ Error:'), (error as any).message || error);
        throw error;
      }
    }
  });

export async function runKnowledge(options: {
  list?: boolean;
  query?: string;
  targets?: string;
  entities?: boolean;
  json?: boolean;
}) {
  // Lazy load tools
  const { default: chalk } = await import('chalk');
  const { default: boxen } = await import('boxen');
  const { default: Table } = await import('cli-table3');
  const { input } = await import('@inquirer/prompts');

  // Boot Strapi
  const strapi = await getStrapi();

  let result: unknown;
  let meta: Record<string, unknown> = {};

  if (options.list) {
    // --- 1. LIST SOURCES ---
    // Assuming UID is api::knowledge-source.knowledge-source
    // We can try to catch error if not found
    try {
      const res = await strapi.documents('api::knowledge-source.knowledge-source' as any).findMany({ populate: '*' });
      result = res;
    } catch (e) {
      throw new Error(`Failed to list knowledge sources: ${e.message}`);
    }

    const entries = Array.isArray(result) ? result : [];

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            meta: { action: 'list', count: entries.length },
            data: entries,
          },
          null,
          2
        )
      );
      return;
    }

    console.log(chalk.bold('\n📚 Knowledge Sources:\n'));
    if (entries.length > 0) {
      const table = new Table({
        head: [chalk.cyan('Source Name'), chalk.cyan('Snippets')],
        style: { head: [], border: [] },
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      });

      entries.forEach((s: Record<string, unknown>) => {
        const name = (s.name as string) || '?';
        const snippets = s.snippets;

        const snippetCount = Array.isArray(snippets) ? snippets.length : (snippets as any)?.count || 0;
        table.push([chalk.bold(name), chalk.yellow(snippetCount)]);
      });
      console.log(table.toString());
    } else {
      console.log(chalk.dim('  (No knowledge sources found)'));
    }
    console.log('');
    return;
  }

  // --- 2. SEARCH (Query or Interactive) ---
  let query = options.query;
  const targets = options.targets ? options.targets.split(',') : undefined;

  if (!query && !options.json) {
    // Interactive Prompt
    query = await input({ message: 'Enter search query:' });
  } else if (!query && options.json) {
    throw new Error('Missing required arguments --query or --list');
  }

  // Invoke Service
  const searchService = strapi.plugin('semantic-search').service('searchService');
  if (!searchService) throw new Error('Semantic Search service (searchService) not found.');

  const searchRes = await searchService.search({
    query: query,
    targets: targets,
    limit: 10,
  });

  result = searchRes;

  // DEBUG: Log raw result to see if backend is returning anything
  if (options.json && process.env.DEBUG) {
    console.error('DEBUG RAM', JSON.stringify(result, null, 2));
  }

  // Enrich

  interface KnowledgeSearchRow {
    kind: string;
    entityUid?: string;
    documentId?: string;
    [key: string]: unknown;
  }

  const enriched = await Promise.all(
    (result as KnowledgeSearchRow[]).map(async (row) => {
      if (row.kind === 'entity' && row.entityUid && row.documentId) {
        try {
          const { buildDeepPopulate } = await import('../utils/schema');
          const deepPop = buildDeepPopulate(row.entityUid, 2);

          const fullEntity = await strapi.documents(row.entityUid as any).findOne({
            documentId: row.documentId,
            populate: deepPop,
          });

          if (fullEntity) {
            return { ...row, _fullData: fullEntity };
          }
        } catch {
          // ignore error
        }
      }
      return row;
    })
  );

  result = enriched;

  meta = {
    query,
    targets: targets || (options.entities ? ['entity'] : ['unified']),
    count: Array.isArray(result) ? result.length : 0,
  };

  if (options.json) {
    // 🤖 LLM Output
    console.log(JSON.stringify({ meta, data: result }, null, 2));
  } else {
    // 🧑 Human Output
    const title = options.entities
      ? 'Strict Entity Search'
      : targets
        ? `Targeted Search [${targets}]`
        : 'Unified Knowledge Search';

    console.log(
      boxen(`${chalk.bold(title)}\n${chalk.dim('Query:')} ${chalk.blue(query)}`, {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'magenta',
      })
    );

    if (Array.isArray(result) && result.length > 0) {
      result.forEach((row: any) => {
        const score = (row.score as number) || (row.similarity as number) || 0;
        const sim = Math.round(score * 100);
        const color = sim > 80 ? chalk.green : sim > 60 ? chalk.yellow : chalk.gray;
        const typeLabel = row.kind === 'entity' ? chalk.magenta('ENTITY') : chalk.blue('KNOWLEDGE');
        const uidLabel = row.entityUid ? chalk.cyan(`(${row.entityUid})`) : '';

        let content = (row.excerpt as string) || (row.content as string) || '';

        // Replace content with full data summary if available for Humans
        if (row._fullData) {
          const keys = Object.keys(row._fullData).filter(
            (k) => k !== 'id' && k !== 'documentId' && k !== 'createdAt' && k !== 'updatedAt' && k !== 'publishedAt'
          );
          const preview = keys
            .slice(0, 5)
            .map((k) => `${k}: ${JSON.stringify(row._fullData[k]).substring(0, 50)}`)
            .join('\n  ');
          content = `${chalk.green('⚡ Full Data Loaded')}\n  ${preview}\n  ${chalk.dim('...more data in JSON mode...')}`;
        } else {
          content = content.replace(/^\[Tags: .*?\]\s*\n?/i, '');
          if (content.length > 400) content = content.substring(0, 400) + chalk.dim('...');
        }

        const sourceLabel = row.sourceName ? `\n${chalk.dim('├─ Source:')} ${chalk.cyan(row.sourceName)}` : '';
        const snippetIdLabel = row.snippetId ? ` ${chalk.dim(`(Snippet #${row.snippetId})`)}` : '';

        console.log(
          boxen(
            `${color.bold(sim + '%')} ${chalk.bold(row.title)} [${typeLabel}] ${uidLabel}${snippetIdLabel}` +
              (row.documentId ? `\n${chalk.dim('├─ ID:')} ${chalk.white(row.documentId)}` : '') +
              sourceLabel +
              `\n\n${chalk.white(content || chalk.italic('(No preview text)'))}`,
            {
              padding: { top: 0, bottom: 0, left: 1, right: 1 },
              borderColor: sim > 80 ? 'green' : 'gray',
              borderStyle: 'single',
            }
          )
        );
      });

      // Interactive Inspection
      const { select } = await import('@inquirer/prompts');
      const { runExplore } = await import('./explore');

      const choices = (result as any[])
        .filter((r) => r.kind === 'entity' && r.entityUid && r.documentId)
        .map((r) => ({
          name: `🔍 Inspect: ${r.title} (${r.entityUid})`,
          value: r,
        }));

      if (choices.length > 0) {
        const nextAction = await select({
          message: 'Actions:',
          choices: [
            ...choices,
            { name: '↩️  Back to Search', value: 'back' },
            { name: '🚪 Exit Command', value: 'exit' },
          ],
        });

        if ((nextAction as unknown) === 'exit') return;
        if ((nextAction as unknown) !== 'back') {
          // It's a result object
          console.log(chalk.dim(`\nNavigating to ${(nextAction as any).title}...\n`));
          await runExplore({
            action: 'findOne',
            type: (nextAction as any).entityUid as string,
            documentId: (nextAction as any).documentId as string,
          });
        }
      }
    } else {
      console.log(chalk.yellow('\n  No relevant results found.\n'));
    }
  }
  
  await stopStrapi();
  process.exit(0);
}
