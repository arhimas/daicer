import { createStrapi } from '@strapi/strapi';
import fs from 'fs/promises';

async function dump() {
  const strapi = createStrapi({ appDir: process.cwd(), distDir: process.cwd() + '/dist', autoReload: false, serveAdminPanel: false });
  await strapi.load();
  
  const tags = await strapi.documents('api::tag.tag').findMany({ populate: '*', limit: 1000 });
  await fs.writeFile('tags-dump.json', JSON.stringify(tags, null, 2));
  console.log(`Dumped ${tags.length} tags.`);

  strapi.destroy();
  process.exit(0);
}
dump();
