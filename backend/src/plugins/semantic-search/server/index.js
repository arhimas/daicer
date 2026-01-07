'use strict';

const services = require('./src/services');
const controllers = require('./src/controllers');
const routes = require('./src/routes');
const config = require('./src/config');

module.exports = {
  services,
  controllers,
  routes,
  config,

  register({ strapi }) {
    // Register GraphQL Extension if available
    if (strapi.plugin('graphql')) {
      const extensionService = strapi.plugin('graphql').service('extension');
      extensionService.use(({ nexus }) => ({
        types: [
          nexus.extendType({
            type: 'Query',
            definition(t) {
              t.field('semanticSearch', {
                type: 'JSON',
                args: {
                  query: nexus.stringArg(),
                  targets: nexus.list(nexus.stringArg()), // ['spell', 'monster']
                  limit: nexus.intArg(),
                },
                resolve: async (root, args) => {
                  const { query, targets, limit } = args;
                  return await strapi
                    .plugin('semantic-search')
                    .service('searchService')
                    .search({ query, targets, limit: limit || 10 });
                },
              });
            },
          }),
        ],
      }));
    }
  },

  bootstrap({ strapi }) {
    strapi.log.info('Semantic Search Plugin: Bootstrapping...');
    // Register Lifecycle Hooks for Auto-Embedding
    registerEmbeddingLifecycles(strapi);
  },
};

/**
 * Register Lifecycle Hooks for Auto-Embedding
 */
function registerEmbeddingLifecycles(strapi) {
  const contentTypes = {
    'api::knowledge-source.knowledge-source': ['content', 'name'],
    'api::spell.spell': ['name', 'description', 'school', 'level'],
    'api::monster.monster': ['name', 'description', 'biome', 'type'],
    'api::equipment.equipment': ['name', 'description', 'category'],
    'api::class.class': ['name', 'description'],
    'api::race.race': ['name', 'description'],
    'api::feature.feature': ['name', 'description'],
  };

  Object.keys(contentTypes).forEach((uid) => {
    strapi.db.lifecycles.subscribe({
      models: [uid],
      beforeCreate: async (event) => await processDocumentEmbedding(event, 'create', strapi, contentTypes[uid]),
      beforeUpdate: async (event) => await processDocumentEmbedding(event, 'update', strapi, contentTypes[uid]),
    });
    strapi.log.debug(`Registered embedding hook for ${uid}`);
  });
}

async function processDocumentEmbedding(event, action, strapi, fields) {
  const { params } = event;
  const data = params.data;

  // Extract text
  let textContent = '';
  fields.forEach((field) => {
    if (data[field]) textContent += data[field] + ' ';
  });
  textContent = textContent.trim();

  // Low limit for short names, but generally we want rich content
  if (!textContent || textContent.length < 3) return;

  try {
    const embeddingService = strapi.plugin('semantic-search').service('embeddingService');
    const vector = await embeddingService.generateEmbedding(textContent);

    if (vector) {
      data.embedding = vector;
      data.embeddingMetadata = {
        model: 'text-embedding-3-small',
        generatedAt: new Date().toISOString(),
        dimensions: vector.length,
      };
    }
  } catch (e) {
    strapi.log.error(`Auto-Embedding Failed for ${action}:`, e.message);
  }
}
