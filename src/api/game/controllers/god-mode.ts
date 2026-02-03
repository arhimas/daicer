/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { EngineCommandSchema, EngineCommand } from '@/api/game/schemas/commands';

export default ({ strapi }) => ({
  /**
   * Safe entry point for God Mode commands.
   * Validates commands against strict schemas before processing.
   * POST /api/game/god-mode/execute
   *
   * @param ctx - Koa Context (body: { roomId, commands })
   */
  async godModeExecute(ctx) {
    const { roomId, commands } = ctx.request.body;

    if (!roomId || !commands || !Array.isArray(commands)) {
      return ctx.badRequest('Invalid payload. Expected { roomId, commands: [...] }');
    }

    // Validate Commands
    const validCommands: EngineCommand[] = [];
    for (const cmd of commands) {
      const result = EngineCommandSchema.safeParse(cmd);
      if (!result.success) {
        return ctx.badRequest('Invalid Command Schema', result.error);
      }
      validCommands.push(result.data);
    }

    try {
      const pipeline = strapi.service('api::game.turn-pipeline');
      const inputs = validCommands.map((c) => ({ type: 'command' as const, command: c }));

      const result = await pipeline.processTurn(roomId, inputs);

      ctx.send(result);
    } catch (err) {
      strapi.log.error(err);
      ctx.internalServerError((err as Error).message);
    }
  },
});
