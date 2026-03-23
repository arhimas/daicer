import type { Core } from '@strapi/strapi';
import { z } from 'zod';
import * as Vault from '@/genesis/vault';
import * as Schemas from '@/genesis/schemas';
import fs from 'fs';
import path from 'path';

// Mapping: Field Name -> Target UID
const RELATION_MAP: Record<string, string> = {
  // Atoms
  races: 'api::race.race',
  proficiencies: 'api::proficiency.proficiency',
  tags: 'api::tag.tag',
  languages: 'api::language.language',
  prompts: 'api::prompt.prompt',
  zones: 'api::entity-zone.entity-zone',

  // Molecules
  subclasses: 'api::subclass.subclass',
  features: 'api::feature.feature',
  actions: 'api::action.action',
  traits: 'api::trait.trait',
  spells: 'api::spell.spell',

  // Composites
  inventory_items: 'api::item.item', // Custom handling might be needed for component inventory
};

export class GenesisSeeder {
  private strapi: Core.Strapi;
  private lookupCache: Record<string, Map<string, string>> = {};

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  private async getDocumentId(uid: string, slug: string): Promise<string | null> {
    if (!this.lookupCache[uid]) {
      this.lookupCache[uid] = new Map();
    }
    if (this.lookupCache[uid].has(slug)) {
      return this.lookupCache[uid].get(slug)!;
    }

    // Fetch from DB
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entity = await this.strapi.documents(uid as any).findFirst({
        filters: { slug: { $eq: slug } },
        fields: ['documentId', 'slug'],
      });
      if (entity) {
        this.lookupCache[uid].set(slug, entity.documentId);
        return entity.documentId;
      }
    } catch {
      console.warn(`⚠️ DB Lookup failed for ${uid}/${slug}`);
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async resolveRelations(data: any, schema: z.ZodObject<any>): Promise<any> {
    const result = { ...data };
    const shape = schema.shape;

    for (const key of Object.keys(shape)) {
      // Basic heuristic for RelationMany: array of strings + key is in RELATION_MAP
      if (RELATION_MAP[key] && Array.isArray(data[key])) {
        const targetUid = RELATION_MAP[key];
        const docIds: string[] = [];
        for (const slug of data[key]) {
          if (typeof slug === 'string') {
            const id = await this.getDocumentId(targetUid, slug);
            if (id) docIds.push(id);
            else console.warn(`⚠️  Missing relation: ${key} -> ${slug}`);
          }
        }
        result[key] = docIds;
      }

      // Special handling for Class Progression (Component)
      if (key === 'progression' && Array.isArray(data[key])) {
        const progression = [];
        for (const step of data[key]) {
          const newStep = { ...step };
          // Resolve features within progression
          if (step.features && Array.isArray(step.features)) {
            const featureIds = [];
            for (const fSlug of step.features) {
              const fid = await this.getDocumentId('api::feature.feature', fSlug);
              if (fid) featureIds.push(fid);
              else console.warn(`⚠️  Missing feature in progression: ${fSlug}`);
            }
            newStep.features = featureIds;
          }
          progression.push(newStep);
        }
        result[key] = progression;
      }

      // Special handling for Entity Inventory (Component)
      if (key === 'inventory' && Array.isArray(data[key])) {
        const inventory = [];
        for (const entry of data[key]) {
          const newEntry = { ...entry };
          
          if (typeof entry.item === 'string') {
            const itemId = await this.getDocumentId('api::item.item', entry.item);
            if (itemId) newEntry.item = itemId;
            else console.warn(`⚠️  Missing item in inventory: ${entry.item}`);
          }
          
          if (typeof entry.slot === 'string') {
            const anchorId = await this.getDocumentId('api::anchor.anchor', entry.slot);
            if (anchorId) newEntry.slot = anchorId;
            else console.warn(`⚠️  Missing anchor in inventory slot: ${entry.slot}`);
          }
          
          inventory.push(newEntry);
        }
        result[key] = inventory;
      }
    }
    return result;
  }

  private async syncEntity<T>(uid: string, rawData: T, schema: z.ZodSchema<T>, uniqueField = 'slug') {
    // 1. Validate
    const validation = schema.safeParse(rawData);
    if (!validation.success) {
      console.error(`❌ Validation failed for [${uid}]:`, validation.error.format());
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = validation.data as any;
    const identifier = data[uniqueField];

    if (!identifier) {
      console.error(`❌ Missing unique field '${uniqueField}' in data for ${uid}`, data);
      return;
    }

    // 2. Resolve Relations
    // We need to cast to ZodObject to inspect shape for relations
    let processedData = data;
    if (schema instanceof z.ZodObject) {
      processedData = await this.resolveRelations(data, schema);
    }

    // 3. Upsert
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await this.strapi.documents(uid as any).findFirst({
        filters: { [uniqueField]: identifier },
      });

      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.strapi.documents(uid as any).update({
          documentId: existing.documentId,
          data: { ...processedData },
          status: 'published',
        });
        // Update Cache
        if (!this.lookupCache[uid]) this.lookupCache[uid] = new Map();
        this.lookupCache[uid].set(identifier, existing.documentId);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const created = await this.strapi.documents(uid as any).create({
          data: { ...processedData },
          status: 'published',
        });
        if (!this.lookupCache[uid]) this.lookupCache[uid] = new Map();
        this.lookupCache[uid].set(identifier, created.documentId);
      }
      process.stdout.write('.');
    } catch (e) {
      console.error(`\n❌ Error syncing ${identifier} (${uid}):`, e);
    }
  }

  public async run() {
    console.log('🌱 Starting Genesis Seed...');

    // Dynamic Loader for Blueprint Files
    const loadFromDir = async (dirName: string) => {
      const items = [];
      // Seeder runs from src/genesis/seeder.ts, but when using ts-node it's relative to CWD or the file location.
      // Easiest is to go from project root (process.cwd()) to avoid __dirname bugs in TS compilations
      const dirPath = path.resolve(process.cwd(), 'src/genesis/blueprints', dirName); 
      console.log(`\n🔍 Looking for blueprints in: ${dirPath}`);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.ts'));
        console.log(`📂 Found ${files.length} files in ${dirName}.`);
        for (const f of files) {
          try {
            // Under Node CommonJS with ts-node, dynamic import() on .ts throws ERR_UNKNOWN_FILE_EXTENSION.
            // require() works correctly with ts-node.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mod = require(path.join(dirPath, f));
            items.push(mod.default);
          } catch (e) {
            console.error(`❌ Failed to load ${f}:`, e);
          }
        }
      } else {
        console.warn(`⚠️ Directory not found: ${dirPath}`);
      }
      return items;
    };

    const dynamicTerrains = await loadFromDir('terrain');
    const dynamicEntities = await loadFromDir('entity');
    
    // 1. Atoms
    console.log(`\nProcessing Tags (${Vault.TAGS.length})...`);
    for (const item of Vault.TAGS) await this.syncEntity('api::tag.tag', item, Schemas.TagSchema);

    console.log(`\nProcessing Terrains (${dynamicTerrains.length})...`);
    for (const item of dynamicTerrains) await this.syncEntity('api::terrain.terrain', item, Schemas.TerrainSchema);

    console.log(`\nProcessing Traits (${Vault.TRAITS.length})...`);
    for (const item of Vault.TRAITS) await this.syncEntity('api::trait.trait', item, Schemas.TraitSchema);

    console.log(`\nProcessing Races (${Vault.RACES.length})...`);
    for (const item of Vault.RACES) await this.syncEntity('api::race.race', item, Schemas.RaceSchema);

    // 1.2 Sizes
    if (Vault.SIZES && Vault.SIZES.length > 0) {
      console.log(`\nProcessing Sizes (${Vault.SIZES.length})...`);
      for (const item of Vault.SIZES) await this.syncEntity('api::size.size', item, Schemas.SizeSchema);
    }

    // 1.5 Prompts
    if (Vault.PROMPTS && Vault.PROMPTS.length > 0) {
      console.log(`\nProcessing Prompts (${Vault.PROMPTS.length})...`);
      for (const item of Vault.PROMPTS) await this.syncEntity('api::prompt.prompt', item, Schemas.PromptSchema, 'key');
    }

    // 1.8 Proficiencies
    if (Vault.PROFICIENCIES && Vault.PROFICIENCIES.length > 0) {
      console.log(`\nProcessing Proficiencies (${Vault.PROFICIENCIES.length})...`);
      for (const item of Vault.PROFICIENCIES)
        await this.syncEntity('api::proficiency.proficiency', item, Schemas.ProficiencySchema);
    }

    // 2. Molecules
    console.log(`\nProcessing Features (${Vault.FEATURES.length})...`);
    for (const item of Vault.FEATURES) await this.syncEntity('api::feature.feature', item, Schemas.FeatureSchema);

    console.log(`\nProcessing Spells (${Vault.SPELLS.length})...`);
    for (const item of Vault.SPELLS) await this.syncEntity('api::spell.spell', item, Schemas.SpellSchema);

    console.log(`\nProcessing Classes (${Vault.CLASSES.length})...`);
    for (const item of Vault.CLASSES) await this.syncEntity('api::class.class', item, Schemas.ClassSchema);

    // 3. Composites
    
    // Dynamic Image Hydration Helper for Entities, Items, Terrains
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pngToHexArray } = require(path.resolve(process.cwd(), 'src/scripts/png-to-hex.js'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hydrateWithAssets = async (typeSlug: string, itemData: any) => {
      const result = { ...itemData };
      if (!result.slug) return result;

      // Check for PNG Sprite
      const spritePath = path.resolve(process.cwd(), `src/genesis/sprites/${typeSlug}/${result.slug}.png`);
      if (fs.existsSync(spritePath)) {
        try {
           const parsed = await pngToHexArray(spritePath);
           if (parsed && parsed.hexArray) {
              result.spriteData = parsed.hexArray;
              if (parsed.width) result.width = parsed.width / 32;
              if (parsed.height) result.height = parsed.height / 32;
           }
        } catch (e) {
           console.warn(`⚠️ Failed to parse sprite for ${result.slug}: ${e}`);
        }
      }

      return result;
    };


    console.log(`\nProcessing Items (${Vault.ITEMS.length})...`);
    for (const item of Vault.ITEMS) {
       const hydratedItem = await hydrateWithAssets('items', item);
       await this.syncEntity('api::item.item', hydratedItem, Schemas.ItemSchema);
    }

    console.log(`\nProcessing Entities (${dynamicEntities.length})...`);
    let entityCount = 0;
    for (const item of dynamicEntities) {
       entityCount++;
       try {
          const hydratedEntity = await hydrateWithAssets('entities', item);
          await this.syncEntity('api::entity.entity', hydratedEntity, Schemas.EntitySchema);
          if (entityCount % 10 === 0) console.log(`Processed ${entityCount}/${dynamicEntities.length} entities...`);
       } catch(e) {
          console.error(`💥 FATAL ERROR on Entity ${item.slug} (${entityCount}):`, e);
          break; // Stop further to isolate
       }
    }

    // Refresh dynamic terrains with assets
    console.log(`\nProcessing Terrains (${dynamicTerrains.length}) With Hydration...`);
    for (const item of dynamicTerrains) {
       const hydratedTerrain = await hydrateWithAssets('terrains', item);
       await this.syncEntity('api::terrain.terrain', hydratedTerrain, Schemas.TerrainSchema);
    }

    console.log('\n✨ Genesis Seed Complete!');
  }
}
