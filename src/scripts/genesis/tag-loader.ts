import { factories } from '@strapi/strapi';
import { TAG_ATOMS } from '../../genesis/seed-data/tags';

export async function loadTags(strapi: any) {
  console.log('🌱 Seeding Tags...');

  let successCount = 0;
  let errorCount = 0;

  for (const tagAtom of TAG_ATOMS) {
    try {
      const slug = tagAtom.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if tag exists
      const existing = await strapi.documents('api::tag.tag' as any).findMany({
        filters: { slug },
        limit: 1,
      });

      if (existing.length > 0) {
        // Update
        await strapi.documents('api::tag.tag' as any).update({
          documentId: existing[0].documentId,
          data: {
            name: tagAtom.name,
            type: tagAtom.type,
            color: tagAtom.color,
          },
        });
      } else {
        // Create
        await strapi.documents('api::tag.tag' as any).create({
          data: {
            name: tagAtom.name,
            slug,
            type: tagAtom.type,
            color: tagAtom.color,
          },
        });
      }
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to seed tag ${tagAtom.name}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Tags seeded: ${successCount} success, ${errorCount} errors.`);
}
