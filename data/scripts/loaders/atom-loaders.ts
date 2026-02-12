import { BaseLoader } from './base-loader';
import { Core } from '@strapi/strapi';

import {
  ApiDamageTypeDamageType,
  ApiMagicSchoolMagicSchool,
  ApiWeaponPropertyWeaponProperty,
  ApiEquipmentCategoryEquipmentCategory,
  ApiLanguageLanguage,
} from '@types/generated/contentTypes';
import {
  ApiDamageTypeDamageTypeSchema,
  ApiMagicSchoolMagicSchoolSchema,
  ApiWeaponPropertyWeaponPropertySchema,
  ApiEquipmentCategoryEquipmentCategorySchema,
  ApiProficiencyProficiencySchema,
  ApiLanguageLanguageSchema,
} from '@data/schemas/generated';

export class DamageTypeLoader extends BaseLoader<ApiDamageTypeDamageType> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiDamageTypeDamageTypeSchema);
  }

  get uid() {
    return 'api::damage-type.damage-type' as const;
  }
}

export class MagicSchoolLoader extends BaseLoader<ApiMagicSchoolMagicSchool> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiMagicSchoolMagicSchoolSchema);
  }

  get uid() {
    return 'api::magic-school.magic-school' as const;
  }
}

export class WeaponPropertyLoader extends BaseLoader<ApiWeaponPropertyWeaponProperty> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiWeaponPropertyWeaponPropertySchema);
  }

  get uid() {
    return 'api::weapon-property.weapon-property' as const;
  }
}

export class EquipmentCategoryLoader extends BaseLoader<ApiEquipmentCategoryEquipmentCategory> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiEquipmentCategoryEquipmentCategorySchema);
  }

  get uid() {
    return 'api::equipment-category.equipment-category' as const;
  }
}

export class ProficiencyLoader extends BaseLoader<ApiProficiencyProficiency> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiProficiencyProficiencySchema);
  }

  get uid() {
    return 'api::proficiency.proficiency' as const;
  }
}

export class LanguageLoader extends BaseLoader<ApiLanguageLanguage> {
  constructor(strapi: Core.Strapi, relativePath: string) {
    super(strapi, relativePath, ApiLanguageLanguageSchema);
  }

  get uid() {
    return 'api::language.language' as const;
  }
}
