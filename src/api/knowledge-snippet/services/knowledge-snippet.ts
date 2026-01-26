/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
/**
 * knowledge-snippet service
 */

import { factories } from '@strapi/strapi';

// Service
/**
 * Knowledge Snippet Service.
 * Core service for managing knowledge snippets.
 */
export default factories.createCoreService('api::knowledge-snippet.knowledge-snippet');
