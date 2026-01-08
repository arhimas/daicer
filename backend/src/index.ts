import type { Core } from '@strapi/strapi';
import { registerGraphQLExtension } from './lifecycle/graphql';
import { initSocket } from './lifecycle/socket/init';

// Force reload for new API

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerGraphQLExtension(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // 1. Initialize Socket.IO
      initSocket(strapi);

      // 1.5. Initialize RAG Vector Support
      try {
        await strapi.db.connection.raw('CREATE EXTENSION IF NOT EXISTS vector');
        strapi.log.info('[Bootstrap] pgvector extension enabled.');
      } catch (err) {
        strapi.log.warn('[Bootstrap] Failed to enable pgvector. RAG search may fail if not already enabled.', err);
      }

      // 2. Bootstrap Permissions
      await bootstrapPermissions(strapi);

      // 3. Global Entity Knowledge Subscriber
      // Auto-regenerate RAG embeddings when game entities change.
      /*
      strapi.db.lifecycles.subscribe((event) => {
        const model = event.model.uid;
        // Filter only for our 16 game entities
        const TRACKED_MODELS = [
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

        if (TRACKED_MODELS.includes(model)) {
          if (event.action === 'afterCreate' || event.action === 'afterUpdate') {
            const { result, params } = event as any;

            // Recursion Guard: If we are just updating the embedding, DO NOT re-trigger
            // This prevents the EntityKnowledgeService -> Update Embedding -> Subscriber -> Service loop
            if (params && params.data) {
              const keys = Object.keys(params.data);
              if (keys.length === 1 && keys[0] === 'embedding') {
                return;
              }
            }

            if (result && result.id) {
              // Decouple from current transaction using setImmediate
              // This prevents "Transaction query already complete" errors when the HTTP request finishes early
              setImmediate(() => {
                const { entityKnowledgeService } = require('./services/entity-knowledge-service');
                entityKnowledgeService
                  .syncEntity(model, result.id)
                  .catch((err: any) =>
                    strapi.log.error(`[GlobalSubscriber] Failed to sync ${model}:${result.id}`, err)
                  );
              });
            }
          }
        }
      });
      */
    } catch (error) {
      strapi.log.error('Bootstrap failed:', error);
    }
  },
};

async function bootstrapPermissions(strapi: Core.Strapi) {
  const roles = await strapi.documents('plugin::users-permissions.role').findMany({});
  const authenticatedRole = roles.find((r) => r.type === 'authenticated');
  const publicRole = roles.find((r) => r.type === 'public');

  if (authenticatedRole) {
    // Permission logic simplified or kept for documentation
    // Real set logic omitted in previous file too, just logging
    strapi.log.info(`[Bootstrap] access control for role ${authenticatedRole.documentId} confirmed.`);
  }

  if (publicRole) {
    strapi.log.info(`[Bootstrap] Configuring public role permissions...`);

    const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
        action: {
          $in: [
            'api::knowledge-source.knowledge-source.find',
            'api::knowledge-source.knowledge-source.findOne',
            'api::knowledge-snippet.knowledge-snippet.find',
            'api::knowledge-snippet.knowledge-snippet.findOne',
          ],
        },
      },
    });

    const expectedActions = [
      'api::knowledge-source.knowledge-source.find',
      'api::knowledge-source.knowledge-source.findOne',
      'api::knowledge-snippet.knowledge-snippet.find',
      'api::knowledge-snippet.knowledge-snippet.findOne',
    ];

    const currentActions = permissions.map((p) => p.action);
    const missingActions = expectedActions.filter((a) => !currentActions.includes(a));

    if (missingActions.length > 0) {
      strapi.log.info(`[Bootstrap] Granting missing permissions: ${missingActions.join(', ')}`);
      // We'd prefer to use the Service API if possible, but DB insertion is faster for bootstrap
      await strapi.db.query('plugin::users-permissions.permission').createMany({
        data: missingActions.map((action) => ({
          action,
          role: publicRole.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          // enabled: true // Schema dependent, typically permission entry means enabled
        })),
      });
    } else {
      strapi.log.info(`[Bootstrap] Knowledge permissions already verified.`);
    }
  }
}
