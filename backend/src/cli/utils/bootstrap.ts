
import { createStrapi } from '@strapi/strapi';
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
    
    // Register shutdown hooks for CLI usage
    // This ensures that when the CLI command finishes (or ctrl+c), we kill python process
    const shutdown = async () => {
      if (instance) {
        console.log('⏳ Shinning down Strapi...');
        await instance.destroy();
        instance = null;
        console.log('🛑 Strapi Shutdown Complete.');
      }
    };

    // We don't want to force exit on SIGINT if the caller handles it, 
    // but for CLI scripts it is usually safe.
    // However, vitest might be confused if we hijack signals.
    // Better: allow the caller to destroy.
    return instance;
  } catch (error) {
    console.error('❌ Failed to boot Strapi:', error);
    process.exit(1);
  }
}

export async function stopStrapi() {
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}
