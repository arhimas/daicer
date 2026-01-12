
export default {
  'admin-queues': {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/stats',
        handler: 'dashboard.getStats',
        config: {
          policies: [],
          auth: false, // Keeping auth false for now to debug - will secure in next step once visible
        },
      },
    ],
  },
};
