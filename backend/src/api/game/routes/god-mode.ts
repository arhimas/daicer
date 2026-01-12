export default {
  routes: [
    {
      method: 'POST',
      path: '/game/god-mode/execute',
      handler: 'god-mode.godModeExecute',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
