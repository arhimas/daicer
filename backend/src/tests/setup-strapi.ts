import path from 'path';
import { applyStrapiPatches } from './harness-patches';
import type { Core } from '@strapi/strapi'; // Type-only import is fine

let instance: Core.Strapi | undefined;

export const setupStrapi = async () => {
  if (!instance) {
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
    // Use random port to avoid conflicts
    process.env.PORT = String(Math.floor(Math.random() * 10000) + 40000);

    // 3. Dynamic require to prevent hoisting issues
     
    const { createStrapi } = require('@strapi/strapi');

    // 4. Boot Strapi
    const appDir = path.resolve(__dirname, '../..'); // Points to backend/
    instance = await createStrapi({ appDir, distDir: appDir }).load();
    await instance.start(); // Start required for some services/listeners

    (global as any).strapi = instance;
  }
  return instance;
};

export const cleanupStrapi = async () => {
  if (instance) {
    await instance.destroy();
    instance = undefined;
    delete (global as any).strapi;
  }
};
