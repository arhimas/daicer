import type { Modules } from '@strapi/types';

type BaseInput = { name: string; slug: string; description?: string; lore?: string };

export type EntityInput = Modules.Documents.Params.Data.Input<'api::entity.entity'> & BaseInput;
export type ActionInput = Modules.Documents.Params.Data.Input<'api::action.action'> & BaseInput;
export type ItemInput = Modules.Documents.Params.Data.Input<'api::item.item'> & BaseInput;
export type SpellInput = Modules.Documents.Params.Data.Input<'api::spell.spell'> & BaseInput;
export type FeatureInput = Modules.Documents.Params.Data.Input<'api::feature.feature'> & BaseInput;
export type TraitInput = Modules.Documents.Params.Data.Input<'api::trait.trait'> & BaseInput;
export type ClassInput = Modules.Documents.Params.Data.Input<'api::class.class'> & BaseInput;
export type SubclassInput = Modules.Documents.Params.Data.Input<'api::subclass.subclass'> & BaseInput;
export type RaceInput = Modules.Documents.Params.Data.Input<'api::race.race'> & BaseInput;
export type DamageTypeInput = Modules.Documents.Params.Data.Input<'api::damage-type.damage-type'> & BaseInput;
export type StatusEffectInput = Modules.Documents.Params.Data.Input<'api::status-effect.status-effect'> & BaseInput;
export type MagicSchoolInput = Modules.Documents.Params.Data.Input<'api::magic-school.magic-school'> & BaseInput;
export type BackgroundInput = Modules.Documents.Params.Data.Input<'api::background.background'> & BaseInput;
export type WeaponPropertyInput = Modules.Documents.Params.Data.Input<'api::weapon-property.weapon-property'> &
  BaseInput;
export type EntityZoneInput = Omit<Modules.Documents.Params.Data.Input<'api::entity-zone.entity-zone'>, 'category' | 'color'> & BaseInput & {
  symbol?: string;
  category?: 'Creature' | 'Item' | 'Structure' | 'Effect' | 'Terrain';
  color?: string;
};

export type BlueprintInput = Omit<Modules.Documents.Params.Data.Input<'api::blueprint.blueprint'>, 'category'> & 
  BaseInput & { 
    category?: string; 
    grid: string[][]; 
    zones?: string[];
    mapping?: Record<string, string>;
    anchors?: Record<string, [number, number]>;
  };

export type TerrainInput = Partial<Modules.Documents.Params.Data.Input<'api::terrain.terrain'>> & 
  BaseInput & {
    isWalkable?: boolean;
    isTransparent?: boolean;
    isLiquid?: boolean;
    damagePerTick?: number;
    luminance?: number;
    moisture?: number;
    temperature?: number;
    color?: string;
    // Explictly typing the 1D flat array payload to bypass eslint warnings
    texture?: { x: number; y: number; z: number; type: string }[];
    tags?: string[];
  };

export const defineEntity = (data: EntityInput) => data;
export const defineAction = (data: ActionInput) => data;
export const defineItem = (data: ItemInput) => data;
export const defineSpell = (data: SpellInput) => data;
export const defineFeature = (data: FeatureInput) => data;
export const defineTrait = (data: TraitInput) => data;
export const defineClass = (data: ClassInput) => data;
export const defineSubclass = (data: SubclassInput) => data;
export const defineRace = (data: RaceInput) => data;
export const defineDamageType = (data: DamageTypeInput) => data;
export const defineStatusEffect = (data: StatusEffectInput) => data;
export const defineMagicSchool = (data: MagicSchoolInput) => data;
export const defineBackground = (data: BackgroundInput) => data;
export const defineWeaponProperty = (data: WeaponPropertyInput) => data;
export const defineEntityZone = (data: EntityZoneInput) => data;
export const defineBlueprint = (data: BlueprintInput) => data;
export const defineTerrain = (data: TerrainInput) => data;

export const createSolidTexture = (hexColor: string) => {
  const flattenedVoxels: { x: number; y: number; z: number; type: string }[] = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      flattenedVoxels.push({ x, y, z: 0, type: hexColor });
    }
  }
  return flattenedVoxels;
};
