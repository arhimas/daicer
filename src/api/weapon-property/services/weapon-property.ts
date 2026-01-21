import { factories } from '@strapi/strapi';

/**
 * Weapon Property Service.
 * Core service for managing weapon properties (finesse, light, etc).
 */
export default factories.createCoreService('api::weapon-property.weapon-property');
