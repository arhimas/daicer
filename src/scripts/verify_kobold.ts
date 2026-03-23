import { createStrapi } from '@strapi/strapi';

async function run() {
  const strapi = createStrapi({ distDir: 'dist' });
  await strapi.load();
  
  try {
     const kobold = await strapi.documents('api::entity.entity').findFirst({
        filters: { name: { $containsi: 'kobold' } },
        populate: ['inventory.slot', 'inventory.item']
     });
     console.log("KOBOLD RAW DB DATA:", JSON.stringify(kobold?.inventory || "Not Found", null, 2));
  } catch(e) {
     console.error(e);
  } finally {
     process.exit(0);
  }
}
run();
