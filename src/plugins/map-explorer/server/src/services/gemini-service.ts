import { Core } from '@strapi/strapi';
import { GeminiService, StrapiAdapter, LLMCoreConfig } from '../../../../../libs/llm-core/src'; // Relative import for monorepo internal use until built
// In a real published scenario, this would be '@daicer/llm-core'

export default ({ strapi }: { strapi: Core.Strapi }) => {
  
  // 1. Define Adapter
  const adapter: StrapiAdapter = {
    log: strapi.log,
    db: strapi.db,
    getModel: (uid) => strapi.getModel(uid),
    // Custom fetcher for Map Explorer's deep context
    fetchContext: async (uid, documentId) => {
        return await strapi
          .plugin('map-explorer')
          .service('contextService')
          .fetchDeepContext(uid, documentId);
    }
  };

  // 2. Define Config
  const config: LLMCoreConfig = {
      contentTypes: strapi.plugin('map-explorer').config('contentTypes')
  };

  // 3. Initialize Core Service
  return GeminiService({ adapter, config });
};
