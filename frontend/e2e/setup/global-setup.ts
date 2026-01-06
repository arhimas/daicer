import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * GLOBAL SETUP
 * ------------
 * Checks for the existence of the Golden Master Snapshot.
 * In a real CI environment, this would restore the DB.
 */

const BACKEND_DIR = path.resolve(process.cwd(), '../backend');
const SNAPSHOT_PATH = path.join(BACKEND_DIR, '.tmp/test-snapshot.sql');

async function globalSetup(config: FullConfig) {
  console.log('--- GLOBAL SETUP ---');

  if (fs.existsSync(SNAPSHOT_PATH)) {
    console.log(`✅ Found Main Snapshot: ${SNAPSHOT_PATH}`);
    console.log('ℹ️ To restore clean state, ensure `yarn workspace @daicer/backend seed:test` is run.');
  } else {
    console.warn('⚠️ No snapshot found. Run `yarn workspace @daicer/backend db:dump` to create one.');
  }
}

export default globalSetup;
