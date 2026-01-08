import { processCollection } from './enrichment-runner';
import { COLLECTION_MAP } from '../constants';
import { ClassEnrichmentSchema } from '../schemas';
import { updateEntity } from '../../../utils/strapi-client';

export const runClasses = async (limit: number, isDryRun: boolean) => {
  await processCollection({
    uid: COLLECTION_MAP.classes,
    schema: ClassEnrichmentSchema,
    promptTemplate: `Analyze the provided D&D 5e Class. Extract its Class Features (e.g. Rage, Wild Shape, Spellcasting, Divine Smite) into structured data.`,
    limit,
    isDryRun,
    handler: async (entity, result) => {
      const mappedFeatures = (result.features || []).map((f: any) => ({
        name: f.name,
        description: (f.description || '').substring(0, 1000),
        source: 'class',
        usage_max: f.usage_max,
        usage_per: f.usage_per,
      }));

      const res = await updateEntity(COLLECTION_MAP.classes, entity.documentId || entity.id, {
        features: mappedFeatures,
      });
      if (!res) throw new Error('DB Update Failed');
    },
  });
};
