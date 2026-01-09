export {};
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugSchema() {
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    console.log('🕵️‍♂️ Inspecting knowledge_snippets table columns...');
    const res = await strapi.db.connection.raw(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name LIKE '%knowledge%';
    `);

    const rows = res.rows || res;
    console.table(rows);

    const links = await strapi.db.connection.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name LIKE '%knowledge_snippet%';
    `);
    console.log('All Knowledge Snippet related tables/columns:');
    console.table(links.rows || links);
  } catch (err) {
    console.error(err);
  } finally {
    await strapi.destroy();
  }
}

debugSchema();
