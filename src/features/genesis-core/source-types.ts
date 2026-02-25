import { SourceSpell } from '@/features/genesis-core/data/schemas/spell-schema';
import { SourceMagicItem } from '@/features/genesis-core/data/schemas/magic-item-schema';
import { SourceMagicSchool } from '@/features/genesis-core/data/schemas/magic-school-schema';
import { SourceMonster } from '@/features/genesis-core/data/schemas/monster-schema';
import { SourceRace } from '@/features/genesis-core/data/schemas/race-schema';
import { SourceClass } from '@/features/genesis-core/data/schemas/class-schema';
import { SourceTrait } from '@/features/genesis-core/data/schemas/trait-schema';
import { SourceFeature } from '@/features/genesis-core/data/schemas/feature-schema';
import { APIReference } from '@/features/genesis-core/data/schemas/common-schemas';

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
  APIReference,
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
  cost?: Record<string, unknown>;
  damage?: Record<string, unknown>;
  range?: Record<string, unknown>;
  properties?: Record<string, unknown>[];
  weapon_category?: string;
  armor_category?: string;
  equipment_category?: Record<string, unknown>;
  weight?: number;
}
