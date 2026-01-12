import { Client } from 'pg';

const client = new Client({
  user: 'strapi',
  host: 'localhost',
  database: 'strapi',
  password: 'strapi_password',
  port: 5432,
});

async function check() {
  try {
    await client.connect();

    // Dump actions columns
    const actionCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'actions'
        ORDER BY ordinal_position;
    `);
    console.log(
      'Action Columns:',
      actionCols.rows.map((c) => `${c.column_name} (${c.data_type})`)
    );

    // Dump spells columns
    const spellCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'spells'
        ORDER BY ordinal_position;
    `);
    console.log(
      'Spell Columns:',
      spellCols.rows.map((c) => `${c.column_name} (${c.data_type})`)
    );
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
