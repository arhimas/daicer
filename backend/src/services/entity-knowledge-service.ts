/**
 * Service to sync Game Entities (Class, Spell, Monster, etc.) to the Knowledge Base.
 * It converts the Entity into a formatted Markdown KnowledgeSource with Tags.
 */

import type { Core } from '@strapi/strapi';

declare let strapi: Core.Strapi;

const ENTITY_UIDS = [
  'api::character.character',
  'api::class.class',
  'api::damage-type.damage-type',
  'api::equipment.equipment',
  'api::equipment-category.equipment-category',
  'api::feature.feature',
  'api::language.language',
  'api::magic-item.magic-item',
  'api::magic-school.magic-school',
  'api::monster.monster',
  'api::proficiency.proficiency',
  'api::race.race',
  'api::spell.spell',
  'api::subclass.subclass',
  'api::trait.trait',
  'api::weapon-property.weapon-property',
];

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
    const name = entity.name || entity.title || `Entity ${entityId}`;

    // Standardize Tags
    // Tag 1: Precise Type (Spell)
    // Tag 2: Broad Category (Game Entity)
    // Tag 3: Properties (e.g. "Level 3", "Evocation" if available in fields?)
    const tags = [typeName, 'Game Entity'];

    // Try to extract extra context for tags
    if (entity.level) tags.push(`Level ${entity.level}`);
    if (entity.school && entity.school.name) tags.push(entity.school.name);
    if (entity.class && entity.class.name) tags.push(entity.class.name);

    const markdown = this.generateMarkdown(typeName, name, entity);

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

  private generateMarkdown(type: string, name: string, data: Record<string, unknown>): string {
    // Basic structured dump
    // We filter out system fields (createdAt, etc) to keep it clean?
    // Or just dump it all safely.

    // Header
    let md = `# ${name}\n\n`;
    md += `**Type**: ${type}\n`;

    if (data.description) {
      md += `\n**Description**:\n${data.description}\n\n`;
    }

    // Specific field handling for better readability
    // Stats block?
    md += `## Data Properties\n`;

    for (const key in data) {
      if (
        [
          'id',
          'documentId',
          'createdAt',
          'updatedAt',
          'publishedAt',
          'createdBy',
          'updatedBy',
          'name',
          'description',
          'embedding',
          'password',
          'resetPasswordToken',
          'confirmationToken',
        ].includes(key)
      )
        continue;

      const value = data[key];
      if (value === null || value === undefined) continue;

      const valCheck = value as { name?: string };
      if (typeof valCheck === 'object' && valCheck !== null) {
        if (Array.isArray(value)) {
          // List of relations
          const list = value as { name?: string }[];
          if (list.length > 0 && list[0].name) {
            md += `- **${key}**: ${list.map((v) => v.name).join(', ')}\n`;
          } else if (list.length === 0) {
            continue;
          } else {
            md += `- **${key}**: ${JSON.stringify(value)}\n`;
          }
        } else {
          // Single relation
          if (valCheck.name) {
            md += `- **${key}**: ${valCheck.name}\n`;
          } else {
            md += `- **${key}**: JSON Object\n`;
          }
        }
      } else {
        md += `- **${key}**: ${value}\n`;
      }
    }

    return md;
  }
}

export const entityKnowledgeService = new EntityKnowledgeService();
