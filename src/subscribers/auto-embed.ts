import { Core } from '@strapi/strapi';
import { QueueManager } from '../queues/queue-manager';
import { QueueName } from '../queues/contract';
import { EMBEDDABLE_MODELS } from '../config/embedding';

interface LifecycleEvent {
  model: { uid: string };
  action: string;
  params: { data?: Record<string, unknown> };
  result?:
    | { id?: number; documentId?: string; ids?: (number | string)[] }
    | Array<{ id?: number; documentId?: string }>;
}

export const registerAutoEmbeddingSubscriber = (strapi: Core.Strapi) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strapi.db.lifecycles.subscribe((event: any) => {
    const typedEvent = event as LifecycleEvent;
    const model = typedEvent.model.uid;

    const action = typedEvent.action;
    const params = typedEvent.params;
    const result = typedEvent.result;

    if (!EMBEDDABLE_MODELS.includes(model)) {
      return;
    }

    if (process.env.AUTO_EMBEDDING_ENABLED === 'false') {
      return;
    }

    // Recursion Guard
    if (action === 'afterUpdate' && params && params.data) {
      const keys = Object.keys(params.data);
      if (
        keys.every((k) => k === 'embedding' || k === 'embeddingMetadata' || k === 'updatedAt' || k === 'publishedAt')
      ) {
        return;
      }
    }

    const queueJob = (id: string | number, act: 'upsert' | 'delete') => {
      const entityId = id;
      QueueManager.get()
        .add(QueueName.EMBEDDING, `${act}-${model}-${entityId}-${Date.now()}`, {
          entityType: model,
          entityId: entityId,
          action: act,
          sourceType: model === 'api::knowledge-source.knowledge-source' ? 'manual' : 'game-entity',
        })
        .catch((err) => strapi.log.error(`[AutoEmbed] Failed to queue job: ${err.message}`));
    };

    if (action === 'afterCreate' || action === 'afterUpdate') {
      if (result) {
        if (Array.isArray(result)) {
          // Handle bulk results if Strapi sends them (rare in core, but possible)
          result.forEach((item) => {
            if (item.id || item.documentId) queueJob(item.documentId || item.id, 'upsert');
          });
        } else {
          // Single Result
          if (result.id || result.documentId) {
            queueJob(result.documentId || result.id, 'upsert');
          }
        }
      }
    } else if (action === 'afterDelete') {
      if (result) {
        if (!Array.isArray(result) && (result.id || result.documentId)) {
          queueJob(result.documentId || result.id, 'delete');
        }
      }
    } else if (action === 'afterCreateMany') {
      if (result) {
        // createMany result is usually { count: n, ids: [] } but strictly typing it is hard.
        // We check for 'ids' property existence.
        if ('ids' in result && Array.isArray((result as { ids: unknown[] }).ids)) {
          const resultWithIds = result as { ids: (string | number)[] };
          resultWithIds.ids.forEach((id) => queueJob(id, 'upsert'));
        } else if (Array.isArray(result)) {
          // Fallback if result IS the array of created items
          result.forEach((item) => {
            if (item.id || item.documentId) queueJob(item.documentId || item.id, 'upsert');
          });
        }
      }
    }
  });
};
