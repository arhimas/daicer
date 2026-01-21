
/**
 * Custom Admin Routes for Game API
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
        auth: false,
      },
    },
  ],
};
