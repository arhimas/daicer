import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';

import { runSpells } from './modules/processors/spells';
import { runMonsters } from './modules/processors/monsters';
import { runClasses } from './modules/processors/classes';
import { runItems } from './modules/processors/items';

const run = async () => {
  console.log(
    boxen(
      gradient.passion('  🎲  DAICER ENRICHMENT ENGINE  🎲  ') + `\n${chalk.dim('  Powered by Gemini 3.0 Flash  ')}`,
      { padding: 1, borderStyle: 'classic', borderColor: 'magenta', float: 'center' }
    )
  );

  const args = process.argv.slice(2);
  const target = args.find((arg) => arg.startsWith('--target='))?.split('=')[1] || 'all';
  const limitArg = args.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
  const limit = limitArg ? parseInt(limitArg, 10) : 5000;
  const isDryRun = args.includes('--dry-run');

  if (isDryRun) console.log(chalk.yellow.bold('🚧 DRY RUN MODE ACTIVE - No changes will be written to DB 🚧\n'));

  try {
    if (target === 'all' || target === 'spells') await runSpells(limit, isDryRun);
    if (target === 'all' || target === 'monsters') await runMonsters(limit, isDryRun);
    if (target === 'all' || target === 'classes') await runClasses(limit, isDryRun);
    if (target === 'all' || target === 'equipment' || target === 'magic-items') await runItems(target, limit, isDryRun);

    console.log(chalk.green.bold('\n✨ All Requested Enrichments Complete! ✨'));
  } catch (err: any) {
    console.error(chalk.red.bold('🔥 Fatal Error during execution:'), err);
    process.exit(1);
  }
};

run();
