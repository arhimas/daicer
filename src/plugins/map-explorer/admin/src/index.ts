import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
// import { App } from './pages/App';

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(app: any) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Map Explorer',
      },
      Component: async () => import('./pages/App').then((mod) => mod.App),
      permissions: [],
    });

    app.customFields.register({
      name: 'voxel-grid',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'map-explorer.voxel-grid.label',
        defaultMessage: 'Voxel Grid',
      },
      intlDescription: {
        id: 'map-explorer.voxel-grid.description',
        defaultMessage: 'Edit 3D Voxel Structure',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/VoxelInput').then((module) => ({
            default: module.VoxelInput,
          })),
      },
      options: {},
    });

    app.customFields.register({
      name: 'texture-grid',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'map-explorer.texture-grid.label',
        defaultMessage: 'Texture Painter',
      },
      intlDescription: {
        id: 'map-explorer.texture-grid.description',
        defaultMessage: 'Paint 32x32 Texture',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/TextureInput').then((module) => ({
            default: module.TextureInput,
          })),
      },
      options: {},
    });

    app.customFields.register({
      name: 'construction-grid',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'map-explorer.construction-grid.label',
        defaultMessage: 'Construction Builder',
      },
      intlDescription: {
        id: 'map-explorer.construction-grid.description',
        defaultMessage: 'Edit 3D Construction',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/VoxelInput').then((module) => ({
            default: module.VoxelInput,
          })),
      },
      options: {},
    });

    app.customFields.register({
      name: 'world-grid',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'map-explorer.world-grid.label',
        defaultMessage: 'World Map',
      },
      intlDescription: {
        id: 'map-explorer.world-grid.description',
        defaultMessage: 'View/Edit World Chunks',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/WorldVoxelInput').then((module) => ({
            default: module.WorldVoxelInput,
          })),
      },
      options: {},
    });

    app.customFields.register({
      name: 'pixel-forge',
      pluginId: PLUGIN_ID,
      type: 'json',
      intlLabel: {
        id: 'map-explorer.pixel-forge.label',
        defaultMessage: 'Pixel Forge',
      },
      intlDescription: {
        id: 'map-explorer.pixel-forge.description',
        defaultMessage: 'AI-Powered Pixel Art Editor (SOTA)',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/PixelForge').then((module) => ({
            default: module.PixelForge,
          })),
      },
      options: {},
    });

    app.customFields.register({
      name: 'inventory-composer',
      pluginId: PLUGIN_ID,
      type: 'component',
      intlLabel: {
        id: 'map-explorer.inventory-composer.label',
        defaultMessage: 'Inventory Composer',
      },
      intlDescription: {
        id: 'map-explorer.inventory-composer.description',
        defaultMessage: 'Visual Drag-and-Drop Slot UI',
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import('./components/InventoryComposer').then((module) => ({
            default: module.InventoryComposer,
          })),
      },
      options: {},
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
