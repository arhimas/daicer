/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */

/**
 * Locale Generator Controller
 *
 * Handles manual triggering of locale generation for selected entities.
 * Designed to be called from the Strapi Admin Bulk Actions.
 */
import { QueueManager } from '../../../queues/queue-manager';
import { QueueName } from '../../../queues/contract';

export default ({ strapi: _strapi }) => ({
  /**
   * Generates locales for a list of entities via Queues.
   * POST /api/game/generate-locales
   */
  async generateLocales(ctx) {
    const { contentType, documentIds, locales = ['pt', 'es'] } = ctx.request.body;

    if (!contentType || !documentIds || !Array.isArray(documentIds)) {
      return ctx.badRequest('Invalid payload. Expected contentType and documentIds array.');
    }

    const report = {
      enqueued: 0,
      failed: 0,
      errors: [] as string[],
    };

    let queueManager: QueueManager;
    try {
      queueManager = QueueManager.get();
    } catch {
      // Fallback or Error if queues are not enabled
      return ctx.badRequest('QueueManager not available. Ensure Redis is configured and queues enabled.');
    }

    for (const documentId of documentIds) {
      try {
        await queueManager.add(QueueName.TRANSLATE_ENTITY, `translate-${contentType}-${documentId}`, {
          contentType,
          documentId,
          targetLocales: locales,
        });
        report.enqueued++;
      } catch (err) {
        console.error(`Failed to enqueue translation for ${documentId}:`, err);
        report.failed++;
        const msg = err instanceof Error ? err.message : String(err);
        report.errors.push(`Error enqueueing ${documentId}: ${msg}`);
      }
    }

    return {
      message: `Enqueued ${report.enqueued} jobs.`,
      report,
    };
  },
});
