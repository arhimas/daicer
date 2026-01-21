/**
 * Agent Router.
 * Custom router for Agent tool execution endpoints.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/agent/execute',
      handler: 'agent.executeTool',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
