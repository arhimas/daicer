/**
 * Service to sync Game Entities (Class, Spell, Monster, etc.) to the Knowledge Base.
 * It converts the Entity into a formatted Markdown KnowledgeSource with Tags.
 */

import type { Core } from '@strapi/strapi';

declare let strapi: Core.Strapi;

import { EMBEDDABLE_MODELS } from '../config/embedding';

const ENTITY_UIDS = EMBEDDABLE_MODELS;

// import { entityToMarkdown } from '../utils/entity-markdown'; // Commented out until utils restored
const entityToMarkdown = (type: string, name: string, data: any) => JSON.stringify(data, null, 2); // Stub fallback

export class EntityKnowledgeService {
  /**
   * Syncs one specific entity to a KnowledgeSource.
   * If the entity is deleted, we should delete the source (handled by logic outside or by clearing here).
   */
  async syncEntity(uid: string, entityId: number | string) {
    if (!ENTITY_UIDS.includes(uid)) return;

    // 1. Fetch Entity with ALL relations populated
    // We use a wildcard populate or a deep generic populate strategy?
    // For now, populate: '*' is decent, but deep nesting might require more.
    // Strapi 5 might support 'on' or deep populate plugins, but let's stick to standard '*' for level 1
    // and maybe specific fields if needed. For now '*' + 1 level deep is usually enough for context.
    const entity = await strapi.entityService.findOne(uid as `api::${string}.${string}`, entityId, {
      populate: '*',
    });

    if (!entity) return;

    // 2. Generate Markdown Content
    const typeName = uid.split('.')[1]; // 'class', 'spell'
    const name = (entity.name as string) || (entity.title as string) || `Entity ${entityId}`;

    // Standardize Tags
    // Tag 1: Precise Type (Spell)
    // Tag 2: Broad Category (Game Entity)
    // Tag 3: Properties (e.g. "Level 3", "Evocation" if available in fields?)
    const tags = [typeName, 'Game Entity'];

    const typedEntity = entity as any; // Safe cast for optional checks

    // Try to extract extra context for tags
    if (typedEntity.level) tags.push(`Level ${typedEntity.level}`);
    if (typedEntity.school && typedEntity.school.name) tags.push(typedEntity.school.name);
    if (typedEntity.class && typedEntity.class.name) tags.push(typedEntity.class.name);

    const markdown = entityToMarkdown(typeName, name, entity as Record<string, unknown>);

    // 2.5 Generate Embedding for Entity Record (Core Embeddings Mandate)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { embeddingService } = require('./embedding-service');
      // Create a rich representation for the vector
      const embeddingText = `${typeName}: ${name}\n${entity.description || ''}\n${tags.join(', ')}\n${markdown}`;

      const embeddingVector = await embeddingService.generateEmbedding(embeddingText);

      // Usage of db.query bypasses lifecycle hooks by default in Strapi v4/v5 unless specified otherwise.
      // This prevents infinite loop with our Global Subscriber.
      await strapi.db.query(uid).update({
        where: { id: entityId },
        data: { embedding: embeddingVector },
      });
      strapi.log.info(`[EntityEmbeddings] Saved embedding for ${uid}:${entityId}`);
    } catch (err) {
      strapi.log.warn(`[EntityEmbeddings] Failed to save embedding to entity ${uid}:${entityId}`, err);
    }
  }

}

export const entityKnowledgeService = new EntityKnowledgeService();
