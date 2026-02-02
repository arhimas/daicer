import type { Core } from '@strapi/strapi';

const service = ({ strapi }: { strapi: Core.Strapi }) => {
  const getConfig = (key: string) => strapi.plugin('map-explorer').config('contentTypes')[key];

  return {
    /**
     * Retrieves global map generation settings.
     * Returns defaults if no config is found in DB.
     */
    async getWorldConfig() {
      // Assuming single world instance for now
      const uid = getConfig('world');
      const world = await strapi.db.query(uid).findOne();
      if (!world) {
        // Return default structure if none exists
        return {
          seed: 'daicer',
          chunkSize: 16,
          seaLevel: 0,
          structureChance: 0.1,
          roadDensity: 0.1,
        };
      }
      return world;
    },

    async updateWorldConfig(data) {
      const uid = getConfig('world');
      const world = await strapi.db.query(uid).findOne();
      if (world) {
        return await strapi.documents(uid).update({
          documentId: world.documentId,
          data,
        });
      } else {
        return await strapi.documents(uid).create({
          data,
        });
      }
    },

    async getConstructions() {
      const uid = getConfig('construction');
      return await strapi.documents(uid).findMany();
    },

    async saveConstruction(data) {
      // If ID or DocumentID exists, update. Else create.
      const uid = getConfig('construction');
      return await strapi.documents(uid).create({
        data,
      });
    },
  };
};

export default service;
