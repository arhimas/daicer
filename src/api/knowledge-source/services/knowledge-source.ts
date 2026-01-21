/**
 * knowledge-source service
 */

import { factories } from '@strapi/strapi';
import { chunkMarkdown } from '../../../shared';

// Service
export default factories.createCoreService('api::knowledge-source.knowledge-source', ({ strapi }) => ({
  /**
   * Syncs a Knowledge Source: Chunks content -> Creates Snippets
   * Embeddings are generated asynchronously via the 'auto-embed' subscriber.
   * @param sourceId ID of the Knowledge Source
   */
  async sync(sourceId: number) {
    try {
      // 1. Fetch Source
      const source = await strapi.entityService.findOne('api::knowledge-source.knowledge-source', sourceId, {
        populate: ['tags']
      }) as unknown as { content: string; name: string; tags?: { name: string }[] };
      if (!source) throw new Error(`Knowledge Source ${sourceId} not found`);

      const { content, name, tags } = source;
      strapi.log.info(`[KnowledgeSource] Processing source ${name} (ID: ${sourceId})...`);

      // 2. Chunk Markdown
      const chunks = await chunkMarkdown(content);
      strapi.log.info(`[KnowledgeSource] Generated ${chunks.length} chunks.`);

      // 3. Delete existing snippets for this source (Wipe & Replace strategy)
      await strapi.db.query('api::knowledge-snippet.knowledge-snippet').deleteMany({
        where: { source: sourceId },
      });

      // 4. Create Snippets (Async Embedding via Lifecycle)
      let processedCount = 0;
      const totalChunks = chunks.length;
      const startTime = Date.now();

      // We still use chunks to avoid overwhelming the DB if massive, but sequential is fine for creation usually.
      // Or simple Promise.all with concurrency limit if needed. 
      // Given Strapi DB pool, let's just do a simple loop or small batches.
      // Using a simple loop for clarity and stability.
      
      for (const chunk of chunks) {
        if (chunk.content.length < 10) continue;

        // Inject Tags Context
        const tagArray = tags ? tags.map(t => t.name) : [];
        const tagContext = tagArray.length > 0 ? `[Tags: ${tagArray.join(', ')}]\n` : '';
        const finalContent = tagContext + chunk.content;

        await strapi.entityService.create('api::knowledge-snippet.knowledge-snippet', {
          data: {
            title: chunk.title,
            content: finalContent,
            source: sourceId,
            sourceType: 'manual', // Required by schema
            // embedding: null, // Implicitly null, auto-embed will pick it up
          },
        });
        processedCount++;
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      strapi.log.info(`[KnowledgeSource] DONE. Created ${processedCount}/${totalChunks} snippets in ${totalTime}s. (Embeddings queued)`);
    } catch (error) {
      strapi.log.error('[KnowledgeSource] Sync failed:', error);
      throw error;
    }
  },
}));
