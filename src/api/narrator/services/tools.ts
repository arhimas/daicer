import { getRegistryTools } from './tool-registry';

/**
 * @deprecated Use getRegistryTools from './tool-registry' instead.
 * Wrapper for backward compatibility.
 */
export const createGameTools = (strapi, roomId) => {
  return getRegistryTools(strapi, roomId, 'game');
};
