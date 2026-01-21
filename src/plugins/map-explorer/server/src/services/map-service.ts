import type { Core } from '@strapi/strapi';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getWorldConfig() {
    // Assuming single world instance for now
    const world = await strapi.db.query('api::world.world').findOne();
    if (!world) {
        // Return default structure if none exists
        return {
            seed: 'daicer',
            chunkSize: 16,
            seaLevel: 0,
            structureChance: 0.1,
            roadDensity: 0.1
        };
    }
    return world;
  },

  async updateWorldConfig(data) {
    const world = await strapi.db.query('api::world.world').findOne();
    if (world) {
        return await strapi.documents('api::world.world').update({
            documentId: world.documentId,
            data
        });
    } else {
        return await strapi.documents('api::world.world').create({
            data
        });
    }
  },

  async getConstructions() {
      return await strapi.documents('api::construction.construction').findMany();
  },

  async saveConstruction(data) {
      // If ID or DocumentID exists, update. Else create.
      // For simplicity in this iteration, we treat "save" as create or overwrite by name if we implement unique name check.
      // But the UI will likely send exact data.
      
      // Basic creation for now
      return await strapi.documents('api::construction.construction').create({
          data
      });
  }
});

export default service;
