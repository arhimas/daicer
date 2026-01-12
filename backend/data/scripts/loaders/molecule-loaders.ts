
import { BaseLoader } from './base-loader';
import { ApiSpellSpell, ApiFeatureFeature } from '../../../types/generated/contentTypes';
import { ApiSpellSpellSchema, ApiFeatureFeatureSchema } from '../../schemas/generated';
import { Core } from '@strapi/strapi';

export class SpellLoader extends BaseLoader<ApiSpellSpell> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiSpellSpellSchema);
  }

  get uid() { return 'api::spell.spell' as const; }
}

export class FeatureLoader extends BaseLoader<ApiFeatureFeature> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiFeatureFeatureSchema);
  }

  get uid() { return 'api::feature.feature' as const; }
}
