import { afterAll } from 'vitest';
import { cleanupStrapi } from './setup-strapi';

// Ensure Strapi is destroyed after all tests in a suite
afterAll(async () => {
  await cleanupStrapi();
});
