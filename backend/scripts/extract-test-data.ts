import fs from 'fs';
import path from 'path';
import { getStrapiClient } from './utils/strapi-client';

const OUTPUT_PATH = path.resolve(__dirname, '../src/ai/tools/game/__tests__/setup/extracted-data.json');

async function extract() {
  const client = getStrapiClient();
  console.log('Extracting Real Data for Tests...');

  try {
    // 1. Fetch Monsters (with structuredActions and features)
    console.log('Fetching Monsters...');
    const monstersRes: any = await client.collection('monsters').find({
      populate: ['structuredActions', 'features', 'stats'],
      pagination: { pageSize: 50 },
    });
    const monsters = monstersRes.data || [];
    console.log(`Found ${monsters.length} monsters.`);

    // 2. Fetch Characters (with equipment and stats)
    console.log('Fetching Characters...');
    const charactersRes: any = await client.collection('characters').find({
      populate: ['equipment', 'baseStats'],
      pagination: { pageSize: 50 },
    });
    const characters = charactersRes.data || [];
    console.log(`Found ${characters.length} characters.`);

    // 3. Format Data
    const dataset = {
      monsters: monsters.map((m: any) => ({
        documentId: m.documentId,
        name: m.name,
        hp: m.hp,
        ac: m.ac,
        stats: m.stats,
        structuredActions: m.structuredActions,
        features: m.features,
      })),
      characters: characters.map((c: any) => ({
        documentId: c.documentId,
        name: c.name,
        // Mocking HP for chars as they might rely on class/level which is complex to derive here perfectly without full engine logic
        // But we can check if they have stats
        hp: 10 + (c.baseStats?.constitution || 10),
        stats: c.baseStats,
        equipment: c.equipment,
      })),
    };

    // 4. Save
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2));
    console.log(`Data saved to ${OUTPUT_PATH}`);
  } catch (e: any) {
    console.error('Extraction Failed:', e.message);
    if (e.code === 'ECONNREFUSED') {
      console.error('Is the backend server running?');
    }
  }
}

extract();
