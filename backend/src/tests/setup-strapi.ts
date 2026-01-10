import path from 'path';
import { applyStrapiPatches } from './harness-patches';
import type { Core } from '@strapi/strapi'; // Type-only import is fine

let instance: Core.Strapi | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupStrapi = async (): Promise<any> => {
  if (!instance) {
    // 0. Mock process.exit to prevent Strapi or its dependencies (e.g. better-sqlite3)
    // from killing the test worker on error/shutdown.
    // We NEVER restore this because the worker is about to die anyway.
    // @ts-ignore
    process.exit = (code?: number) => {
      console.warn(`[TestHarness] Prevented process.exit(${code}) call from Strapi during setup/teardown`);
      return undefined as never;
    };

    // 1. Apply patches immediately to ensure config loader is intercepted
    applyStrapiPatches();

    // 2. Set Test Environment Variables
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_CLIENT = 'sqlite';
    process.env.DATABASE_FILENAME = ':memory:'; // Use memory for speed, or file for debugging
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret';
    process.env.API_TOKEN_SALT = 'test-api-token-salt';
    process.env.APP_KEYS = 'testKey1,testKey2';
    process.env.STRAPI_TELEMETRY_DISABLED = 'true'; // Disable analytics to prevent EPIPE on teardown
    // Use random port to avoid conflicts
    process.env.PORT = String(Math.floor(Math.random() * 10000) + 40000);

    // 3. Dynamic require to prevent hoisting issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Strapi = require('@strapi/strapi');

    // 4. Boot Strapi
    const appDir = path.resolve(__dirname, '../..'); // Points to backend/
    instance = await Strapi.createStrapi({ appDir, distDir: appDir }).load();
    await instance.start(); // Start required for some services/listeners

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).strapi = instance;
  }
  return instance;
};

export const cleanupStrapi = async () => {
  if (instance) {
    // Simplified cleanup: Let Strapi handle its own destruction.
    // We do NOT manually destroy the DB connection because it causes "aborted" errors in tarn/knex.
    try {
      // Silence logger to prevent EPIPE errors during teardown if stdout closes early
      // @ts-ignore
      if (instance.log) {
        // @ts-ignore
        instance.log.level = 'silent';
      }

      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (instance.server && (instance.server as any).close) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (instance.server as any).close();
      }
    } catch (_e) {
      // Ignore server closure errors
      console.error(_e);
    }

    try {
      // Skip destroy to prevent EPIPE/segfaults from better-sqlite3
      // await instance.destroy();
    } catch (_e) {
      // Ignore destroy errors
      console.error(_e);
    }

    instance = undefined;
    // Keep global.strapi to prevent ReferenceErrors from late listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // delete (global as any).strapi;

    // Generous delay to allow native SQLite bindings to flush and close
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // NOTE: We do NOT restore process.exit here.
    // If we restore it, any trailing async cleanup from SQLite that calls exit(1)
    // will crash the worker. Better to keep it mocked until the worker naturally dies.
  }
};
