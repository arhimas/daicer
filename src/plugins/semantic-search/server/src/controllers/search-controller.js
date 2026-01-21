'use strict';

module.exports = ({ strapi }) => ({
  /**
   * Unified Search Endpoint.
   * Delegates to Search Service to query Knowledge and Entities via Vector Search.
   * POST /api/semantic-search/search
   * 
   * @param {object} ctx
   * @param {object} ctx.request.body
   * @param {string} ctx.request.body.query - The search string
   * @param {string[]} [ctx.request.body.targets] - Specific targets (e.g. ['spell', 'manual'])
   */
  async search(ctx) {
    try {
      const { query, targets, limit } = ctx.request.body || {};

      const results = await strapi.plugin('semantic-search').service('searchService').search({ query, targets, limit });

      ctx.body = { meta: { count: results.length }, data: results };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});
