'use strict';

module.exports = ({ strapi }) => ({
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
