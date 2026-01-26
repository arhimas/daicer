/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { factories } from '@strapi/strapi';

/**
 * Entity Service (Monster/Template)
 * Core service for the 'Entity' content type, which serves as a template for Monsters/NPCs.
 */
export default factories.createCoreService('api::entity.entity');
