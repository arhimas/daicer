// Scripts usually run in context of Strapi.
// Usage: yarn strap script scripts/rebuild-active-states.ts or similar custom runner.
// Daicer has standalone scripts support.

import { Strapi } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Strapi }) => {
  strapi.log.info('🚀 Starting Active State Backfill...');

  const sheets = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
    fields: ['documentId', 'name'],
  });

  strapi.log.info(`Found ${sheets.length} sheets to process.`);

  let success = 0;
  let fail = 0;

  for (const sheet of sheets) {
    try {
      strapi.log.debug(`Processing ${sheet.name} (${sheet.documentId})...`);
      await strapi.service('api::game.active-state-service').deriveAndPersist(sheet.documentId);
      success++;
    } catch (e) {
      strapi.log.error(`Failed to process ${sheet.name}: ${(e as Error).message}`);
      fail++;
    }
  }

  strapi.log.info(`✅ Backfill Complete. Success: ${success}, Fail: ${fail}`);
};
