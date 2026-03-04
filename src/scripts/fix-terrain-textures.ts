export {};
import { createStrapi } from '@strapi/strapi';
import path from 'path';

const GRID_SIZE = 32;

async function run() {
  const backendRoot = path.resolve(__dirname, '../..');
  process.chdir(backendRoot);

  const strapi = await createStrapi({
    distDir: 'dist',
    appDir: backendRoot,
  }).load();

  console.log('✅ Strapi loaded for Texture Fix.');

  console.log('✅ Strapi loaded for Texture Fix.');

  try {
    const terrains = await strapi.documents('api::terrain.terrain').findMany({
      status: 'draft',
      // We want to fetch drafts and published. Documents API handles this but let's be safe.
      // Actually standard findMany returns published by default or drafts if configured?
      // No, let's just get everything. We might need to handle localization.
      // For now, let's assume default locale.
    });

    console.log(`Found ${terrains.length} terrains.`);

    // const createDefaultTile = ... (unused)

    // Color map based on common names if possible, else grey
    const getSensibleColor = (slug: string) => {
      if (slug.includes('grass')) return '#4caf50';
      if (slug.includes('dirt')) return '#5d4037';
      if (slug.includes('stone') || slug.includes('rock')) return '#7d7d7d';
      if (slug.includes('water') || slug.includes('river') || slug.includes('ocean')) return '#2196f3';
      if (slug.includes('sand') || slug.includes('desert')) return '#fbc02d';
      if (slug.includes('wood') || slug.includes('tree')) return '#795548';
      if (slug.includes('wall') || slug.includes('brick')) return '#555555';
      return '#888888'; // Default Grey
    };

    for (const terrain of terrains) {
      console.log(`Checking ${terrain.name} (${terrain.documentId})...`);

      let needsUpdate = false;
      const textureData = (terrain as any).texture;

      // Check if empty or invalid
      if (!textureData || (Array.isArray(textureData) && textureData.length === 0)) {
        console.log(` > Texture is empty. Filling...`);
        needsUpdate = true;
      } else {
        // Maybe it's a string "[]"?
        if (typeof textureData === 'string') {
          try {
            const parsed = JSON.parse(textureData);
            if (Array.isArray(parsed) && parsed.length === 0) needsUpdate = true;
          } catch (_e) {
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        const color = getSensibleColor(terrain.slug || terrain.name.toLowerCase());

        // Generate Flattened List
        const flattened: any[] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            flattened.push({
              x,
              y,
              z: 0,
              block: color,
            });
          }
        }

        // Update
        await strapi.documents('api::terrain.terrain').update({
          documentId: terrain.documentId,
          data: {
            spriteData: flattened,
          } as unknown as Record<string, unknown>,
          status: 'draft', // Keep it draft if it was draft? Or publish?
          // Documents API update usually keeps status unless specified?
          // Actually we should prob publish if it was published.
          // But safest is to just update. User can publish.
        });
        console.log(` > Updated with color ${color}`);
      } else {
        console.log(` > Texture valid. Skipping.`);
      }
    }
  } catch (error) {
    console.error('❌ Error during texture fix:', error);
  } finally {
    strapi.destroy();
  }
}

run();
