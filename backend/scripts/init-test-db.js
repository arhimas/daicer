/**
 * INIT TEST DB
 * ------------
 * Connects to the default 'postgres' database and creates 'strapi_test'.
 * This bypasses CLI socket issues by using 'pg' client directly.
 */

const { Client } = require('pg');
require('dotenv').config();

async function init() {
  const config = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USERNAME || 'strapi',
    password: process.env.DATABASE_PASSWORD || 'strapi_password',
    database: 'postgres', // Connect to default DB to create others
  };

  const client = new Client(config);
  await client.connect();

  try {
    // Check if DB exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'strapi_test'");
    if (res.rowCount === 0) {
      console.log('✨ Creating "strapi_test" database...');
      await client.query('CREATE DATABASE strapi_test');
      console.log('✅ Database created.');
    } else {
      console.log('ℹ️ "strapi_test" already exists.');
    }
  } catch (err) {
    console.error('❌ Failed to init DB:', err);
  } finally {
    await client.end();
  }
}

init();
