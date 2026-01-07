const path = require('path');
const dotenv = require('dotenv');
// 1. Load Environment Variables
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) console.error('Error loading .env:', result.error);

// Ensure Keys for Strapi (Fallbacks for script execution)
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 't0k3n_s3cr3t_s4lt_12345';
process.env.API_TOKEN_SALT = process.env.API_TOKEN_SALT || 't0k3n_s3cr3t_s4lt_12345';
process.env.APP_KEYS = process.env.APP_KEYS || 'key1,key2,key3,key4';
process.env.TRANSFER_TOKEN_SALT = process.env.TRANSFER_TOKEN_SALT || 't0k3n_s3cr3t_s4lt_12345'; // Often needed
process.env.GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'debug-dummy-bucket';
process.env.GCS_PUBLIC_FILES = process.env.GCS_PUBLIC_FILES || 'false';
process.env.GCS_UNIFORM = process.env.GCS_UNIFORM || 'false';
process.env.GCS_BASE_URL = process.env.GCS_BASE_URL || 'https://storage.googleapis.com';

// DB Config
process.env.DATABASE_CLIENT = 'postgres';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'strapi';
process.env.DATABASE_USERNAME = 'strapi';
process.env.DATABASE_PASSWORD = 'strapi_password';
process.env.DATABASE_SSL = 'false';

const { createStrapi } = require('@strapi/strapi');
const { embeddingService } = require('../src/services/embedding-service'); // direct import if possible, or via container

async function debug() {
  const backendRoot = path.resolve(__dirname, '..');
  process.chdir(backendRoot);

  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    console.log('🔍 Debugging Vectors...');

    // 1. Fetch two arbitrary entities
    const spells = await strapi.db.query('api::spell.spell').findMany({ limit: 2 });
    if (spells.length < 2) {
      console.log('Not enough spells to compare.');
    } else {
      const s1 = spells[0];
      const s2 = spells[1];

      console.log(`\nSpell 1: ${s1.name} (ID: ${s1.id})`);
      console.log(`Vector 1 [0..5]:`, s1.embedding ? s1.embedding.slice(0, 5) : 'NULL');

      console.log(`\nSpell 2: ${s2.name} (ID: ${s2.id})`);
      console.log(`Vector 2 [0..5]:`, s2.embedding ? s2.embedding.slice(0, 5) : 'NULL');

      if (JSON.stringify(s1.embedding) === JSON.stringify(s2.embedding)) {
        console.error('❌ CRITICAL: Vectors are IDENTICAL!');
      } else {
        console.log('✅ Vectors are distinct.');
      }
    }

    // 2. Test manual query
    const query = 'dwarf';
    console.log(`\n Generating Query Vector for: "${query}"...`);
    // Access service from container to ensure we use the same instance/config
    const service = strapi.plugin('semantic-search').service('vectorService');
    const embedService = require('../src/services/embedding-service').embeddingService;

    const queryVec = await embedService.generateEmbedding(query);
    console.log(`Query Vector [0..5]:`, queryVec.slice(0, 5));

    // 3. Run Raw SQL
    console.log('\nRunning Raw SQL Search...');
    const result = await strapi.db.connection.raw(
      `SELECT id, name, 1 - ((embedding::text)::vector <=> ?) as score 
         FROM spells 
         ORDER BY ((embedding::text)::vector <=> ?) ASC 
         LIMIT 3`,
      [`[${queryVec.join(',')}]`, `[${queryVec.join(',')}]`]
    );

    console.log('Raw Results:', result.rows);
  } catch (err) {
    console.error('Debug Error:', err);
  } finally {
    await strapi.destroy();
  }
}

debug();
