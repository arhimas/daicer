/**
 * Service to sync Game Entities (Class, Spell, Monster, etc.) to the Knowledge Base.
 * It converts the Entity into a formatted Markdown KnowledgeSource with Tags.
 */

import type { Core } from '@strapi/strapi';

declare let strapi: Core.Strapi;

import { EMBEDDABLE_MODELS } from '../config/embedding';

const ENTITY_UIDS = EMBEDDABLE_MODELS;

// import { entityToMarkdown } from '../utils/entity-markdown'; // Commented out until utils restored
const entityToMarkdown = (type: string, name: string, data: unknown) => JSON.stringify(data, null, 2); // Stub fallback

export class EntityKnowledgeService {
  /**
   * Syncs one specific entity to a KnowledgeSource.
   * If the entity is deleted, we should delete the source (handled by logic outside or by clearing here).
   */
  async syncEntity(uid: string, entityId: number | string) {
    if (!ENTITY_UIDS.includes(uid)) return;

    // 1. Fetch Entity with ALL relations populated
    let entity;

    // Strapi 5 Logic: Handle Document ID vs ID
    if (typeof entityId === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entity = await strapi.documents(uid as any).findOne({
        documentId: entityId,
        populate: '*',
      });
    } else {
      // Fallback for ID (though documents API prefers documentId, findOne can filter by id if we use where?)
      // documents().findOne({ documentId }) is standard. If we have ID, we might need a filter.
      // But entityService.findOne(uid, id) works for ID.
      // Let's try documents first if string, else entityService?
      // Actually, converting to documents API fully is safer for V5.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [found] = await strapi.documents(uid as any).findMany({
        filters: { id: entityId },
        populate: '*',
        limit: 1,
      });
      entity = found;
    }

    if (!entity) {
      // Fallback or not found
      // strapi.log.warn(`[EntityEmbeddings] Entity not found: ${uid}:${entityId}`);
      return;
    }

    // 2. Classify & Generate Content
    const typeName = uid.split('.')[1]; // 'class', 'spell', 'knowledge-snippet'
    
    let embeddingText = '';

    if (uid === 'api::knowledge-snippet.knowledge-snippet') {
       // CODE SNIPPET HANDLING
       // Raw content is key for RAG on code.
       const snippet = entity as any;
       embeddingText = `Code Snippet: ${snippet.title}\n${snippet.content}`;
    } else {
       // GAME ENTITY HANDLING
       const name = (entity.name as string) || (entity.title as string) || `Entity ${entityId}`;
       // Standardize Tags
       const tags = [typeName, 'Game Entity'];
       const typedEntity = entity as any;
       // Try to extract extra context for tags
       if (typedEntity.level) tags.push(`Level ${typedEntity.level}`);
       if (typedEntity.school && typedEntity.school.name) tags.push(typedEntity.school.name);
       if (typedEntity.class && typedEntity.class.name) tags.push(typedEntity.class.name);

       const markdown = entityToMarkdown(typeName, name, entity as Record<string, unknown>);
       embeddingText = `${typeName}: ${name}\n${entity.description || ''}\n${tags.join(', ')}\n${markdown}`;
    }

    // 2.5 Generate Embedding (Core Embeddings Mandate)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { embeddingService } = require('./embedding-service');
      const embeddingVector = await embeddingService.generateEmbedding(embeddingText);

      // Save Embedding using DB Query to bypass hooks loop
      // We must match the correct ID column.
      if (typeof entityId === 'string') {
        // Document ID update
        // db.query().update() needs 'where' clause matching database columns.
        // In Strapi 5, document_id is the column usually.
        // SAFE BET: First get the PK (ID) if we have the entity object from above.
        if (entity.id) {
          await strapi.db.query(uid).update({
            where: { id: entity.id },
            data: { embedding: embeddingVector },
          });
        }
      } else {
        // ID update
        await strapi.db.query(uid).update({
          where: { id: entityId },
          data: { embedding: embeddingVector },
        });
      }

      strapi.log.info(`[EntityEmbeddings] Saved embedding for ${uid}:${entityId}`);
    } catch (err) {
      strapi.log.warn(`[EntityEmbeddings] Failed to save embedding to entity ${uid}:${entityId}`, err);
    }
  }
}

export const entityKnowledgeService = new EntityKnowledgeService();
