/**
 * Engine Controller
 * Direct access to deterministic game engine functions.
 */

export default ({ strapi }) => ({
  async spawn(ctx) {
    const { roomId, type, entityId, position } = ctx.request.body;

    if (!roomId || !type || !entityId || !position) {
      return ctx.badRequest('Missing required fields: roomId, type, entityId, position');
    }

    try {
      let result;
      if (type === 'monster') {
        result = await strapi.service('api::game.spawn-service').spawnMonster(roomId, entityId, position);
      } else if (type === 'character') {
        result = await strapi.service('api::game.spawn-service').spawnCharacter(roomId, entityId, position);
      } else {
        return ctx.badRequest('Invalid type. Must be "monster" or "character"');
      }

      // Broadcast logic removed

      ctx.body = result;
    } catch (err) {
      strapi.log.error('Spawn error:', err);
      ctx.badRequest('Spawn failed', { error: err.message });
    }
  },

  async execute(ctx) {
    const { roomId, actions } = ctx.request.body;
    const user = ctx.state.user; // If auth is used

    // Delegate to existing turn-processing logic
    // We might want to move that logic here eventually, but for now wrap it.
    try {
      const result = await strapi.service('api::game.turn-processing').executeDeterministicTurn(roomId, actions, user);
      ctx.body = result;
    } catch (err) {
      ctx.badRequest('Execution failed', { error: err.message });
    }
  },
});
