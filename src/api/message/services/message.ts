/**
 * message service
 */

import { factories } from '@strapi/strapi';

/**
 * Message Service.
 * Core service for managing chat messages.
 */
export default factories.createCoreService('api::message.message');
