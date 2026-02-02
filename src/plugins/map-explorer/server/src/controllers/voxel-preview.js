"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ strapi }) => ({
    async generate(ctx) {
        // Re-use the existing Voxel Engine service logic
        // We assume the main Voxel Engine logic is exposed via 'api::voxel-engine.voxel-engine' service
        // or we might need to duplicate/import the logic if it's not a shared service.
        // Based on previous files, there is a 'voxel-engine' API.
        const { x, y, world, config } = ctx.request.body;
        try {
            const service = strapi.service('api::voxel-engine.voxel-engine');
            if (!service) {
                return ctx.notFound('Voxel Engine service not found');
            }
            // Use the existing service method
            const chunk = await service.getChunk({ x, y, worldId: world, config });
            ctx.body = chunk;
        }
        catch (err) {
            ctx.internalServerError('Failed to generate preview', err);
        }
    },
});
