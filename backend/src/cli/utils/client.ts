import { strapi } from '@strapi/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_AUDIT_TOKEN;

// We need to strip the /api suffix if provided because the client expects the base URL,
// but the client docs say "baseURL: 'http://localhost:1337/api'".
// Wait, the documentation in the prompt says: "const client = strapi({ baseURL: 'http://localhost:1337/api' });"
// So we keep /api.

if (!STRAPI_TOKEN) {
  console.warn('⚠️  STRAPI_AUDIT_TOKEN not found in .env. Requests may fail if endpoints are protected.');
}

export const client = strapi({
  baseURL: STRAPI_URL,
  auth: STRAPI_TOKEN,
  headers: {
    'User-Agent': 'Daicer-CLI/1.0',
  },
});

export const getStrapiUrl = () => STRAPI_URL;
