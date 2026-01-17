export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/config',
      handler: 'mapController.getWorldConfig',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/config',
      handler: 'mapController.updateWorldConfig',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/chunk',
      handler: 'mapController.getMapChunk',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/voxel',
      handler: 'mapController.updateVoxel',
      config: {
        policies: [],
      },
    },
  ],
};
