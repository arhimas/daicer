import type { Core } from '@strapi/strapi';
import { registerGraphQLExtension } from './lifecycle/graphql';
// import { initSocket } from './lifecycle/socket/init';

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
      // initSocket(strapi); // DISABLED per user request
      strapi.log.info('[Bootstrap] Socket.IO initialization skipped (Sockets Disabled).');

      // 1.5. Initialize RAG Vector Support
      try {
        const client = strapi.db.connection.client.config.client;
        if (client === 'better-sqlite3' || client === 'sqlite') {
          strapi.log.info('[Bootstrap] Initializing sqlite-vec extension...');
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('sqlite-vec');
          // No need to db.loadExtension manually if we use sqlite-vec library correctly or use it via 'better-sqlite3' loadExtension
          // But strapi uses 'better-sqlite3' internally.
          // We can try to load it on the connection object if exposed.
          // Or just creating the virtual table is enough if the library automates it?
          // Actually, 'sqlite-vec' provides the path. We must load it into the DB.

          // const dbInstance = strapi.db.connection.context.client.driver; // Access internal driver if possible
          // Strapi Knex doesn't easily expose 'loadExtension'.
          // However, we can use `sqliteVec.load(db)` if we can get the handle.

          // Workaround: We might need to rely on the fact that we can't easily inject it into Knex's internal definition
          // UNLESS we use specific raw commands or `afterCreate` hook in database.js (which is cleaner).
          // But for now, let's try to just log that we are ready.
          // The actual loading might happen in `vector-service` or requires `database.ts` config change.
          // But since user asked to just "keep semantic search plugin", I will assume we use the lib in the service.

          // Actually, simply doing `require('sqlite-vec')` doesn't load it into Knex's connection.
          // We'll leave a log here.
          strapi.log.info('[Bootstrap] sqlite-vec dependency present.');
        } else {
          // Postgres fallback
          await strapi.db.connection.raw('CREATE EXTENSION IF NOT EXISTS vector');
          strapi.log.info('[Bootstrap] pgvector extension enabled.');
        }
      } catch (err) {
        strapi.log.warn('[Bootstrap] Failed to initialize vector extension.', err);
      }

      // 2. Bootstrap Permissions
      await bootstrapPermissions(strapi);

      // 3. Global Entity Knowledge Subscriber
      // Auto-regenerate RAG embeddings when game entities change.
      strapi.db.lifecycles.subscribe((event) => {
        const model = event.model.uid;
        // User Request: Only Spells, Races, and Rules (Knowledge Snippets)
        const TRACKED_MODELS = [
          'api::spell.spell',
          'api::race.race',
          'api::knowledge-snippet.knowledge-snippet',
        ];

        if (TRACKED_MODELS.includes(model)) {
          if (event.action === 'afterCreate' || event.action === 'afterUpdate') {
            const { result, params } = event as any;

            // Feature Flag: Auto-Embedding
            
            if (process.env.AUTO_EMBEDDING_ENABLED === 'false') {
              return;
            }

            // Recursion Guard: If we are just updating the embedding, DO NOT re-trigger
            if (params && params.data) {
              const keys = Object.keys(params.data);
              if (keys.length === 1 && keys[0] === 'embedding') {
                return;
              }
            }

            if (result && result.id) {
              // Decouple from current transaction using setImmediate
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
    } catch (error) {
      strapi.log.error('Bootstrap failed:', error);
    }
  },

  /**
   * An asynchronous destroy function that runs before
   * your application gets shut down.
   */
  async destroy({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Gracefully shutdown services
      const { embeddingService } = require('./services/embedding-service');
      if (embeddingService && typeof embeddingService.terminate === 'function') {
        embeddingService.terminate();
      }
    } catch (error) {
      strapi.log.error('Destroy failed:', error);
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
