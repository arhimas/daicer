import minimist from 'minimist';

const Strapi = require('@strapi/strapi');

async function enableVector() {
  const args = minimist(process.argv.slice(2));

  // Start Strapi just to get DB connection
  // Strapi V5 factory pattern
  const { createStrapi } = require('@strapi/strapi');
  const app = await createStrapi({ distDir: './dist' }).load();

  try {
    console.log('Connecting to database...');
    const knex = app.db.connection;

    console.log('Attempting to enable "vector" extension...');
    await knex.raw('CREATE EXTENSION IF NOT EXISTS vector');

    console.log('✅ Success: "vector" extension enabled!');
  } catch (error) {
    console.error('❌ Failed to enable vector extension:');
    console.error(error.message);
    console.log(
      '\nHint: Check if your database user has superuser privileges or if the pgvector extension is installed on the server.'
    );
  } finally {
    app.destroy();
    process.exit(0);
  }
}

enableVector().catch(console.error);
