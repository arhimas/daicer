
import type { Core } from '@strapi/strapi';
import { z } from 'zod';
import * as Vault from './vault';
import * as Schemas from './schemas';

// Mapping: Field Name -> Target UID
const RELATION_MAP: Record<string, string> = {
    // Atoms
    races: 'api::race.race',
    proficiencies: 'api::proficiency.proficiency',
    tags: 'api::tag.tag',
    languages: 'api::language.language',
    prompts: 'api::prompt.prompt',
    
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
            const entity = await this.strapi.documents(uid as any).findFirst({
                filters: { slug },
                fields: ['documentId', 'slug']
            });
            if (entity) {
                this.lookupCache[uid].set(slug, entity.documentId);
                return entity.documentId;
            }
        } catch (e) {
            // console.warn(`Lookup failed for ${uid}/${slug}`, e);
        }
        return null;
    }

    private async resolveRelations(data: any, schema: z.ZodObject<any>): Promise<any> {
        const result = { ...data };
        const shape = schema.shape;

        for (const [key, fieldSchema] of Object.entries(shape)) {
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
             // Handle single relations if needed
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
            const existing = await this.strapi.documents(uid as any).findFirst({
                filters: { [uniqueField]: identifier }
            });

            if (existing) {
                await this.strapi.documents(uid as any).update({
                    documentId: existing.documentId,
                    data: { ...processedData, publishedAt: new Date() }
                });
                // Update Cache
                if (!this.lookupCache[uid]) this.lookupCache[uid] = new Map();
                this.lookupCache[uid].set(identifier, existing.documentId);
            } else {
                const created = await this.strapi.documents(uid as any).create({
                    data: { ...processedData, publishedAt: new Date() }
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

        // 1. Atoms
        console.log(`\nProcessing Tags (${Vault.TAGS.length})...`);
        for (const item of Vault.TAGS) await this.syncEntity('api::tag.tag', item, Schemas.TagSchema);

        console.log(`\nProcessing Traits (${Vault.TRAITS.length})...`);
        for (const item of Vault.TRAITS) await this.syncEntity('api::trait.trait', item, Schemas.TraitSchema);

        // 1.5 Prompts
        if (Vault.PROMPTS && Vault.PROMPTS.length > 0) {
           console.log(`\nProcessing Prompts (${Vault.PROMPTS.length})...`);
           for (const item of Vault.PROMPTS) await this.syncEntity('api::prompt.prompt', item, Schemas.PromptSchema, 'key');
        }


        // 2. Molecules
        console.log(`\nProcessing Features (${Vault.FEATURES.length})...`);
        for (const item of Vault.FEATURES) await this.syncEntity('api::feature.feature', item, Schemas.FeatureSchema);

        console.log(`\nProcessing Spells (${Vault.SPELLS.length})...`);
        for (const item of Vault.SPELLS) await this.syncEntity('api::spell.spell', item, Schemas.SpellSchema);

        console.log(`\nProcessing Items (${Vault.ITEMS.length})...`);
        for (const item of Vault.ITEMS) await this.syncEntity('api::item.item', item, Schemas.ItemSchema);

        console.log(`\nProcessing Classes (${Vault.CLASSES.length})...`);
        for (const item of Vault.CLASSES) await this.syncEntity('api::class.class', item, Schemas.ClassSchema);

        // 3. Composites
        console.log(`\nProcessing Entities (${Vault.ENTITIES.length})...`);
        for (const item of Vault.ENTITIES) await this.syncEntity('api::entity.entity', item, Schemas.EntitySchema);

        console.log('\n✨ Genesis Seed Complete!');
    }
}
