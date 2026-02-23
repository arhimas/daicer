 

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { 
    SourceClass, 
    SourceItem, 
    SourceRace, 
    SourceSpell, 
    SourceMagicItem, 
    SourceMagicSchool, 
    SourceTrait, 
    SourceFeature, 
    SourceMonster 
} from './source-types';
import { SpellSchema } from './data/schemas/spell-schema';
import { MagicItemSchema } from './data/schemas/magic-item-schema';
import { MagicSchoolSchema } from './data/schemas/magic-school-schema';
import { RaceSchema } from './data/schemas/race-schema';
import { ClassSchema } from './data/schemas/class-schema';
import { TraitSchema } from './data/schemas/trait-schema';
import { FeatureSchema } from './data/schemas/feature-schema';
import { MonsterSchema } from './data/schemas/monster-schema';

export class SourceLoader {
    private basePath: string;

    constructor(basePath: string = 'src/features/genesis-core/data/5e-2014') {
        this.basePath = path.resolve(process.cwd(), basePath);
    }

    async loadSpells(): Promise<SourceSpell[]> {
        return this.loadWithSchema('5e-SRD-Spells.json', z.array(SpellSchema));
    }

    async loadMagicItems(): Promise<SourceMagicItem[]> {
        return this.loadWithSchema('5e-SRD-Magic-Items.json', z.array(MagicItemSchema));
    }

    async loadMagicSchools(): Promise<SourceMagicSchool[]> {
        return this.loadWithSchema('5e-SRD-Magic-Schools.json', z.array(MagicSchoolSchema));
    }

    async loadRaces(): Promise<SourceRace[]> {
        return this.loadWithSchema('5e-SRD-Races.json', z.array(RaceSchema));
    }

    async loadTraits(): Promise<SourceTrait[]> { 
         return this.loadWithSchema('5e-SRD-Traits.json', z.array(TraitSchema));
    }

    async loadFeatures(): Promise<SourceFeature[]> {
        return this.loadWithSchema('5e-SRD-Features.json', z.array(FeatureSchema));
    }

    async loadMonsters(): Promise<SourceMonster[]> {
        return this.loadWithSchema('5e-SRD-Monsters.json', z.array(MonsterSchema));
    }

    async loadClasses(): Promise<SourceClass[]> {
        return this.loadWithSchema('5e-SRD-Classes.json', z.array(ClassSchema));
    }

    async loadItems(): Promise<SourceItem[]> {
        return this.loadJson<SourceItem[]>('5e-SRD-Equipment.json');
    }

    async loadAlignments(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Alignments.json'); }
    async loadBackgrounds(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Backgrounds.json'); }
    async loadConditions(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Conditions.json'); }
    async loadDamageTypes(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Damage-Types.json'); }
    async loadEquipmentCategories(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Equipment-Categories.json'); }
    async loadFeats(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Feats.json'); }
    async loadLanguages(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Languages.json'); }
    async loadLevels(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Levels.json'); }
    async loadProficiencies(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Proficiencies.json'); }
    async loadRules(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Rules.json'); }
    async loadRuleSections(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Rule-Sections.json'); }
    async loadSkills(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Skills.json'); }
    async loadSubclasses(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Subclasses.json'); }
    async loadSubraces(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Subraces.json'); }
    async loadWeaponProperties(): Promise<Record<string, unknown>[]> { return this.loadJson<Record<string, unknown>[]>('5e-SRD-Weapon-Properties.json'); }

    private async loadWithSchema<T>(filename: string, schema: z.ZodType<T>): Promise<T> {
        const filePath = path.join(this.basePath, filename);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const json = JSON.parse(data);
            return schema.parse(json);
        } catch (error) {
            console.error(`Failed to load/validate ${filename} from ${this.basePath}`);
            if (error instanceof z.ZodError) {
                console.error('Validation Error:', JSON.stringify(error.format(), null, 2));
            }
            throw new Error(`Failed to load/validate source file: ${filename}`);
        }
    }

    private async loadJson<T>(filename: string): Promise<T> {
        const filePath = path.join(this.basePath, filename);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Failed to load ${filename} from ${this.basePath}`, error);
            throw new Error(`Failed to load source file: ${filename}`);
        }
    }
}
