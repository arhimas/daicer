/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { BlockType } from '../../../game/src/engine/types';

export const CHUNK_SIZE = 32;
export const TILE_SIZE = 32; // Pixels
export const VIEW_RADIUS = 16; // Radius in tiles for rendering

// Relaxed type to allow partial definition while we add new block types
export const COLORS: Record<string, string> = {
  [BlockType.AIR]: 'rgba(0,0,0,0)',
  [BlockType.GRASS]: '#10b981',
  [BlockType.DIRT]: '#854d0e',
  [BlockType.STONE]: '#64748b',
  [BlockType.WATER]: '#3b82f6',
  [BlockType.SAND]: '#fcd34d',
  [BlockType.SNOW]: '#f8fafc',
  [BlockType.WALL_STONE]: '#334155',
  [BlockType.WALL_WOOD]: '#78350f',
  [BlockType.FLOOR_WOOD]: '#92400e',
  [BlockType.FLOOR_STONE]: '#475569',
  [BlockType.DOOR]: '#b45309',
  [BlockType.STAIRS_UP]: '#22d3ee', // Cyan
  [BlockType.STAIRS_DOWN]: '#d946ef', // Magenta
  [BlockType.LAVA]: '#ef4444',
  [BlockType.BEDROCK]: '#020617',
  [BlockType.TREE_LEAVES]: 'rgba(22, 163, 74, 0.9)',
  [BlockType.FLOOR_DIRT]: '#57534e',
  [BlockType.TREE_OAK]: '#1e293b',
  [BlockType.TREE_PINE]: '#064e3b',
  [BlockType.TREE_BIRCH]: '#f1f5f9',
  [BlockType.ORE_COAL]: '#0f172a',
  [BlockType.CACTUS]: '#4d7c0f',
  [BlockType.WALL_COBBLE]: '#4b5563',
  [BlockType.WALL_BRICK]: '#7f1d1d',
  [BlockType.WALL_LOG]: '#3f2204',
  [BlockType.FLOOR_TILED]: '#e2e8f0',
  [BlockType.MUSHROOM_GIANT]: '#a855f7',
  [BlockType.CRYSTAL]: '#818cf8',
  [BlockType.ORE_IRON]: '#b91c1c',
  [BlockType.ORE_GOLD]: '#fbbf24',
  [BlockType.ORE_DIAMOND]: '#3b82f6',
  [BlockType.CHEST]: '#854d0e',
};
