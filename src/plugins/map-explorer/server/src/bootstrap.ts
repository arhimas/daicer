import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  await strapi.plugin('map-explorer').service('queueService').initialize();
};

export default bootstrap;
