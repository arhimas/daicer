import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  console.log('>>> [Map Explorer] Registering Custom Fields...');
  strapi.customFields.register({
    name: 'voxel-grid',
    plugin: 'map-explorer',
    type: 'json', // Encoded as JSON in DB
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });

  strapi.customFields.register({
    name: 'texture-grid',
    plugin: 'map-explorer',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });

  strapi.customFields.register({
    name: 'construction-grid',
    plugin: 'map-explorer',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });

  strapi.customFields.register({
    name: 'world-grid',
    plugin: 'map-explorer',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });

  strapi.customFields.register({
    name: 'pixel-forge',
    plugin: 'map-explorer',
    type: 'json',
    inputSize: {
      default: 12,
      isResizable: false,
    },
  });

  strapi.customFields.register({
    name: 'inventory-composer',
    plugin: 'map-explorer',
    type: 'json',
  });
};

export default register;
