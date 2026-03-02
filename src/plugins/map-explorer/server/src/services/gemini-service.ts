import type { Core } from '@strapi/strapi';
import { GeminiService, StrapiAdapter, LLMCoreConfig, GenerationConfig } from '@daicer/llm-core';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // 1. Define Adapter
  const adapter: StrapiAdapter = {
    log: strapi.log,
    db: strapi.db,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getModel: (uid) => strapi.getModel(uid as any),
    // Custom fetcher for Map Explorer's deep context
    fetchContext: async (uid, documentId) => {
      return await strapi
        .plugin('map-explorer')
        .service('contextService')
        .fetchDeepContext(uid, documentId);
    },
  };

  // 2. Define Config
  const config: LLMCoreConfig = {
    contentTypes: strapi.plugin('map-explorer').config('contentTypes'),
  };

  // 3. Initialize Core Service
  const coreService = GeminiService({ adapter, config });

  return {
    ...coreService,
    // Intercept V2 generation to guarantee Blueprint Hydration
    async generatePixelDataV2(genConfig: GenerationConfig) {
      if (genConfig.type === 'Blueprint' || genConfig.action === 'generate_blueprint') {
         return coreService.generatePixelDataV2(genConfig);
      }

      // 1. If the user explicitly provided a blueprint matrix from the UI, ALWAYS respect it
      let finalBlueprintMatrix: string[][] | undefined = genConfig.blueprint;

      // 2. Format slug correctly respecting hyphens (e.g. "beast-quadruped", "weapon-ranged")
      const safeType = (genConfig.archetype || 'unknown').toLowerCase().replace(/[^a-z0-9-]/g, '');
      const safeSize = (genConfig.size || 'medium').toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      // Determine expected slug based on type
      let targetSlug = `${safeType}-${safeSize}`;
      
      // Items and Terrains often don't have size variants, so try the base type as slug fallback
      const baseSlug = safeType;

      if (!finalBlueprintMatrix) {
        // 3. Lookup existing blueprint in DB using size-specific OR base slug
        const existingBlueprints = await strapi.db.query('api::blueprint.blueprint').findMany({
          where: { 
            $or: [
              { slug: targetSlug },
              { slug: baseSlug }
            ]
          },
          limit: 1,
        });

        if (existingBlueprints.length > 0) {
          strapi.log.info(`[GeminiService] Found existing blueprint for ${existingBlueprints[0].slug}, hydrating...`);
          finalBlueprintMatrix = existingBlueprints[0].matrix;
          targetSlug = existingBlueprints[0].slug; // Ensure we cache under right name if we use base
        } else {
          // 4. Auto-Generate Blueprint if missing
          strapi.log.info(`[GeminiService] Blueprint ${targetSlug} missing. Auto-generating...`);
          try {
            const bpResult = await coreService.generateBlueprint({
              ...genConfig,
              action: 'generate_blueprint'
            });

            if (bpResult && bpResult.pixelData) {
              finalBlueprintMatrix = bpResult.pixelData;
              
              // 5. Persist to DB for future caching
            await strapi.db.query('api::blueprint.blueprint').create({
              data: {
                slug: targetSlug,
                type: genConfig.archetype || 'unknown',
                size: genConfig.size || 'medium',
                matrix: finalBlueprintMatrix,
                spriteData: bpResult.pixelData ? bpResult.pixelData.flat() : null,
                publishedAt: new Date()
              }
            });
            strapi.log.info(`[GeminiService] Successfully cached new blueprint: ${targetSlug}`);
          }
        } catch (bpError) {
          strapi.log.warn(`[GeminiService] Failed to auto-generate blueprint ${targetSlug}. Proceeding without it. Error: ${bpError.message}`);
        }
      }
      } // Closes if (!finalBlueprintMatrix)

      // 5. Dispatch actual Sprite Generation with Hydrated Blueprint
      return coreService.generatePixelDataV2({
        ...genConfig,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blueprint: (finalBlueprintMatrix || genConfig.blueprint) as any
      });
    }
  };
};
