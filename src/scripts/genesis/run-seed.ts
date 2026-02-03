import { createStrapi } from '@strapi/strapi';
import { GenesisSeeder } from '@/genesis/seeder';
import path from 'path';

async function main() {
  const appDir = path.resolve(__dirname, '../../..');
  const strapi = await createStrapi({ appDir, distDir: 'dist' }).load();

  try {
    const seeder = new GenesisSeeder(strapi);
    await seeder.run();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
