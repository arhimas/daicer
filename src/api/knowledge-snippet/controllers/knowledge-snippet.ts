/**
 * knowledge-snippet controller
 */

import { factories } from '@strapi/strapi';

// Controller
export default factories.createCoreController('api::knowledge-snippet.knowledge-snippet', ({ strapi: _strapi }) => ({
  async search(ctx) {
    const { q } = ctx.query;

    if (!q) {
      return ctx.badRequest('Query param "q" is required');
    }

    try {
      const { unifiedSearchService } = await import('../../../services/unified-search-service');

      let results;
      const mode = ctx.query.mode as string;
      const targetsParam = ctx.query.targets as string;

      let targets: string[] = [];
      if (targetsParam) {
        targets = targetsParam.split(',').map((t) => t.trim());
      } else if (mode === 'entity') {
        // Fallback legacy support
        // Note: If we leave targets empty, UnifiedSearch searches EVERYTHING (inc manual).
        // If user wanted STRICT entities only via logic, we'd need to list all known entity aliases.
        // But effectively, 'entity' mode in current CLI uses searchEntities() which is strict.
        // Let's call searchEntities explicitly if mode is entity to maintain strictness,
        // OR better, pass explicit list of all entity aliases.
        // Actually, let's just stick to the search API we built.
        results = await unifiedSearchService.searchEntities(q as string, 5);
        return results;
      }

      results = await unifiedSearchService.search(q as string, {
        limit: 5,
        targets: targets.length > 0 ? targets : undefined,
      });

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return ctx.internalServerError('Search failed');
    }
  },
}));
