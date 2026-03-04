import type { Core } from '@strapi/strapi';
import { GeminiService, StrapiAdapter, LLMCoreConfig, GenerationConfig } from '@daicer/llm-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
    // Generate Sprite Image natively
    async generatePixelDataV2(genConfig: GenerationConfig) {
      // 1. Dispatch actual Sprite Generation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await coreService.generatePixelDataV2(genConfig);

      // 6. SOTA PNG Media Persistance: Convert Base64 GenAI payload to Media Library Items
      if (
        result &&
        result.base64Processed &&
        genConfig.entityContext?.uid &&
        genConfig.entityContext?.documentId
      ) {
        try {
          const uploadService = strapi.plugin('upload').service('upload');
          const uid = genConfig.entityContext.uid;
          const docId = genConfig.entityContext.documentId;
          const rawName = genConfig.entityData?.slug || genConfig.entityData?.name || genConfig.archetype || 'sprite';
          const safeSlug = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          // Extract content type from uid (e.g., "api::terrain.terrain" -> "terrain")
          const contentTypeMatch = uid?.split('.')[1] || genConfig.type.toLowerCase();
          const slugName = `${contentTypeMatch}_${safeSlug}_sprite`;
          const now = Date.now();

          strapi.log.info(`[GeminiService] Persisting base64 sprites to Media Library for ${uid}:${docId}...`);

          const tmpDir = os.tmpdir();
          
          let procUploadObj = null;

          // Process Original (If Available)
          if (result.base64Original) {
             const origBuffer = Buffer.from(result.base64Original.replace(/^data:image\/\w+;base64,/, ''), 'base64');
             const origPath = path.join(tmpDir, `orig-${slugName}-${now}.png`);
             fs.writeFileSync(origPath, origBuffer);
             
             // We drop the upload of the original to save DB space and strictly enforce the 1-field rule.
             fs.unlinkSync(origPath);
          }

          // Process Quantized/Transparent
          const procBuffer = Buffer.from(result.base64Processed.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          const procPath = path.join(tmpDir, `proc-${slugName}-${now}.png`);
          fs.writeFileSync(procPath, procBuffer);
          const procStat = fs.statSync(procPath);

          const procUpload = await uploadService.upload({
             data: { fileInfo: { name: slugName, caption: 'Generated Sprite' } },
             files: { 
                filepath: procPath, 
                originalFilename: `${slugName}-${now}.png`, 
                mimetype: 'image/png', 
                size: procStat.size 
             }
          });
          procUploadObj = procUpload[0];
          fs.unlinkSync(procPath);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await strapi.documents(uid as any).update({
            documentId: docId,
            data: {
              sprite: procUploadObj?.id || null,
              spriteData: result.pixelData ? result.pixelData.flat() : null,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            status: 'draft', // Ensure we don't accidentally auto-publish something in draft state? The UI triggers saves anyway.
          });

          strapi.log.info(`[GeminiService] Successfully attached Media Sprites to ${uid}:${docId}`);
          
          // Inject the full upload object so the UI can update its Media component
          if (procUploadObj?.id) {
             result.uploadId = procUploadObj.id;
             result.uploadMedia = procUploadObj;
          }
        } catch (uploadErr) {
          strapi.log.error(`[GeminiService] Failed to upload/attach Media generated image...`, uploadErr);
        }
      }

      return result;
    }
  };
};
