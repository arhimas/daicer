import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { Play } from '@strapi/icons';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: Play,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Queue Dashboard',
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.widgets.register({
      icon: Play,
      title: {
        id: getTranslation('widget.title'),
        defaultMessage: 'Queue Dashboard',
      },
      id: 'queue-dashboard-widget',
      pluginId: PLUGIN_ID,
      component: async () => {
        const { Widget } = await import('./components/Widget');
        // The widget API expects the component to be the default export or the resolved value
        return Widget;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
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
