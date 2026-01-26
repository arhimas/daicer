/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
/**
 * narrator controller
 */

export default {
  /**
   * Processes player input via the Narrator engine.
   * Handles intent classification, tool execution, and response generation.
   * POST /api/narrator/action
   *
   * @param ctx - Koa Context (body: { roomId, input, mode })
   */
  async handleAction(ctx) {
    const { roomId, input, mode } = ctx.request.body;

    if (!roomId || !input) {
      return ctx.badRequest('Missing roomId or input');
    }

    try {
      const result = await strapi.service('api::narrator.narrator').processAction({
        roomId,
        input,
        mode: mode || 'player',
        userId: ctx.state.user?.documentId,
      });

      ctx.body = result;
    } catch (err) {
      ctx.badRequest('Narrator Error', { error: err.message });
    }
  },
};
