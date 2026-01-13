export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/stats',
      handler: 'dashboard.getStats',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/:queueName/pause',
      handler: 'dashboard.pause',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/:queueName/resume',
      handler: 'dashboard.resume',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/:queueName/clean',
      handler: 'dashboard.clean',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/:queueName/retry',
      handler: 'dashboard.retry',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
});
