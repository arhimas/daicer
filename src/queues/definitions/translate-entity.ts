
import { WorkerManager } from '../worker-manager';
import { QueueName, JobPayloads } from '../contract';
import type { Core } from '@strapi/strapi';

/**
 * TRANSLATE ENTITY WORKER
 * Async worker to translation entities into target locales (PT, ES).
 * Uses TranslationService logic.
 */
async function translateEntityProcessor(job: { data: JobPayloads[QueueName.TRANSLATE_ENTITY] }, strapi: Core.Strapi) {
  const { contentType, documentId, targetLocales = ['pt', 'es'] } = job.data;
  const translationService = strapi.service('api::game.translation');

  strapi.log.info(`[TranslateEntity] Processing ${contentType}:${documentId} for [${targetLocales.join(',')}]`);

  try {
      // 1. Fetch Original
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entity = await strapi.documents(contentType as any).findOne({
          documentId,
          populate: '*', // Deep populate might be needed, but start with *
      });

      if (!entity) {
          throw new Error(`Entity not found: ${contentType}:${documentId}`);
      }

      // 2. Prepare Clean Data (remove system fields)
      const cleanData = { ...entity };
      delete cleanData.id;
      delete cleanData.documentId;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      delete cleanData.publishedAt;
      delete cleanData.locale;
      delete cleanData.localizations;

      // 3. Process Each Locale
      for (const targetLocale of targetLocales) {
          try {
             // Translate
             const translatedEntity = await translationService.translateEntity(cleanData, contentType, targetLocale);

             // Update (Create Localization)
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             await strapi.documents(contentType as any).update({
                 documentId,
                 locale: targetLocale,
                 data: translatedEntity,
             });
             strapi.log.info(`[TranslateEntity] Created/Updated ${targetLocale} for ${documentId}`);
          } catch (locErr) {
              strapi.log.error(`[TranslateEntity] Failed for locale ${targetLocale}:`, locErr);
              // Continue to next locale
          }
      }

      return { success: true };

  } catch (error) {
      strapi.log.error(`[TranslateEntity] Fatal Error: ${error}`);
      return { success: false, error: String(error) };
  }
}

WorkerManager.register(QueueName.TRANSLATE_ENTITY, translateEntityProcessor);
