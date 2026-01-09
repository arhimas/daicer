import { EntityFeature, EntityTrait } from '../../../../engine/types';
import { StrapiEntitySheet } from './types';

export const resolveFeatures = (sheet: StrapiEntitySheet): { features: EntityFeature[]; traits: EntityTrait[] } => {
  const features: EntityFeature[] = [];
  const traits: EntityTrait[] = [];

  // 1. Resolve Class/Race Features
  if (Array.isArray(sheet.features)) {
    features.push(
      ...sheet.features.map((f) => ({
        documentId: f.documentId,
        name: f.name,
        description: f.description,
        level: f.level || 1, // Default to level 1 if undefined
        source: f.source || 'Class',
      }))
    );
  }

  // 2. Resolve Traits (Racial, Background, Monster Features mixed in)
  const sourceTraits = sheet.traits || sheet.monster?.features || [];

  if (Array.isArray(sourceTraits)) {
    traits.push(
      ...sourceTraits.map((t) => ({
        documentId: t.documentId,
        name: t.name,
        description: t.description,
        source: 'Trait', // Generic source
      }))
    );
  }

  return { features, traits };
};
