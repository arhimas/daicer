/**
 * Game Controller
 */

import type { WorldSettings, Language } from '../src/engine';

export default ({ strapi }) => ({
  async generateWorld(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation generateWorld.');
  },

  async searchEntities(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Query searchEntities.');
  },

  async processTurn(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation processTurn.');
  },

  async addCharacter(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation addCharacter.');
  },

  async startGame(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation startGame.');
  },

  async getRoom(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Query gameView or room.');
  },

  async submitAction(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation submitAction.');
  },

  async executeEngineAction(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation executeTool.');
  },

  async replay(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL replay functionality.');
  },

  async toggleReady(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation.');
  },

  async godModeExecute(ctx) {
    return ctx.gone('DEPRECATED: Use GraphQL Mutation executeTool with god mode.');
  },
});
