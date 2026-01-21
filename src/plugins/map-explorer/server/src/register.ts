import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: "voxel-grid",
    plugin: "map-explorer",
    type: "json", // Encoded as JSON in DB
    inputSize: {
        default: 12,
        isResizable: false
    }
  });

  strapi.customFields.register({
    name: "texture-grid",
    plugin: "map-explorer",
    type: "json",
    inputSize: {
        default: 12,
        isResizable: false
    }
  });

  strapi.customFields.register({
    name: "construction-grid",
    plugin: "map-explorer",
    type: "json",
    inputSize: {
        default: 12,
        isResizable: false
    }
  });

  strapi.customFields.register({
    name: "world-grid",
    plugin: "map-explorer",
    type: "json",
    inputSize: {
        default: 12,
        isResizable: false
    }
  });
};

export default register;
