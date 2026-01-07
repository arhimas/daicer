/**
 * knowledge-source service
 */

import { factories } from '@strapi/strapi';
import { embeddingService } from '../../../services/embedding-service';
import { chunkMarkdown } from '../../../shared';

// Service
export default factories.createCoreService('api::knowledge-source.knowledge-source', ({ strapi }) => ({
  /**
   * Syncs a Knowledge Source: Chunks content -> Generates Embeddings -> Creates Snippets
   * @param sourceId ID of the Knowledge Source
   */
  async sync(sourceId: number) {
    try {
      // 1. Fetch Source
      const source = await strapi.entityService.findOne('api::knowledge-source.knowledge-source', sourceId);
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

      // 4. Generate Embeddings & Create Snippets
      strapi.log.info(`[KnowledgeSource] Starting parallel embedding generation for ${chunks.length} chunks...`);

      // High concurrency for speed (OpenAI tier permitting)
      const limit = (await import('p-limit')).default(16);

      let processedCount = 0;
      const totalChunks = chunks.length;
      const startTime = Date.now();

      const tasks = chunks.map((chunk) => {
        return limit(async () => {
          if (chunk.content.length < 10) return;

          try {
            const embedding = await embeddingService.generateEmbedding(chunk.content);

            // Inject Tags Context
            const tagContext = tags && tags.length > 0 ? `[Tags: ${tags.join(', ')}]\n` : '';
            const finalContent = tagContext + chunk.content;

            await strapi.entityService.create('api::knowledge-snippet.knowledge-snippet', {
              data: {
                title: chunk.title,
                content: finalContent,
                source: sourceId,
                embedding: embedding,
              },
            });

            processedCount++;

            // Log progress every 16 chunks
            if (processedCount % 16 === 0 || processedCount === totalChunks) {
              const elapsedSeconds = (Date.now() - startTime) / 1000;
              const chunksPerSec = processedCount / Math.max(elapsedSeconds, 0.001);
              const remaining = totalChunks - processedCount;
              const etaSeconds = chunksPerSec > 0 ? Math.ceil(remaining / chunksPerSec) : 0;
              const percent = Math.round((processedCount / totalChunks) * 100);

              strapi.log.info(
                `[KnowledgeSource] ${percent}% (${processedCount}/${totalChunks}) | ` +
                  `Speed: ${chunksPerSec.toFixed(1)} c/s | ` +
                  `ETA: ${etaSeconds}s`
              );
            }
          } catch (err: unknown) {
            strapi.log.error(`[KnowledgeSource] Failed to process chunk: ${chunk.title}`, err);
          }
        });
      });

      await Promise.all(tasks);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      strapi.log.info(`[KnowledgeSource] DONE. Synced ${processedCount}/${totalChunks} snippets in ${totalTime}s.`);
    } catch (error) {
      strapi.log.error('[KnowledgeSource] Sync failed:', error);
      throw error;
    }
  },
}));
