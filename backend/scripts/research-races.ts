import fs from 'fs';
import path from 'path';
import { client } from '../src/cli/utils/client';

// Hardcoded list based on the manual CLI exploration I did earlier
// (Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human, Tiefling, etc.)
// But better to fetch them dynamically to be sure.
// Wait, I saw 9 races in the previous CLI output:
// Assuming standard SRD: Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human, Tiefling.

async function run() {
  const results: Record<string, any> = {};

  console.log('Starting Race Research via RAG...');

  // 1. Fetch current races to get names
  const classesResponse = await client.collection('races').find({ limit: 50 });
  const raceList = Array.isArray(classesResponse) ? classesResponse : (classesResponse as any).data;

  if (!raceList || raceList.length === 0) {
    console.error('No races found in DB to research.');
    process.exit(1);
  }

  const raceNames = raceList.map((r: any) => r.name || r.attributes?.name).filter(Boolean);
  console.log(`Found ${raceNames.length} races to research:`, raceNames.join(', '));

  for (const raceName of raceNames) {
    console.log(`Querying for ${raceName}...`);
    try {
      // Query for "X race description physical appearance" to get good image prompt data
      // User feedback implies previous results were "very bad", so let's be more specific.
      const query = `${raceName} race physical appearance visual description details`;
      const endpoint = `/knowledge-snippets/search?q=${encodeURIComponent(query)}`;
      const response = await client.fetch(endpoint).then((res) => res.json());

      if (Array.isArray(response) && response.length > 0) {
        // Take top 3
        results[raceName] = response.slice(0, 3).map((r) => ({
          title: r.title,
          content: r.content,
          similarity: r.similarity,
        }));
      } else {
        results[raceName] = 'No results found';
      }
    } catch (err) {
      console.error(`Error querying ${raceName}:`, err);
      results[raceName] = { error: String(err) };
    }
  }

  const outputPath = path.join(__dirname, 'race-research-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResearch complete. Results saved to ${outputPath}`);
}

run().catch(console.error);
