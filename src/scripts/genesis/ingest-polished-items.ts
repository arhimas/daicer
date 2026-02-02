import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// 1. Setup & Configuration
// ---------------------------------------------------------------------------

const POLISHED_DIR = path.join(process.cwd(), 'data/library/molecules/items/polished');
const DEST_FILE = path.join(process.cwd(), 'data/library/molecules/items/magic-items-polished-final.json');

// ---------------------------------------------------------------------------
// 2. Logic
// ---------------------------------------------------------------------------

async function ingestPolishedItems() {
  console.log(`🚀 Starting Ingestion of Polished Items...`);

  if (!fs.existsSync(POLISHED_DIR)) {
    console.error(`❌ Polished directory not found: ${POLISHED_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POLISHED_DIR).filter((f) => f.endsWith('.json'));
  console.log(`📦 Found ${files.length} polished item files.`);

  const allItems: any[] = [];

  for (const file of files) {
    const filePath = path.join(POLISHED_DIR, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allItems.push(content);
    } catch (e) {
      console.error(`⚠️ Error reading ${file}:`, e);
    }
  }

  if (allItems.length === 0) {
    console.log(`⚠️ No items to ingest.`);
    return;
  }

  console.log(`💾 Saving consolidated polished items to ${DEST_FILE}`);
  fs.writeFileSync(DEST_FILE, JSON.stringify(allItems, null, 2));

  console.log(`✅ Successfully ingested ${allItems.length} polished items.`);

  // Optional: Log names
  console.log('   Items:');
  allItems.slice(0, 10).forEach((item) => console.log(`   - ${item.formatted_name || item.name}`));
  if (allItems.length > 10) console.log(`   ... and ${allItems.length - 10} more.`);
}

ingestPolishedItems();
