import { factories } from '@strapi/strapi';

/**
 * Turn Service.
 * Core service for managing game turn entities (persistence layer).
 */
export default factories.createCoreService('api::turn.turn');
