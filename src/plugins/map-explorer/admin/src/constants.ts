import { BlockType } from "./types";

export const Z_MIN = -3;
export const Z_MAX = 3;
export const TILE_SIZE = 32;

export const BLOCK_COLORS: Record<BlockType, string> = {
  air: 'transparent',
  stone: '#7d7d7d',
  dirt: '#5d4037',
  grass: '#388e3c',
  water: '#1976d2',
  sand: '#fbc02d',
  wood: '#5d4037',
  leaves: '#2e7d32',
  snow: '#ffffff',
  ice: '#90caf9',
  lava: '#d32f2f',
  bedrock: '#212121',
  gravel: '#9e9e9e',
  obsidian: '#000000',
  glass: 'rgba(255, 255, 255, 0.3)',
  planks: '#8d6e63',
  brick: '#b71c1c',
  cobblestone: '#616161',
  sandstone: '#f57f17',
  clay: '#9fa8da',
  gold_ore: '#fdd835',
  iron_ore: '#d7ccc8',
  coal_ore: '#424242',
  diamond_ore: '#00bcd4',
  torch: '#ffeb3b',
  chest: '#795548',
  crafting_table: '#d7ccc8',
  furnace: '#616161',
  door: '#795548',
  fence: '#8d6e63',
  unknown: '#ff00ff',
};

export const BLOCK_TYPES = Object.keys(BLOCK_COLORS) as BlockType[];
