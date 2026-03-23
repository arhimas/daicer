import { createStrapi } from '@strapi/strapi';
import { GenesisSeeder } from '@/genesis/seeder';

async function run() {
  const strapi = createStrapi({ distDir: 'dist' });
  await strapi.load();
  
  const seeder = new GenesisSeeder(strapi);
  try {
     await seeder.run();
  } catch(e) {
     console.error("OVERALL CRASH", e);
  } finally {
     await strapi.destroy();
  }
}
run();
