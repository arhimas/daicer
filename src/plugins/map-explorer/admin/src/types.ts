export interface TerrainType {
  slug: string;
  name: string;
  color: string;
  isWalkable?: boolean;
  isTransparent?: boolean;
  [key: string]: unknown;
}

export type BlockType = string;

export interface Tile {
  x: number;
  y: number;
  z: number;
  block: BlockType;
  biome: string;
  isWalkable: boolean;
  isTransparent: boolean;
  variant: number;
  pixels?: string[][]; // 32x32 hex color grid
  metadata?: Record<string, unknown>;
}

export interface Chunk {
  x: number;
  y: number;
  tiles: Tile[][][]; // [Z][Y][X] - Note: Z in backend might be shifted. 
                     // Frontend usually expects logic Z. Backend stores 0..6 for -3..3?
                     // Need to verify rendering logic.
}

export interface WorldConfig {
  seed: string;
  chunkSize: number;
  seaLevel: number;
  structureChance: number;
  roadDensity: number;
  [key: string]: unknown;
}

export interface Construction {
    id: number;
    documentId: string;
    name: string;
    category: string;
    width: number;
    height: number;
    depth: number;
    voxels: { x: number, y: number, z: number, type: BlockType }[];
}

export interface EntityState {
  id: string;
  position: { x: number; y: number; z: number };
  hp: number;
  maxHp: number;
}

export interface ReplayGameState {
  entities: EntityState[];
}
