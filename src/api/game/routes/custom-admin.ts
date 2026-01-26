/**
 * Custom Admin Routes for Game API.
 * Defines endpoints restricted to the admin panel.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/game/generate-locales',
      handler: 'locales.generateLocales',
      config: {
        type: 'admin',
        policies: ['admin::isAuthenticatedAdmin'],
        middlewares: [],
      },
    },
  ],
};
