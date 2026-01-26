/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { factories } from '@strapi/strapi';

/**
 * Item Service
 * Core service for the 'Item' content type (Weapons, Armor, etc.).
 */
export default factories.createCoreService('api::item.item');
