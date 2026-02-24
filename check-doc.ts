import { createStrapi } from '@strapi/strapi';

async function check() {
  const strapi = createStrapi({
    appDir: process.cwd(),
    distDir: process.cwd() + '/dist',
    autoReload: false,
    serveAdminPanel: false,
  });
  await strapi.load();
  
  try {
    const koboldSchema = await strapi.documents('api::entity.entity').findFirst({
      filters: { slug: 'kobold' },
      populate: {
        inventory: {
          populate: '*'
        },
        actions: true
      },
    });
    console.log('--- KOBOLD ENTITY ---');
    console.log(JSON.stringify(koboldSchema, null, 2));

  } catch (e) {
    console.log(e);
  }

  strapi.destroy();
  process.exit(0);
}

check();
