/**
 * status-effect service
 */

import { factories } from '@strapi/strapi';

/**
 * Status Effect Service.
 * Core service for managing status effects (conditions).
 */
export default factories.createCoreService('api::status-effect.status-effect');
