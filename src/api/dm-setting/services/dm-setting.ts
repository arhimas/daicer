/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { factories } from '@strapi/strapi';

/**
 * DM Setting Service
 * Configuration service for Dungeon Master settings per room.
 */
export default factories.createCoreService('api::dm-setting.dm-setting');
