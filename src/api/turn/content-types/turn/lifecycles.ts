import { embeddingService } from '../../../../services/embedding-service';

export default {
  async afterCreate(event) {
    const { result } = event;

    try {
      // Only embed if there is a meaningful summary
      if (result.summary && result.summary.length > 20) {
        // We run this async without awaiting to not block the turn response latency?
        // Risky if process dies. Safer to await if speed allows.
        // Embedding API takes ~200-500ms.
        // Let's await to ensure consistency for now.
        const vector = await embeddingService.generateEmbedding(result.summary);

        const roomRef = typeof result.room === 'object' ? result.room?.documentId : result.room;

        await strapi.documents('api::knowledge-snippet.knowledge-snippet').create({
          data: {
            title: `Turn History: Room ${roomRef} - Turn ${result.turnNumber || result.documentId}`,
            content: `[Type: Memory] [Room: ${roomRef}] [Turn: ${result.turnNumber}]\n${result.summary}`,
            embedding: vector,
            // source is optional
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        });

        strapi.log.info(`[TurnLifecycle] Embedded memory for Turn ${result.documentId}`);
      }
    } catch (err) {
      strapi.log.error(`[TurnLifecycle] Failed to embed turn memory:`, err);
    }
  },
};
