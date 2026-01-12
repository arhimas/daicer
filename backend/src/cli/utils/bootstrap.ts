
import { createStrapi, Strapi } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getStrapi(): Promise<any> {
  if (instance) return instance;
  if (global.strapi) {
    instance = global.strapi;
    return instance;
  }

  // Check if we are checking for dist existence
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.warn('⚠️  [CLI] dist/ directory not found. Strapi might fail to load if not built.');
    console.warn('   Please run "yarn build" once if you encounter errors.');
  }

  console.log('⏳ Booting Headless Strapi (Standalone Mode)...');

  // Create headless instance
  instance = createStrapi({
    distDir: 'dist',
  });

  try {
    // Load the application (connects to DB, loads schemas) but does NOT listen on port
    await instance.load(); 
    console.log('✅ Strapi Loaded Successfully.');
    return instance;
  } catch (error) {
    console.error('❌ Failed to boot Strapi:', error);
    process.exit(1);
  }
}
