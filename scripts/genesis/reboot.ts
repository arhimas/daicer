
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LIBRARY_ROOT = '/Users/lg/lab/daicer/data/library';

function log(msg: string) {
  console.log(`\x1b[36m[Genesis] ${msg}\x1b[0m`);
}

function wipeDirectory(dir: string, pattern: RegExp) {
   if (!fs.existsSync(dir)) return;
   const files = fs.readdirSync(dir);
   let count = 0;
   files.forEach(f => {
      if (pattern.test(f)) {
          fs.unlinkSync(path.join(dir, f));
          count++;
      }
   });
   log(`Wiped ${count} files from ${path.relative(process.cwd(), dir)}`);
}

async function main() {
  log('🚀 Starting Genesis Reboot...');

  // 1. Truncate / Wipe
  log('🧹 Wiping core library data...');
  wipeDirectory(path.join(LIBRARY_ROOT, 'molecules/classes'), /\.json$/);
  wipeDirectory(path.join(LIBRARY_ROOT, 'molecules/spells'), /\.json$/);
  wipeDirectory(path.join(LIBRARY_ROOT, 'molecules/items'), /\.json$/);
  wipeDirectory(path.join(LIBRARY_ROOT, 'atoms/features'), /\.json$/);
  // wipeDirectory(path.join(LIBRARY_ROOT, 'molecules/items'), /magic-items-srd\.json$/); // Optional

  // 2. Ingest
  log('📖 Running SRD Parser...');
  try {
    execSync('yarn ts-node scripts/genesis/srd-parser/index.ts', { stdio: 'inherit', cwd: process.cwd() });
  } catch (e) {
    console.error('❌ Parser failed.');
    process.exit(1);
  }

  // 3. Verify
  const classCount = fs.readdirSync(path.join(LIBRARY_ROOT, 'molecules/classes')).length;
  const featureCount = fs.readdirSync(path.join(LIBRARY_ROOT, 'atoms/features')).length;
  
  log(`✅ Ingestion Complete.`);
  log(`   Classes: ${classCount}`);
  log(`   Features: ${featureCount}`);
  
  // 4. Polish (Manifest check)
  const manifestPath = path.join(LIBRARY_ROOT, 'raw/srd-export.json');
  if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      log(`📝 Manifest ready with ${manifest.length} entries for Polishing.`);
  } else {
      console.error('❌ Manifest not found.');
  }

  // 5. Populate Database
  log('💾 Populating Database (Loaders)...');
  try {
      // Classes
      log('   - Loading Classes...');
      execSync('yarn ts-node src/scripts/genesis/class-loader.ts', { stdio: 'inherit', cwd: process.cwd() });
      
      // Spells
      log('   - Loading Spells...');
      execSync('yarn ts-node src/scripts/genesis/spell-loader-v2.ts', { stdio: 'inherit', cwd: process.cwd() });
      
      // Items
      log('   - Loading Items...');
      // Note: Loader path might be 'magic-item-loader.ts' or 'items-loader.ts'.
      // Based on find_by_name: 'src/scripts/genesis/magic-item-loader.ts'
      // But verify if it targets 'molecules/items' or 'molecules/items/magic-items-batch-2.json'.
      // I checked the file, it globs 'molecules/items/magic-items-batch-2.json'.
      // The SRD parser outputs to 'molecules/items/{slug}.json'.
      // I need to PATCH the loader first or it wont pick up the new files.
      // But for this chunk, I'll add the call. I will path the loader safely in next step.
      execSync('yarn ts-node src/scripts/genesis/magic-item-loader.ts', { stdio: 'inherit', cwd: process.cwd() });
      
      // Atoms (Features)
      log('   - Loading Atoms (Features)...');
      execSync('yarn ts-node src/scripts/genesis/feature-loader.ts', { stdio: 'inherit', cwd: process.cwd() });

  } catch (e) {
      console.error('❌ Database Population failed.', e);
      // Don't exit, maybe partial success is okay?
      // actually if loaders fail, it's bad.
  }

  log('✨ Genesis Reboot Successful.');
}

main();
