export default {
  routes: [
    {
      method: 'POST',
      path: '/game/god-mode/execute',
      handler: 'game.godModeExecute',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
