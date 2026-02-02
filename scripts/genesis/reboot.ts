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
  files.forEach((f) => {
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
  } catch {
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

  // 5. Canonical Pipeline (Audit -> Merge -> Seed)
  log('🧬 Running Canonical Pipeline...');
  console.log('🔄  \x1b[1m\x1b[36mRunning Seed Compiler (Building TS Seeds)...\x1b[0m');
  try {
    execSync('yarn ts-node --transpile-only src/scripts/genesis/compile-seeds.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch {
    console.error('❌ Seed Compilation failed.');
    process.exit(1);
  }

  console.log('🌱  \x1b[1m\x1b[36mRunning Canonical Seed (Ingesting to Strapi)...\x1b[0m');
  try {
    execSync('yarn ts-node --transpile-only src/scripts/genesis/canonical-seed.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch {
    console.error('❌ Canonical Pipeline failed.');
    process.exit(1);
  }

  log('✨ Genesis Reboot Successful.');
}

main();
