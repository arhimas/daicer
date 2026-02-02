import { createStrapi } from '@strapi/strapi';
import path from 'path';

async function run() {
  const backendRoot = path.resolve(__dirname, '../..');
  process.chdir(backendRoot);

  const strapi = await createStrapi({
    distDir: 'dist',
    appDir: backendRoot,
  }).load();

  try {
    const terrains = await strapi.documents('api::terrain.terrain').findMany({
      limit: 5,
      status: 'draft', // Check draft as that's what I updated
    });

    console.log('--- Inspecting Terrains ---');
    terrains.forEach((t: any) => {
      console.log(`\nName: ${t.name}, Slug: ${t.slug}, DocumentId: ${t.documentId}`);
      console.log(`Texture Type: ${typeof t.texture}`);
      if (Array.isArray(t.texture)) {
        console.log(`Texture Length: ${t.texture.length}`);
        if (t.texture.length > 0) {
          console.log('Sample Pixel:', JSON.stringify(t.texture[0]));
        }
      } else {
        console.log('Texture Value:', t.texture);
      }
    });
  } catch (error) {
    console.error(error);
  } finally {
    strapi.destroy();
  }
}

run();
