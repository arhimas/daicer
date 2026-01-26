/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
/**
 * prompt service
 */

import { factories } from '@strapi/strapi';

/**
 * Prompt Service.
 * Core service for managing system prompts.
 */
export default factories.createCoreService('api::prompt.prompt');
