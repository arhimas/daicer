import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';

export const getStrapiUrl = () => STRAPI_URL;
