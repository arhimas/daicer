import { PLUGIN_ID } from './pluginId';
import { Apps } from '@strapi/icons';
import pluginPermissions from './permissions';

export default {
  register(app: any) {
    console.log("💥 Queue Dashboard Client: Registering Plugin... 💥");
    // Register the widget explicitly using the registry API
    app.widgets.register({
      name: 'queue-dashboard-widget',
      title: {
        id: `${PLUGIN_ID}.widget.title`,
        defaultMessage: 'Queue Dashboard',
      },
      component: async () => {
        const component = await import('./components/HomeWidget');
        return component.default;
      },
    });

    try {
        console.log("Queue Dashboard widget registered via registry");
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

  async bootstrap(app: any) {
    // Legacy Injection for Content Manager (not needed for homepage widget)
  },
};
