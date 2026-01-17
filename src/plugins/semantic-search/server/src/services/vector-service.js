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
    const vectorStr = JSON.stringify(vector);
    const connection = strapi.db.connection;
    const client = connection.client.config.client;

    // Resolve Table Names dynamically
    const snippetMeta = strapi.db.metadata.get('api::knowledge-snippet.knowledge-snippet');
    const sourceMeta = strapi.db.metadata.get('api::knowledge-source.knowledge-source');
    
    const snippetTable = snippetMeta.tableName;
    const sourceTable = sourceMeta.tableName;

    // Find the foreign key column for 'source' relation in snippet table
    const sourceAttr = snippetMeta.attributes.source;
    
    // Check if we use a Link Table or a Join Column
    let joinTable = null;

    let linkSnippetCol = 'knowledge_snippet_id';
    let linkSourceCol = 'knowledge_source_id';

    if (sourceAttr.joinTable) {
        joinTable = sourceAttr.joinTable.name;
        linkSnippetCol = sourceAttr.joinTable.joinColumn.name;
        linkSourceCol = sourceAttr.joinTable.inverseJoinColumn.name;
    } else if (sourceAttr.joinColumn) {
        // Fallback to FK on table (if it existed)
        // But debug showed it misses.
    }

    try {
      if (client === 'better-sqlite3' || client === 'sqlite') {
        let query = connection(snippetTable)
          .select([
            `${snippetTable}.id`,
            `${snippetTable}.content`,
            `${snippetTable}.title`,
            `${sourceTable}.name as source_name`,
            `${sourceTable}.id as source_id`,
            connection.raw('vec_distance_cosine(??, ?) as distance', [`${snippetTable}.embedding`, vectorStr])
          ]);

        if (joinTable) {
           query = query
            .leftJoin(joinTable, `${snippetTable}.id`, `${joinTable}.${linkSnippetCol}`)
            .leftJoin(sourceTable, `${joinTable}.${linkSourceCol}`, `${sourceTable}.id`);
        } else {
           // Fallback to expecting a column on snippet table (unlikely given debug)
           const colName = sourceAttr.joinColumn ? sourceAttr.joinColumn.name : 'source_id';
           query = query.leftJoin(sourceTable, `${snippetTable}.${colName}`, `${sourceTable}.id`);
        }

        const result = await query
          .whereNotNull(`${snippetTable}.embedding`)
          .orderBy('distance', 'asc')
          .limit(limit);

        return result.map((r) => ({
          ...r,
          score: 1.0 - (r.distance || 0),
        }));
      } else {
        // Postgres / PGVector Fallback
        const vectorStrPg = `[${vector.join(',')}]`;
        let query = connection(snippetTable)
          .select([
            `${snippetTable}.id`,
            `${snippetTable}.content`,
            `${snippetTable}.title`,
            `${sourceTable}.name as source_name`,
            `${sourceTable}.id as source_id`,
            connection.raw('1 - ((??::text)::vector <=> ?) as score', [`${snippetTable}.embedding`, vectorStrPg])
          ]);

        if (joinTable) {
            query = query
             .leftJoin(joinTable, `${snippetTable}.id`, `${joinTable}.${linkSnippetCol}`)
             .leftJoin(sourceTable, `${joinTable}.${linkSourceCol}`, `${sourceTable}.id`);
         } else {
            const colName = sourceAttr.joinColumn ? sourceAttr.joinColumn.name : 'source_id';
            query = query.leftJoin(sourceTable, `${snippetTable}.${colName}`, `${sourceTable}.id`);
         }

        const result = await query
          .whereNotNull(`${snippetTable}.embedding`)
          .orderBy('score', 'desc') 
          .limit(limit);
          
        return result;
      }
    } catch (err) {
      strapi.log.error('Vector Service (Manual Sources) Failed:', err.message);
      // Re-throw or log full error for debugging if needed
      strapi.log.error(err);
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
        const result = await connection(tableName)
          .select([
            'id',
            connection.raw('vec_distance_cosine(embedding, ?) as distance', [vectorStr])
          ])
          .whereNotNull('embedding')
          .orderBy('distance', 'asc')
          .limit(limit);

        return result.map((r) => ({
          ...r,
          score: 1.0 - (r.distance || 0),
        }));
      } else {
        const vectorStrPg = `[${vector.join(',')}]`;
        const result = await connection(tableName)
          .select([
            'id',
            connection.raw('1 - ((embedding::text)::vector <=> ?) as score', [vectorStrPg])
          ])
          .orderByRaw('((embedding::text)::vector <=> ?) ASC', [vectorStrPg])
          .limit(limit);

        return result;
      }
    } catch (err) {
      strapi.log.error(`Vector Service (${uid}) Failed:`, err.message);
      return [];
    }
  },
});
