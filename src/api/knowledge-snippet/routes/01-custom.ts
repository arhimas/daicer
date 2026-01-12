export default {
  routes: [
    {
      method: 'GET',
      path: '/knowledge-snippets/search',
      handler: 'knowledge-snippet.search',
      config: {
        auth: false, // Agent access is protected by API tokens usually, but for now open or default
        policies: [],
        middlewares: [],
      },
    },
  ],
};
