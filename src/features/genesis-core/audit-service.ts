/* eslint-disable */

import { SourceLoader } from './source-loader';

export interface ManifestItem {
    type: string;
    index: string;
    name: string;
    sourceUrl?: string;
}

export interface GenesisManifest {
    generatedAt: string;
    counts: Record<string, number>;
    entities: ManifestItem[];
}

export class AuditService {
    constructor(private loader: SourceLoader) {}

    async generateManifest(): Promise<GenesisManifest> {
        const entities: ManifestItem[] = [];

        // Spells
        const spells = await this.loader.loadSpells();
        for (const spell of spells) {
            entities.push({
                type: 'spell',
                index: spell.index,
                name: spell.name,
                sourceUrl: spell.url
            });
        }

        // Items
        const items = await this.loader.loadItems();
        for (const item of items) {
             entities.push({
                type: 'item',
                index: item.index,
                name: item.name
             });
        }

        // Traits
        const traits = await this.loader.loadTraits();
        for (const trait of traits) {
            entities.push({
                type: 'trait',
                index: trait.index,
                name: trait.name,
                sourceUrl: trait.url
            });
        }

        // Features
        const features = await this.loader.loadFeatures();
        for (const feature of features) {
            entities.push({
                type: 'feature',
                index: feature.index,
                name: feature.name,
                sourceUrl: feature.url
            });
        }

        // Monsters
        const monsters = await this.loader.loadMonsters();
        for (const monster of monsters) {
            entities.push({
                type: 'monster',
                index: monster.index,
                name: monster.name,
                sourceUrl: monster.url
            });
        }

        // Races
        const races = await this.loader.loadRaces();
        for (const race of races) {
            entities.push({
                type: 'race',
                index: race.index,
                name: race.name,
                sourceUrl: '' // SourceRace doesn't have url in type def yet, but json might
            });
        }

        // Classes
        const classes = await this.loader.loadClasses();
        for (const cls of classes) {
            entities.push({
                type: 'class',
                index: cls.index,
                name: cls.name,
                sourceUrl: cls.class_levels
            });
        }
        
        // Helper to add entities
        const addEntities = async (loadFn: () => Promise<any[]>, type: string) => {
            const data = await loadFn();
            for (const item of data) {
                entities.push({
                    type,
                    index: item.index,
                    name: item.name,
                    sourceUrl: item.url
                });
            }
        };

        await addEntities(() => this.loader.loadAlignments(), 'alignment');
        await addEntities(() => this.loader.loadBackgrounds(), 'background');
        await addEntities(() => this.loader.loadConditions(), 'condition');
        await addEntities(() => this.loader.loadDamageTypes(), 'damage-type');
        await addEntities(() => this.loader.loadEquipmentCategories(), 'equipment-category');
        await addEntities(() => this.loader.loadFeats(), 'feat');
        await addEntities(() => this.loader.loadLanguages(), 'language');
        await addEntities(() => this.loader.loadLevels(), 'level');
        await addEntities(() => this.loader.loadMagicItems(), 'magic-item');
        await addEntities(() => this.loader.loadMagicSchools(), 'magic-school');
        await addEntities(() => this.loader.loadProficiencies(), 'proficiency');
        await addEntities(() => this.loader.loadRules(), 'rule');
        await addEntities(() => this.loader.loadRuleSections(), 'rule-section');
        await addEntities(() => this.loader.loadSkills(), 'skill');
        await addEntities(() => this.loader.loadSubclasses(), 'subclass');
        await addEntities(() => this.loader.loadSubraces(), 'subrace');
        await addEntities(() => this.loader.loadWeaponProperties(), 'weapon-property');
        
        // Count summary
        const counts: Record<string, number> = { total: entities.length };
        const types = new Set(entities.map(e => e.type));
        types.forEach(type => {
            counts[type] = entities.filter(e => e.type === type).length;
        });

        return {
            generatedAt: new Date().toISOString(),
            counts,
            entities
        };
    }
}
