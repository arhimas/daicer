export type BlockType =
  | 'air'
  | 'stone'
  | 'dirt'
  | 'grass'
  | 'water'
  | 'sand'
  | 'wood'
  | 'leaves'
  | 'snow'
  | 'ice'
  | 'lava'
  | 'bedrock'
  | 'gravel'
  | 'obsidian'
  | 'glass'
  | 'planks'
  | 'brick'
  | 'cobblestone'
  | 'sandstone'
  | 'clay'
  | 'gold_ore'
  | 'iron_ore'
  | 'coal_ore'
  | 'diamond_ore'
  | 'torch'
  | 'chest'
  | 'crafting_table'
  | 'furnace'
  | 'door'
  | 'fence'
  | 'unknown';

export interface Tile {
  x: number;
  y: number;
  z: number;
  block: BlockType;
  biome: string;
  isWalkable: boolean;
  isTransparent: boolean;
  variant: number;
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
  [key: string]: any;
}
