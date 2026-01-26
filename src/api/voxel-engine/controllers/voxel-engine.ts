/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
export default ({ strapi }) => ({
  /**
   * Generates a Voxel Preview (Chunk) without saving.
   * Used for real-time map exploration or editor preview.
   * POST /api/voxel-engine/preview
   *
   * @param ctx - Koa Context (body: { chunks, config } or { x, y, world })
   * @returns 3D Chunk Data
   */
  async voxelPreview(ctx) {
    const { chunks, config } = ctx.request.body;

    if (!config) {
      return ctx.badRequest('Missing config');
    }

    try {
      const service = strapi.service('api::voxel-engine.voxel-engine');

      // Handle batch request (array of chunks) which is what our specialized loader uses
      if (Array.isArray(chunks)) {
        const results = await Promise.all(
          chunks.map(async (c: { x: number; y: number }) => {
            return service.getChunk(c.x, c.y, config);
          })
        );
        ctx.body = results;
        return;
      }

      // Fallback: Legacy single chunk support (from existing route call)
      const { x, y, world } = ctx.request.body;
      const chunk = await service.getChunk(x || 0, y || 0, config, world);
      ctx.body = chunk;
    } catch (err) {
      // Use strapi.log if available from injection, or global strapi
      strapi.log.error('voxelPreview error:', err);
      ctx.internalServerError('Failed to generate chunk', err);
    }
  },
});
