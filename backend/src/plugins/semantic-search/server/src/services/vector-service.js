'use strict';
require('sqlite-vec');
require('better-sqlite3');

// Helper to get raw connection if needed, though Strapi hides it well.
// We might need to load the extension if Strapi doesn't do it globally?
// Strapi's connection.client.config.client tells us the type.

module.exports = ({ strapi }) => ({
  /**
   * Search Manual Knowledge Snippets using sqlite-vec
   * @param {number[]} vector - 1536d vector
   * @param {number} limit
   */
  async searchManual(vector, limit = 5) {
    // sqlite-vec expects binary blob or specific format for some operations.
    // simpler to use the new `vec_distance_cosine` which supports JSON-like arrays or Blobs.
    const vectorStr = JSON.stringify(vector);

    const connection = strapi.db.connection;
    const client = connection.client.config.client;

    try {
      if (client === 'better-sqlite3' || client === 'sqlite') {
        // Use sqlite-vec syntax
        // Assuming we have a virtual table or we are using standard table with aux function?
        // Proposal: Use `vec_distance_cosine(embedding, ?)`
        // NOTE: The table `knowledge_snippets` likely stores embedding as BLOB or JSON Text?
        // Old implementation used `vector_distance_cos`.
        // New sqlite-vec uses `vec_distance_cosine`.
        // We must ensure the extension is loaded.

        // We can try raw query.
        const result = await connection.raw(
          `SELECT 
              ks.id, 
              ks.content, 
              ks.title,
              src.name as source_name,
              src.id as source_id,
              vec_distance_cosine(ks.embedding, ?) as distance
            FROM knowledge_snippets ks
            JOIN knowledge_snippets_source_lnk lnk ON ks.id = lnk.knowledge_snippet_id
            JOIN knowledge_sources src ON lnk.knowledge_source_id = src.id
            WHERE ks.embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT ?;`,
          [vectorStr, limit]
        );
        // Map distance to score (1 - distance) for compatibility if needed,
        // but user seems to strictly want to "use our sqlite and the vector distance".
        // Let's return distance but maybe map it to 'score' for frontend compat?
        // Cosine distance: 0 = identical, 2 = opposite.
        // Similarity = 1 - distance is a common approximation for frontend ranking.

        return result.map((r) => ({
          ...r,
          score: 1.0 - (r.distance || 0),
        }));
      } else {
        // Postgres / PGVector Fallback (unchanged)
        const vectorStr = `[${vector.join(',')}]`;
        const result = await connection.raw(
          `SELECT 
                ks.id, 
                ks.content, 
                ks.title,
                src.name as source_name,
                src.id as source_id,
                1 - ((ks.embedding::text)::vector <=> ?) as score
            FROM knowledge_snippets ks
            JOIN knowledge_snippets_source_lnk lnk ON ks.id = lnk.knowledge_snippet_id
            JOIN knowledge_sources src ON lnk.knowledge_source_id = src.id
            WHERE ks.embedding IS NOT NULL
            ORDER BY ((ks.embedding::text)::vector <=> ?) ASC
            LIMIT ?;`,
          [vectorStr, vectorStr, limit]
        );
        return result.rows || result;
      }
    } catch (err) {
      strapi.log.error('Vector Service (Manual Sources) Failed:', err.message);
      return [];
    }
  },

  /**
   * Search an specific Entity Table using SQLite-Vec
   * @param {string} uid - Model UID (api::spell.spell)
   * @param {number[]} vector
   * @param {number} limit
   */
  async searchEntity(uid, vector, limit = 5) {
    const vectorStr = JSON.stringify(vector);
    const meta = strapi.db.metadata.get(uid);
    const tableName = meta.tableName;
    const connection = strapi.db.connection;
    const client = connection.client.config.client;

    try {
      if (client === 'better-sqlite3' || client === 'sqlite') {
        // Use sqlite-vec
        const result = await connection.raw(
          `SELECT id, vec_distance_cosine(embedding, ?) as distance 
             FROM ${tableName} 
             WHERE embedding IS NOT NULL
             ORDER BY distance ASC 
             LIMIT ?`,
          [vectorStr, limit]
        );
        return result.map((r) => ({
          ...r,
          score: 1.0 - (r.distance || 0),
        }));
      } else {
        const vectorStrPg = `[${vector.join(',')}]`;
        const result = await connection.raw(
          `SELECT id, 1 - ((embedding::text)::vector <=> ?) as score 
               FROM ${tableName} 
               ORDER BY ((embedding::text)::vector <=> ?) ASC 
               LIMIT ?`,
          [vectorStrPg, vectorStrPg, limit]
        );
        return result.rows || result;
      }
    } catch (err) {
      strapi.log.error(`Vector Service (${uid}) Failed:`, err);
      // strapi.log.error('Details:', JSON.stringify(err, null, 2));
      return [];
    }
  },
});
