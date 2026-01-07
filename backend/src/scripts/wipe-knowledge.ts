/**
 * Wipe Knowledge Script
 *
 * USE WITH CAUTION.
 * deletes all knowledge-source and knowledge-snippet entries.
 */
import { factories } from '@strapi/strapi';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { createStrapi } = require('@strapi/strapi');

async function wipe() {
  const strapi = await createStrapi({
    distDir: './dist',
  }).load();

  console.log('🚨 Wiping Knowledge Base...');

  try {
    // 1. Delete Snippets
    console.log('Deleting Snippets...');
    const snippets = await strapi.db.query('api::knowledge-snippet.knowledge-snippet').deleteMany({
      where: { id: { $gt: 0 } }, // Delete all
    });
    console.log(`Deleted ${snippets.count} snippets.`);

    // 2. Delete Sources
    console.log('Deleting Sources...');
    const sources = await strapi.db.query('api::knowledge-source.knowledge-source').deleteMany({
      where: { id: { $gt: 0 } },
    });
    console.log(`Deleted ${sources.count} sources.`);

    console.log('✅ Knowledge Base Wiped Successfully.');
  } catch (err) {
    console.error('Action Failed:', err);
  }

  process.exit(0);
}

wipe();
