import { PLUGIN_ID } from '@/plugins/map-explorer/admin/src/pluginId';

/**
 * Generates a localized translation key for the plugin.
 *
 * @param id - The translation key identifier.
 * @returns The fully qualified translation key string in the format `${PLUGIN_ID}.${id}`.
 */
const getTranslation = (id: string) => `${PLUGIN_ID}.${id}`;

export { getTranslation };
