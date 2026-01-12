import { PLUGIN_ID } from './pluginId';
import { Apps } from '@strapi/icons';

interface StrapiApp {
    addMenuLink: (config: {
        to: string;
        icon: React.ComponentType;
        intlLabel: { id: string; defaultMessage: string };
        Component: () => Promise<any>;
        permissions: any[];
    }) => void;
    addWidgets: (widgets: Array<{ type: string; Component: () => Promise<any> }>) => void;
    registerPlugin: (config: { id: string; initializer: () => null; isReady: boolean; name: string }) => void;
}

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: Apps,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Queue Dashboard',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [],
    });

    try {
        app.addWidgets([
        {
            type: 'project-details', 
            Component: async () => import('./components/HomeWidget').then(mod => mod.default),
        }
        ]);
        console.log("Queue Dashboard widget registered");
    } catch(e) {
        console.warn('Failed to register homepage widget', e);
    }

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: () => null,
      isReady: true,
      name: PLUGIN_ID,
    });
  },

  async bootstrap() {
    // Legacy Injection for Content Manager (not needed for homepage widget)
  },
};
