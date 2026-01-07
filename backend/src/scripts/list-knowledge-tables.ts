export {};
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function listKnowledgeTables() {
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    console.log('🕵️‍♂️ Listing all tables with "knowledge" in the name...');
    const res = await strapi.db.connection.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%knowledge%';
    `);

    // Also get columns for the link table if we find it
    console.table(res.rows || res);

    const tables = (res.rows || res).map((r: any) => r.table_name);

    for (const table of tables) {
      if (table.includes('link') || table.includes('_source')) {
        console.log(`\nColumns for ${table}:`);
        const cols = await strapi.db.connection.raw(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}';
             `);
        console.table(cols.rows || cols);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await strapi.destroy();
  }
}

listKnowledgeTables();
