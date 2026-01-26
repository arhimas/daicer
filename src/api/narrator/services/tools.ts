/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { getRegistryTools } from './tool-registry';

/**
 * @deprecated Use getRegistryTools from './tool-registry' instead.
 * Wrapper for backward compatibility.
 */
export const createGameTools = (strapi, roomId) => {
  return getRegistryTools(strapi, roomId, 'game');
};
