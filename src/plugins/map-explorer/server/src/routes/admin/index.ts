export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/config',
      handler: 'mapController.getWorldConfig',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'PUT',
      path: '/config',
      handler: 'mapController.updateWorldConfig',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/chunk',
      handler: 'mapController.getMapChunk',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/voxel',
      handler: 'mapController.updateVoxel',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/constructions',
      handler: 'mapController.getConstructions',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/constructions',
      handler: 'mapController.saveConstruction',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/generate-texture',
      handler: 'mapController.generateTexture',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/timeline',
      handler: 'mapController.getTimeline',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/replay',
      handler: 'mapController.replay',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/generate-pixel-art',
      handler: 'mapController.generatePixelArt',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/forge/dispatch',
      handler: 'forgeController.dispatch',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/forge/status/:jobId',
      handler: 'forgeController.status',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/forge/queue',
      handler: 'forgeController.list',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'POST',
      path: '/preview',
      handler: 'voxelPreview.generate',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
