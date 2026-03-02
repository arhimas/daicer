import { createStrapi } from '@strapi/strapi';
import { GenesisSeeder } from '@/genesis/seeder';
import path from 'path';
import dotenv from 'dotenv';

async function main() {
  const appDir = path.resolve(__dirname, '../../..');
  dotenv.config({ path: path.join(appDir, '.env') });
  const strapi = await createStrapi({ appDir, distDir: 'dist' }).load();

  try {
    const seeder = new GenesisSeeder(strapi);
    await seeder.run();

    await strapi.destroy();
    console.log("Strapi has been shut down");

    // Force clean exit to prevent SQLite macOS C++ mutex lock crashes
    process.exit(0);
  } catch (err) {
    console.error('[Bootstrap] Unhandled error during auto-seed:', err);
    process.exit(1);
  }
}

main();
