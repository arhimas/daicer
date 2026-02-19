
import { z } from 'zod';
import { SourceSpell } from './data/schemas/spell-schema';
import { SourceMagicItem } from './data/schemas/magic-item-schema';
import { SourceMagicSchool } from './data/schemas/magic-school-schema';
import { SourceMonster } from './data/schemas/monster-schema';
import { SourceRace } from './data/schemas/race-schema';
import { SourceClass } from './data/schemas/class-schema';
import { SourceTrait } from './data/schemas/trait-schema';
import { SourceFeature } from './data/schemas/feature-schema';
import { APIReference } from './data/schemas/common-schemas';

export type SourceRef = APIReference;
export type { 
    SourceSpell, 
    SourceMagicItem, 
    SourceMagicSchool, 
    SourceMonster, 
    SourceRace, 
    SourceClass, 
    SourceTrait, 
    SourceFeature, 
    APIReference 
};

// Placeholder interfaces for types not yet Zod-ified
export interface SourceDamageType {
    index: string;
    name: string;
    desc: string[];
    url: string;
}

export interface SourceCondition {
    index: string;
    name: string;
    desc: string[];
    url: string;
}

export interface SourceItem {
    index: string;
    name: string;
    desc?: string[];
    cost?: any;
    damage?: any;
    range?: any;
    properties?: any[];
    weapon_category?: string;
    armor_category?: string;
    equipment_category?: any;
    weight?: number;
}
