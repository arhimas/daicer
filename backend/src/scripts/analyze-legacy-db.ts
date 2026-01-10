import { Client } from 'pg';

const client = new Client({
  user: 'strapi',
  host: 'localhost',
  database: 'strapi',
  password: 'strapi_password',
  port: 5432,
});

async function analyze() {
  try {
    await client.connect();

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND (
          table_name ~ '^(races|classes|traits|features|proficiencies|languages|game_classes|game_races)' OR
          table_name LIKE 'character_sheets_%_lnk'
      )
      ORDER BY table_name;
    `);

    console.log(
      'Dependency Tables:',
      res.rows.map((r) => r.table_name)
    );
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

analyze();
