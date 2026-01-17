import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getMapChunk(ctx) {
    const { x, y } = ctx.query;
    if (!x || !y) {
      return ctx.badRequest('Missing coordinates');
    }

    try {
      const config = await strapi.plugin('map-explorer').service('mapService').getWorldConfig();
      const chunk = await strapi.service('api::voxel-engine.voxel-engine').getChunk(parseInt(x as string), parseInt(y as string), config);
      ctx.body = chunk;
    } catch (err) {
      ctx.badRequest('Failed to fetch chunk', { error: err });
    }
  },

  async updateVoxel(ctx) {
    const { chunkX, chunkY, voxelX, voxelY, voxelZ, newType, reason } = ctx.request.body;

    try {
      await strapi.service('api::voxel-engine.voxel-engine').editVoxel(
        chunkX, chunkY, voxelX, voxelY, voxelZ, newType, reason
      );
      ctx.body = { success: true };
    } catch (err) {
      ctx.badRequest('Failed to update voxel', { error: err });
    }
  },

  async getWorldConfig(ctx) {
    try {
      const config = await strapi.plugin('map-explorer').service('mapService').getWorldConfig();
      ctx.body = config;
    } catch (err) {
      ctx.badRequest('Failed to fetch world config', { error: err });
    }
  },
  
  async updateWorldConfig(ctx) {
    const { body } = ctx.request;
    try {
      const updated = await strapi.plugin('map-explorer').service('mapService').updateWorldConfig(body);
      ctx.body = updated;
    } catch (err) {
        ctx.badRequest('Failed to update world config', { error: err });
    }
  }
});

export default controller;
