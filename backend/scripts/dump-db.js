/**
 * DUMP DB
 * -------
 * Creates a SQL snapshot of the current Postgres database.
 * Uses 'pg_dump' (must be installed on system).
 *
 * Usage: yarn db:dump
 */

require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const DUMP_PATH = path.join(__dirname, '../.tmp/test-snapshot.sql');
const DIR = path.dirname(DUMP_PATH);

if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR, { recursive: true });
}

// Construct Command
// Prefer DATABASE_URL if present, else build from parts
const env = process.env;
let cmd = '';

if (env.DATABASE_URL) {
  cmd = `pg_dump "${env.DATABASE_URL}" > "${DUMP_PATH}"`;
} else {
  // Fallback to components
  const host = env.DATABASE_HOST || 'localhost';
  const port = env.DATABASE_PORT || 5432;
  const user = env.DATABASE_USERNAME || 'strapi';
  const db = env.DATABASE_NAME || 'strapi';
  const pass = env.DATABASE_PASSWORD;

  // Use PGPASSWORD env var for password to avoid interactive prompt
  cmd = `PGPASSWORD='${pass}' pg_dump -h ${host} -p ${port} -U ${user} -d ${db} > "${DUMP_PATH}"`;
}

console.log(`📦 Dumping Database to ${DUMP_PATH}...`);
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.warn(`⚠️ Dump failed (Is pg_dump installed?): ${error.message}`);
    return;
  }
  console.log(`✅ Snapshot Created: .tmp/test-snapshot.sql`);
});
