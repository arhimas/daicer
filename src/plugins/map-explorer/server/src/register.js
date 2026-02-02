"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const register = ({ strapi }) => {
    console.log('>>> [Map Explorer] Registering Custom Fields...');
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
    strapi.customFields.register({
        name: "sprite-grid",
        plugin: "map-explorer",
        type: "json",
        inputSize: {
            default: 12,
            isResizable: false
        }
    });
    strapi.customFields.register({
        name: "pixel-generator",
        plugin: "map-explorer",
        type: "json",
        inputSize: {
            default: 12, // full width
            isResizable: false
        }
    });
};
exports.default = register;
