import { createStrapi } from '@strapi/strapi';

async function test() {
  const strapi = createStrapi({
    appDir: process.cwd(),
    distDir: process.cwd() + '/dist',
    autoReload: false,
    serveAdminPanel: false,
  });
  await strapi.load();
  
  try {
    const data = {
      slug: 'monk',
      name: 'Monk',
      type: 'mechanic',
      description: 'Test monk tag',
      color: '#000000'
    };
    const created = await strapi.documents('api::tag.tag').create({ data });
    console.log(`Successfully created: ${created.documentId}`);

    const verify = await strapi.documents('api::tag.tag').findOne({ documentId: created.documentId });
    console.log(`Verified lookup: ${verify?.slug}`);
  } catch (e) {
    console.error('CREATE ERROR:', e);
  }

  strapi.destroy();
  process.exit(0);
}
test();
