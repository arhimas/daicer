'use strict';

module.exports = ({ strapi }) => ({
  /**
   * Search Manual Knowledge Snippets using PGVector
   * @param {number[]} vector - 1536d vector
   * @param {number} limit
   */
  async searchManual(vector, limit = 5) {
    const vectorStr = `[${vector.join(',')}]`;

    try {
      // Searching 'knowledge_sources' directly as requested.
      // Explicit cast: ((embedding::text)::vector) handles the JSONB -> Vector conversion.
      // Search Knowledge Snippets and JOIN Source
      // Strapi v5 link table: knowledge_snippets_source_lnk
      const result = await strapi.db.connection.raw(
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
    } catch (err) {
      strapi.log.error('Vector Service (Manual Sources) Failed:', err.message);
      return [];
    }
  },

  /**
   * Search an specific Entity Table using PGVector
   * @param {string} uid - Model UID (api::spell.spell)
   * @param {number[]} vector
   * @param {number} limit
   */
  async searchEntity(uid, vector, limit = 5) {
    const vectorStr = `[${vector.join(',')}]`;
    const meta = strapi.db.metadata.get(uid);
    const tableName = meta.tableName;

    try {
      const result = await strapi.db.connection.raw(
        `SELECT id, 1 - ((embedding::text)::vector <=> ?) as score 
             FROM ${tableName} 
             ORDER BY ((embedding::text)::vector <=> ?) ASC 
             LIMIT ?`,
        [vectorStr, vectorStr, limit]
      );
      return result.rows || result;
    } catch (err) {
      strapi.log.error(`Vector Service (${uid}) Failed:`, err);
      strapi.log.error('Details:', JSON.stringify(err, null, 2)); // Log detailed error object
      return [];
    }
  },

  // Future: Add `ensureExtension()` to check for pgvector?
});
