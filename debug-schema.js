
const { createStrapi } = require('@strapi/strapi');

async function main() {
  const strapi = await createStrapi({ distDir: 'dist' }).load();
  
  const metadata = strapi.db.metadata.get('api::knowledge-snippet.knowledge-snippet');
  console.log('--- Metadata Attributes ---');
  console.log(JSON.stringify(metadata.attributes, null, 2));

  console.log('--- Table Info ---');
  const knex = strapi.db.connection;
  const table = metadata.tableName;
  const columns = await knex(table).columnInfo();
  console.log(JSON.stringify(columns, null, 2));

  process.exit(0);
}

main();
