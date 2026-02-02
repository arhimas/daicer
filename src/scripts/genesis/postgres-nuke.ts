import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

async function nuke() {
  console.log('☢️  \x1b[1m\x1b[31mSTARTING NUCLEAR DATABASE RESET...\x1b[0m');

  if (!config.database) {
    console.error('❌ DATABASE_NAME not found in .env');
    process.exit(1);
  }

  const client = new Client(config);

  try {
    await client.connect();
    console.log(`🔌 Connected to ${config.database} on ${config.host}`);

    // The Nuclear Option: Drop Schema Cascade
    console.log('💣 Dropping Schema public CASCADE...');
    await client.query('DROP SCHEMA public CASCADE');

    console.log('🏗️  Recreating Schema public...');
    await client.query('CREATE SCHEMA public');

    console.log('🔌 Enabling pgvector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');

    console.log('✨ \x1b[32mDatabase Nuked & Reprovisioned Successfully.\x1b[0m');
  } catch (err: any) {
    console.error('❌ Nuke Failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

nuke();
