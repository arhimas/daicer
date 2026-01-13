import { Core } from '@strapi/strapi';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import type {
  ApiDamageTypeDamageType,
  ApiMagicSchoolMagicSchool,
  ApiWeaponPropertyWeaponProperty,
  ApiEquipmentCategoryEquipmentCategory,
  ApiProficiencyProficiency,
  ApiLanguageLanguage,
  ApiSpellSpell,
  ApiFeatureFeature,
} from '../../../types/generated/contentTypes';

/**
 * Registry of all supported content types for strict typing
 */
export type SupportedContentTypes =
  | ApiDamageTypeDamageType
  | ApiMagicSchoolMagicSchool
  | ApiWeaponPropertyWeaponProperty
  | ApiEquipmentCategoryEquipmentCategory
  | ApiProficiencyProficiency
  | ApiLanguageLanguage
  | ApiSpellSpell
  | ApiFeatureFeature;

/**
 * Abstract Base Loader for the Genesis Service
 * Handles the reading of JSON files and the idempotent upsert logic.
 */
export abstract class BaseLoader<T extends SupportedContentTypes> {
  protected strapi: Core.Strapi;
  protected libraryPath: string;
  protected schema: z.ZodType<unknown>;

  constructor(strapi: Core.Strapi, relativePath: string, schema: z.ZodType<unknown>) {
    this.strapi = strapi;
    this.libraryPath = path.join(process.cwd(), 'data/library', relativePath);
    this.schema = schema;
  }

  /**
   * The unique identifier for the collection type (e.g. 'api::damage-type.damage-type')
   */
  abstract get uid(): T['collectionName'] extends 'damage_types'
    ? 'api::damage-type.damage-type'
    : T['collectionName'] extends 'magic_schools'
      ? 'api::magic-school.magic-school'
      : T['collectionName'] extends 'weapon_properties'
        ? 'api::weapon-property.weapon-property'
        : T['collectionName'] extends 'equipment_categories'
          ? 'api::equipment-category.equipment-category'
          : T['collectionName'] extends 'proficiencies'
            ? 'api::proficiency.proficiency'
            : T['collectionName'] extends 'languages'
              ? 'api::language.language'
              : T['collectionName'] extends 'spells'
                ? 'api::spell.spell'
                : T['collectionName'] extends 'features'
                  ? 'api::feature.feature'
                  : string;

  /**
   * Optional transformation or enrichment logic before saving.
   */
  async transform(item: unknown): Promise<unknown> {
    return item;
  }

  public async load() {
    console.log(`\nðŸ“¦ Loading ${this.uid} from ${this.libraryPath}...`);

    if (!fs.existsSync(this.libraryPath)) {
      console.warn(`âš ï¸  Warning: File not found: ${this.libraryPath}`);
      return;
    }

    const rawData = fs.readFileSync(this.libraryPath, 'utf-8');
    let items: unknown[];

    try {
      items = JSON.parse(rawData);
    } catch (e) {
      throw new Error(`Failed to parse JSON at ${this.libraryPath}: ${e}`);
    }

    // Pre-processing: Ensure slugs exist before validation
    items = items.map((item) => ({
      ...item,
      slug: item.slug || this.generateSlug(item.name || 'unknown'),
    }));

    // Zod Validation (SOTA Step)
    const ArraySchema = z.array(this.schema);
    const validation = ArraySchema.safeParse(items);

    if (!validation.success) {
      console.error(`â Œ Validation Failed for ${this.uid}:`);
      console.error(validation.error.issues);
      throw new Error(`Strict Schema Validation Failed for ${this.uid}`);
    }

    const validItems = validation.data;
    let created = 0;
    let skipped = 0;

    for (const item of validItems) {
      if (!this.strapi) {
        throw new Error('Strapi instance is not initialized');
      }

      const dataToSave = await this.transform(item);
      const slug = item.slug;

      // Idempotent Check
      // We purposefully cast to 'any' for the query builder invocation
      // because Strapi's Core.Strapi .documents() type resolution is complex
      // in standalone scripts without full project context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await this.strapi.documents(this.uid as any).findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filters: { slug: slug } as any,
        limit: 1,
      });

      if (existing.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.strapi.documents(this.uid as any).create({
          data: dataToSave,
          status: 'published',
        });
        process.stdout.write('+');
        created++;
      } else {
        process.stdout.write('.');
        skipped++;
      }
    }

    console.log(`\nDONE: ${created} created, ${skipped} skipped.`);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
