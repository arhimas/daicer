import fs from 'fs';
import path from 'path';
import { client } from '../src/cli/utils/client';

const CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

async function run() {
  const results: Record<string, any> = {};

  console.log('Starting Class Research...');

  for (const className of CLASSES) {
    console.log(`Querying for ${className}...`);
    try {
      // Query for "X class description hit die" to get relevant snippets
      const query = `${className} class description hit die`;
      const endpoint = `/knowledge-snippets/search?q=${encodeURIComponent(query)}`;
      const response = await client.fetch(endpoint).then((res) => res.json());

      if (Array.isArray(response) && response.length > 0) {
        // Take the top 3 snippets to ensure we get the info
        results[className] = response.slice(0, 3).map((r) => ({
          title: r.title,
          content: r.content,
          similarity: r.similarity,
        }));
      } else {
        results[className] = 'No results found';
      }
    } catch (err) {
      console.error(`Error querying ${className}:`, err);
      results[className] = { error: String(err) };
    }
  }

  const outputPath = path.join(__dirname, 'class-research-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResearch complete. Results saved to ${outputPath}`);
}

run().catch(console.error);
