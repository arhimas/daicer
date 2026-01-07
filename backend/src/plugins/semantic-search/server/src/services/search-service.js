'use strict';

const TARGET_ALIASES = {
  spell: 'api::spell.spell',
  monster: 'api::monster.monster',
  class: 'api::class.class',
  race: 'api::race.race',
  character: 'api::character.character',
  equipment: 'api::equipment.equipment',
  // Add others as needed
};

module.exports = ({ strapi }) => ({
  async search({ query, targets = [], limit = 5 }) {
    if (!query) return [];

    const embeddingService = strapi.plugin('semantic-search').service('embeddingService');
    const vectorService = strapi.plugin('semantic-search').service('vectorService');

    // 1. Generate Vector
    const vector = await embeddingService.generateEmbedding(query);
    if (!vector || vector.length === 0) return [];

    const results = [];
    const targetSet = new Set((targets || []).map((t) => t.toLowerCase()));
    const searchAll = targetSet.size === 0;

    // 2. Search Manual Docs (Knowledge Sources)
    if (searchAll || targetSet.has('manual') || targetSet.has('knowledge')) {
      try {
        const rows = await vectorService.searchManual(vector, limit);
        rows.forEach((row) => {
          results.push({
            id: `manual-${row.id}`,
            title: row.title || 'Untitled Snippet',
            excerpt: row.content, // Snippet content IS the excerpt
            score: typeof row.score === 'number' ? row.score : 1 - (row.distance || 0),
            kind: 'knowledge',
            sourceName: row.source_name,
            sourceId: row.source_id, // For frontend linking
            snippetId: row.id,
            tags: [], // Tags might need to be fetched from Source if needed
          });
        });
      } catch (e) {
        strapi.log.error('Manual Search Step Failed:', e);
      }
    }

    // 3. Search Entities
    const entitiesToSearch = [];
    if (searchAll) {
      Object.values(TARGET_ALIASES).forEach((uid) => entitiesToSearch.push(uid));
    } else {
      Object.entries(TARGET_ALIASES).forEach(([alias, uid]) => {
        if (targetSet.has(alias)) entitiesToSearch.push(uid);
      });
    }

    // Limit per entity type to keep it fast? Or global limit?
    // Current strategy: Search Top N for EACH, then merge.

    for (const uid of entitiesToSearch) {
      try {
        const rows = await vectorService.searchEntity(uid, vector, limit);
        const ids = rows.map((r) => r.id);
        if (ids.length === 0) continue;

        const scoreMap = new Map(rows.map((r) => [r.id, r.score]));

        // Hydrate
        const entities = await strapi.entityService.findMany(uid, {
          filters: { id: { $in: ids } },
          limit: limit,
        });

        if (Array.isArray(entities)) {
          entities.forEach((ent) => {
            const score = scoreMap.get(ent.id) || 0;
            results.push({
              id: ent.documentId || ent.id,
              title: ent.name || ent.title || `Entity #${ent.id}`,
              excerpt: ent.description?.substring?.(0, 200) || '',
              score: score,
              kind: 'entity',
              entityUid: uid,
              tags: [uid.split('.')[1]],
            });
          });
        }
      } catch (e) {
        strapi.log.error(`Entity Search Step Failed for ${uid}:`, e);
      }
    }

    // 4. Sort & Truncate
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  },
});
