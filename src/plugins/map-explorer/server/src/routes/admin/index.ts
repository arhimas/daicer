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
    {
      method: 'GET',
      path: '/constructions',
      handler: 'mapController.getConstructions',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/constructions',
      handler: 'mapController.saveConstruction',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/generate-texture',
      handler: 'mapController.generateTexture',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/timeline',
      handler: 'mapController.getTimeline',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/replay',
      handler: 'mapController.replay',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/generate-pixel-art',
      handler: 'mapController.generatePixelArt',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/forge/dispatch',
      handler: 'forgeController.dispatch',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/forge/status/:jobId',
      handler: 'forgeController.status',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/forge/queue',
      handler: 'forgeController.list',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/preview',
      handler: 'voxelPreview.generate',
      config: {
        policies: [],
      },
    },
  ],
};
