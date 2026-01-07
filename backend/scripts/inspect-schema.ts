const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// DB Config (Force Postgres)
process.env.DATABASE_CLIENT = 'postgres';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'strapi';
process.env.DATABASE_USERNAME = 'strapi';
process.env.DATABASE_PASSWORD = 'strapi_password';
process.env.DATABASE_SSL = 'false';
process.env.ADMIN_JWT_SECRET = 'dummy';
process.env.APP_KEYS = 'dummy1,dummy2';
process.env.API_TOKEN_SALT = 'dummy_salt';
process.env.TRANSFER_TOKEN_SALT = 'dummy_salt';
process.env.GCS_BUCKET_NAME = 'dummy';
process.env.GCS_PUBLIC_FILES = 'false';
process.env.GCS_UNIFORM = 'false';
process.env.GCS_BASE_URL = 'https://storage.googleapis.com';

const { createStrapi } = require('@strapi/strapi');

async function inspect() {
  const backendRoot = path.resolve(__dirname, '..');
  process.chdir(backendRoot);

  const strapi = await createStrapi({ appDir: backendRoot, distDir: 'dist' }).load();

  try {
    console.log('🔍 Inspecting Tables...');
    const knex = strapi.db.connection;

    const tables = await knex.raw(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'knowledge%'"
    );
    console.log(
      'Tables:',
      tables.rows.map((r) => r.table_name)
    );

    if (tables.rows.find((r) => r.table_name === 'knowledge_snippets')) {
      console.log('\nScanning knowledge_snippets Columns:');
      const cols = await knex.raw(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'knowledge_snippets'"
      );
      console.log(cols.rows.map((r) => r.column_name));
    }

    const linkTable = tables.rows.find((r) => r.table_name.includes('links'));
    if (linkTable) {
      console.log(`\nScanning Link Table [${linkTable.table_name}]:`);
      const cols = await knex.raw(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${linkTable.table_name}'`
      );
      console.log(cols.rows.map((r) => r.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    strapi.destroy();
  }
}

inspect();
