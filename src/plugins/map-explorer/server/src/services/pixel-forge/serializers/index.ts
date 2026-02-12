import { getPixelDimensions } from '../../../utils/entity-geometry';

// ---------------------------------------------------------------------------
// CONTEXT INTERFACES (The Serializable Contract)
// ---------------------------------------------------------------------------

export interface BasePixelContext {
  uid: string;
  documentId: string;
  name: string;
  size: string; // "Medium", "Large", etc.
  width: number;
  height: number;
}

export interface EntityContext extends BasePixelContext {
  kind: 'entity';
  race: string; // 'human', 'elf', etc.
  gender: 'male' | 'female';
  skinTone: string; // Hex
  archetype: 'Humanoid' | 'Quadruped' | 'Winged' | 'Amorphous'; // Derived from type tags
  equipment: ItemContext[]; // Recursively simple items
}

export interface ItemContext extends BasePixelContext {
  kind: 'item';
  type: string; // 'weapon', 'armor', 'potion'
  subType: string; // 'sword', 'plate', etc.
  rarity?: string;
  magicColor?: string; // Derived from magic school or properties
}

export interface TerrainContext extends BasePixelContext {
  kind: 'terrain';
  isLiquid: boolean;
  isWalkable: boolean;
  isTransparent?: boolean;
  luminance: number;
  noiseConfig?: {
    algorithm: 'perlin' | 'simplex' | 'white';
    scale: number;
    octaves: number;
    persistence: number;
    seed?: number;
  };
  primaryColor?: string; // Derived from biome/tags
}

export type PixelGenerationContext = EntityContext | ItemContext | TerrainContext;

// ---------------------------------------------------------------------------
// SERIALIZERS (The Transformers)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serializeEntity = (strapiData: any): EntityContext => {
  const size = strapiData.size || 'Medium';
  const dim = getPixelDimensions(size);

  return {
    kind: 'entity',
    uid: 'api::entity.entity',
    documentId: strapiData.documentId,
    name: strapiData.name,
    size,
    width: dim,
    height: dim,
    race: strapiData.race?.slug || 'human',
    gender: 'male', // TODO: Add gender to schema if needed, default for now
    skinTone: strapiData.appearance?.skin || '#dcb097',
    // Simple heuristic for now, can be expanded with Tags
    archetype: strapiData.type === 'beast' ? 'Quadruped' : 'Humanoid',
    // Recursively serialize equipment (shallow)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    equipment: (strapiData.equipment || []).map((item: any) => serializeItem(item)),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serializeItem = (strapiData: any): ItemContext => {
  const size = strapiData.size || 'Medium';
  const dim = getPixelDimensions(size);

  return {
    kind: 'item',
    uid: 'api::item.item',
    documentId: strapiData.documentId,
    name: strapiData.name,
    size,
    width: dim,
    height: dim,
    type: strapiData.type || 'misc',
    subType: strapiData.equipment_data?.properties?.[0]?.slug || 'generic',
    rarity: strapiData.rarity || 'common',
    magicColor: '#ffffff', // Placeholder
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serializeTerrain = (strapiData: any): TerrainContext => {
  const customGrid = strapiData.texture; // The JSON custom field if exists
  const width = customGrid?.width || 32;
  const height = customGrid?.height || 32;

  return {
    kind: 'terrain',
    uid: 'api::terrain.terrain',
    documentId: strapiData.documentId,
    name: strapiData.name,
    size: 'Medium', // Terrains usually tile at 32x32 (1 cell)
    width,
    height,
    isLiquid: strapiData.isLiquid || false,
    isWalkable: strapiData.isWalkable ?? true,
    luminance: strapiData.luminance || 0,
    noiseConfig: strapiData.noise_config
      ? {
          algorithm: strapiData.noise_config.algorithm || 'simplex',
          scale: strapiData.noise_config.scale || 10,
          octaves: strapiData.noise_config.octaves || 1,
          persistence: strapiData.noise_config.persistence || 0.5,
          seed: strapiData.noise_config.seed,
        }
      : undefined,
  };
};
