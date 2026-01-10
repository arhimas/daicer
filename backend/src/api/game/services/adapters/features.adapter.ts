import { EntityFeature, EntityTrait } from '../../src/engine/types';
import { StrapiEntitySheet } from './types';

export const mapStrapiFeaturesToEntityFeatures = (
  features: import('./types').StrapiFeature[] | undefined,
  defaultSource: string = 'Feature'
): EntityFeature[] => {
  if (!features || !Array.isArray(features)) return [];
  return features.map((f) => ({
    documentId: f.documentId,
    name: f.name,
    description: f.description,
    level: f.level || 1,
    source: f.source || defaultSource,
  }));
};

export const resolveFeatures = (sheet: StrapiEntitySheet): { features: EntityFeature[]; traits: EntityTrait[] } => {
  const features: EntityFeature[] = [];
  const traits: EntityTrait[] = [];

  // 1. Resolve Class/Race Features
  features.push(...mapStrapiFeaturesToEntityFeatures(sheet.features, 'Class'));

  // 2. Resolve Traits (Racial, Background, Monster Features mixed in)
  const sourceTraits = sheet.traits || sheet.entity?.features;
  traits.push(...(mapStrapiFeaturesToEntityFeatures(sourceTraits, 'Trait') as EntityTrait[]));

  return { features, traits };
};
