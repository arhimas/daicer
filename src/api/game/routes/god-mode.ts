/**
 * God Mode Routes.
 * Endpoints for GM/God actions, typically requiring elevated permissions.
 */
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
