const { createStrapi } = require('@strapi/strapi');

async function main() {
  const strapi = await createStrapi().load();

  try {
    console.log('--- Debugging Spells Table ---');
    const res = await strapi.db.connection.raw('SELECT * FROM spells LIMIT 1');
    const row = res.rows ? res.rows[0] : res[0]; // knex vs pg

    if (!row) {
      // Empty table, try getting column info via information_schema
      console.log('Table empty. Querying information_schema...');
      const info = await strapi.db.connection.raw(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'spells';"
      );
      console.table(info.rows || info);
    } else {
      console.log('Columns found:', Object.keys(row));
    }

    console.log('\n--- Debugging Knowledge Sources Table ---');
    const res2 = await strapi.db.connection.raw('SELECT * FROM knowledge_sources LIMIT 1');
    const row2 = res2.rows ? res2.rows[0] : res2[0];
    if (!row2) {
      const info2 = await strapi.db.connection.raw(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'knowledge_sources';"
      );
      console.table(info2.rows || info2);
    } else {
      console.log('Knowledge Source Columns:', Object.keys(row2));
    }
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
}

main();
