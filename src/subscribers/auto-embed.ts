import { Core } from '@strapi/strapi';
import { QueueManager } from '../queues/queue-manager';
import { QueueName } from '../queues/contract';
import { EMBEDDABLE_MODELS } from '../config/embedding';

export const registerAutoEmbeddingSubscriber = (strapi: Core.Strapi) => {
  strapi.db.lifecycles.subscribe((event) => {
    const model = event.model.uid;
    
    // Using simple casting because TS might not infer event type perfectly in callback
    const action = event.action;
    const params = (event as any).params;
    const result = (event as any).result;

    if (!EMBEDDABLE_MODELS.includes(model)) {
      return;
    }

    if (process.env.AUTO_EMBEDDING_ENABLED === 'false') {
      return;
    }

    // Recursion Guard
    if (action === 'afterUpdate' && params && params.data) {
      const keys = Object.keys(params.data);
      if (keys.every(k => k === 'embedding' || k === 'embeddingMetadata' || k === 'updatedAt' || k === 'publishedAt')) {
         return;
      }
    }

    const queueJob = (id: string | number, act: 'upsert' | 'delete') => {
        const entityId = id;
        QueueManager.get().add(QueueName.EMBEDDING, `${act}-${model}-${entityId}-${Date.now()}`, {
           entityType: model,
           entityId: entityId,
           action: act,
           sourceType: model === 'api::knowledge-source.knowledge-source' ? 'manual' : 'game-entity'
         }).catch(err => strapi.log.error(`[AutoEmbed] Failed to queue job: ${err.message}`));
    };

    if (action === 'afterCreate' || action === 'afterUpdate') {
      if (result) {
         if (Array.isArray(result)) {
             // Handle bulk results if Strapi sends them (rare in core, but possible)
             result.forEach(item => {
                 if (item.id || item.documentId) queueJob(item.documentId || item.id, 'upsert');
             });
         } else if (result.id || result.documentId) {
             queueJob(result.documentId || result.id, 'upsert');
         }
      }
    } else if (action === 'afterDelete') {
       if (result && (result.id || result.documentId)) {
         queueJob(result.documentId || result.id, 'delete');
       }
    } else if (action === 'afterCreateMany') {
        // Handling bulk creation
        // Note: result might be { count: n, ids: [...] } or just { count: n } depending on adapter.
        // If we have IDs, we queue.
        if (result && Array.isArray(result.ids)) {
            result.ids.forEach((id: any) => queueJob(id, 'upsert'));
        } else if (Array.isArray(result)) {
             result.forEach((item: any) => {
                 if (item.id || item.documentId) queueJob(item.documentId || item.id, 'upsert');
             });
        }
    }
  });
};
