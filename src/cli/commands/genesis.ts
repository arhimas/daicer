
import { Command } from 'commander';
import { getStrapi, stopStrapi } from '../utils/bootstrap';

export const genesisCommand = new Command('genesis')
  .description('Genesis Service: Seed and Hydrate Data')
  .argument('[param]', 'Subcommand (sync, craft) or Term relative to craft')
  .option('--type <type>', 'Type for craft/sync', 'all')
  .option('--queue', 'Run via Queue (Background)')
  .option('--save', 'Save crafted result to Vault', false)
  .action(async (param, options) => {
    try {
      await runGenesis(param, options);
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

export async function runGenesis(param: string, options: { type: string; queue?: boolean; save?: boolean }) {
  const { default: chalk } = await import('chalk');
  const { select, input, confirm } = await import('@inquirer/prompts');
  const path = await import('path');
  const fs = await import('fs');

  let action = param;
  if (!['sync', 'craft'].includes(action)) {
      // Interactive Mode
      action = await select({
          message: 'Genesis Mode:',
          choices: [
              { name: '📥 Sync Vault to Database', value: 'sync' },
              { name: '✨ Craft Entity (Generative AI)', value: 'craft' }
          ]
      });
  }

  // --- SYNC MODE ---
  if (action === 'sync') {
      console.log(chalk.bold(`\n⚛️  Genesis Sync: ${chalk.cyan(options.type)}`));
      
      const strapi = await getStrapi(); // Boot Strapi
      const { GenesisSeeder } = await import('../../genesis/seeder'); // Dynamic import to avoid type issues if strapi not loaded
      
      try {
          const seeder = new GenesisSeeder(strapi);
          await seeder.run();
          console.log(chalk.green('\n✅ Sync Complete!'));
      } finally {
          await stopStrapi();
      }
      return;
  }

  // --- CRAFT MODE ---
  if (action === 'craft') {
      let term = param && param !== 'craft' ? param : '';
      if (!term) {
          term = await input({ message: 'Enter Concept/Term (e.g. "Fireball", "Goblin"): ' });
      }
      
      let type = options.type;
      if (type === 'all' || !type) {
         type = await select({
             message: 'Entity Type:',
             choices: ['spell', 'item', 'monster', 'feat', 'trait', 'class'].map(t => ({ value: t }))
         });
      }

      console.log(chalk.bold(`\n✨ Crafting: ${chalk.cyan(term)} [${chalk.magenta(type)}]`));
      
      const strapi = await getStrapi();
      
      try {
          // 1. RAG Lookup
          const searchService = strapi.plugin('semantic-search').service('searchService');
          const contextResults = await searchService.search({
              query: term,
              limit: 5
          });
          const contextSummary = contextResults.map((r: any) => `- ${r.title}: ${r.content?.substring(0, 100)}...`).join('\n');
          
          // 2. Generate
          const geminiService = strapi.plugin('map-explorer').service('geminiService');
          
          // Resolve Schema
          let schema;
          const { Schemas } = await import('../../genesis'); // Ensure we export Schemas from index
          // We need a map. Let's do simple mapping.
          switch(type) {
              case 'spell': schema = Schemas.SpellSchema; break;
              case 'item': schema = Schemas.ItemSchema; break;
              case 'monster': schema = Schemas.EntitySchema; break;
              case 'trait': schema = Schemas.TraitSchema; break;
              case 'feat': schema = Schemas.FeatureSchema; break;
              case 'class': schema = Schemas.ClassSchema; break;
              default: throw new Error(`Unknown type: ${type}`);
          }

          console.log(chalk.yellow('   🧠 Thinking...'));
          const result = await geminiService.generateStructuredData({
              promptKey: 'genesis-architect',
              variables: {
                  term,
                  type,
                  contextData: contextSummary
              },
              schema: schema
          });

          // 3. Display
          console.log('\n' + chalk.green(JSON.stringify(result, null, 2)));

          // 4. Save
          if (options.save || await confirm({ message: 'Save to Vault?', default: true })) {
               console.log(chalk.red('   ⚠️  Auto-save not fully implemented for single-file vault. Copy the JSON above!'));
               // TODO: distinct files for vault.
          }

      } finally {
          await stopStrapi();
      }
  }
}
