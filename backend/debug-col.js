const { createStrapi } = require('@strapi/strapi');

async function main() {
  // Use dist if available, or just load to get DB connection
  const strapi = await createStrapi().load();

  try {
    console.log('--- Debugging Spells Table ---');
    const res = await strapi.db.connection.raw('SELECT * FROM spells LIMIT 1');
    const row = res.rows ? res.rows[0] : res[0];

    if (row) {
      console.log('Columns found:', Object.keys(row));
    } else {
      console.log('Row empty, checking schema info...');
      const info = await strapi.db.connection.raw(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'spells';"
      );
      console.log(info.rows || info);
    }
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
}

main();
