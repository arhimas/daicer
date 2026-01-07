import { Command } from 'commander';
import { client } from '../utils/client';

const TARGET_ALIASES = {
  spell: 'api::spell.spell',
  monster: 'api::monster.monster',
  class: 'api::class.class',
  race: 'api::race.race',
  character: 'api::character.character',
};

export const knowledgeCommand = new Command('knowledge')
  .description('RAG Knowledge Base & Snippets')
  .option('-q, --query <text>', 'Semantic search query')
  .option('-e, --entities', 'Search ONLY entities (shorthand for all entities)')
  .option('-t, --targets <items>', 'Granular targets (e.g. "spell,class,manual")')
  .option('-l, --list', 'List knowledge sources')
  .option('--json', 'Output raw JSON for Agents')
  .action(async (options) => {
    await runKnowledge(options);
  });

export async function runKnowledge(options: any) {
  // Lazy load tools
  const { default: chalk } = await import('chalk');
  const { default: boxen } = await import('boxen');
  const { default: Table } = await import('cli-table3');
  const { input } = await import('@inquirer/prompts');

  try {
    let result: any;
    let meta: any = {};

    if (options.list) {
      // --- 1. LIST SOURCES ---
      result = await client.collection('knowledge-sources').find({ populate: '*' });
      // Normalize
      const entries = Array.isArray(result) ? result : result.data || [];

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

        entries.forEach((s: any) => {
          const name = s.name || s.attributes?.name;
          const snippets = s.snippets || s.attributes?.snippets;
          const snippetCount = Array.isArray(snippets) ? snippets.length : snippets?.data?.length || 0;
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
    let targets = options.targets ? options.targets.split(',') : undefined;

    if (!query && !options.json) {
      // Interactive Prompt
      query = await input({ message: 'Enter search query:' });
    } else if (!query && options.json) {
      throw new Error('Missing required arguments --query or --list');
    }

    const endpoint = '/semantic-search/search';
    result = await client
      .fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          query: query,
          targets: targets,
          limit: 10,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      .then((res) => res.json());

    // Normalize Result
    result = result.data || [];
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
        // Render Results
        result.forEach((row: any) => {
          const score = row.score || row.similarity || 0;
          const sim = Math.round(score * 100);
          const color = sim > 80 ? chalk.green : sim > 60 ? chalk.yellow : chalk.gray;
          const typeLabel = row.kind === 'entity' ? chalk.magenta('ENTITY') : chalk.blue('KNOWLEDGE');
          const uidLabel = row.entityUid ? chalk.cyan(`(${row.entityUid})`) : '';

          let content = row.excerpt || row.content || '';
          // Clean up context tags "[Tags: foo, bar]"
          content = content.replace(/^\[Tags: .*?\]\s*\n?/i, '');
          // Truncate cleanly if too long
          if (content.length > 400) content = content.substring(0, 400) + chalk.dim('...');

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

        const choices = result
          .filter((r: any) => r.kind === 'entity' && r.entityUid && r.documentId) // Only inspectable entities
          .map((r: any) => ({
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

          if (nextAction === 'exit') return;
          if (nextAction !== 'back') {
            // It's a result object
            console.log(chalk.dim(`\nNavigating to ${nextAction.title}...\n`));
            await runExplore({
              action: 'findOne',
              type: nextAction.entityUid,
              documentId: nextAction.documentId,
            });
          }
        }
      } else {
        console.log(chalk.yellow('\n  No relevant results found.\n'));
      }
    }
  } catch (error) {
    if (options.json) {
      console.error(JSON.stringify({ meta: { success: false, error: error.message }, data: null }));
      // If JSON mode, we probably want to exit, but if interactive loop, we want to return.
      // Assuming JSON mode is one-shot.
      process.exit(1);
    } else {
      console.error(chalk.red('\n❌ Error:'), error);
      // Throwing so the menu loop can catch it (if interactive)
      // usage: await runKnowledge(opts).catch(...)
      throw error;
    }
  }
}
