import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * GLOBAL TEARDOWN
 * ---------------
 * Restores the database from backup to leave the dev environment clean.
 */

const BACKEND_DIR = path.resolve(process.cwd(), '../backend');
const DB_PATH = path.join(BACKEND_DIR, '.tmp/data.db');
const BACKUP_PATH = path.join(BACKEND_DIR, '.tmp/data.backup.db');

async function globalTeardown(config: FullConfig) {
  console.log('--- GLOBAL TEARDOWN ---');

  if (fs.existsSync(BACKUP_PATH)) {
    try {
      // Restore the backup
      fs.copyFileSync(BACKUP_PATH, DB_PATH);
      console.log(`✅ Database restored from ${BACKUP_PATH}`);

      // Cleanup backup
      fs.unlinkSync(BACKUP_PATH);
    } catch (error) {
      console.error('❌ Failed to restore database:', error);
    }
  }
}

export default globalTeardown;
