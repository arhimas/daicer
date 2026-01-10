import { z } from 'zod';

// Enums
export const BlockTypeSchema = z.nativeEnum({
  AIR: 'air',
  GRASS: 'grass',
  DIRT: 'dirt',
  STONE: 'stone',
  WATER: 'water',
  SAND: 'sand',
  SNOW: 'snow',

  // Walls
  WALL_STONE: 'wall_stone',
  WALL_COBBLE: 'wall_cobble',
  WALL_BRICK: 'wall_brick',
  WALL_WOOD: 'wall_wood',
  WALL_LOG: 'wall_log',

  // Floors
  FLOOR_WOOD: 'floor_wood',
  FLOOR_STONE: 'floor_stone',
  FLOOR_TILED: 'floor_tiled',
  FLOOR_DIRT: 'floor_dirt',

  DOOR: 'door',
  STAIRS_UP: 'stairs_up',
  STAIRS_DOWN: 'stairs_down',
  LAVA: 'lava',
  BEDROCK: 'bedrock',

  // Trees (20 Types)
  TREE_LEAVES: 'tree_leaves',
  TREE_OAK: 'tree_oak',
  TREE_PINE: 'tree_pine',
  TREE_BIRCH: 'tree_birch',
  TREE_PALM: 'tree_palm',
  TREE_ACACIA: 'tree_acacia',
  TREE_WILLOW: 'tree_willow',
  TREE_REDWOOD: 'tree_redwood',
  TREE_BAOBAB: 'tree_baobab',
  TREE_MANGROVE: 'tree_mangrove',
  TREE_CHERRY: 'tree_cherry',
  TREE_MAPLE: 'tree_maple',
  TREE_EBONY: 'tree_ebony',
  TREE_MAHOGANY: 'tree_mahogany',
  TREE_JUNGLE: 'tree_jungle',
  TREE_CYPRESS: 'tree_cypress',
  TREE_FIR: 'tree_fir',
  TREE_ASH: 'tree_ash',
  TREE_BAMBOO_GIANT: 'tree_bamboo_giant',
  TREE_SPRUCE: 'tree_spruce',
  TREE_ELM: 'tree_elm',
  TREE_DARK_OAK: 'tree_dark_oak',

  MUSHROOM_GIANT: 'mushroom_giant',
  CRYSTAL: 'crystal',

  // Plants (10 Types)
  PLANT_GRASS: 'plant_grass',
  PLANT_FERN: 'plant_fern',
  // Alias for code compatibility
  CACTUS: 'plant_cactus',
  PLANT_CACTUS: 'plant_cactus',
  PLANT_BUSH: 'plant_bush',
  PLANT_FLOWER_RED: 'plant_flower_red',
  PLANT_FLOWER_BLUE: 'plant_flower_blue',
  PLANT_FLOWER_YELLOW: 'plant_flower_yellow',
  PLANT_PUMPKIN: 'plant_pumpkin',
  PLANT_MELON: 'plant_melon',
  PLANT_SUGARCANE: 'plant_sugarcane',
  PLANT_VINES: 'plant_vines',

  // Rocks & Minerals (20 Types)
  ROCK_GRANITE: 'rock_granite',
  ROCK_DIORITE: 'rock_diorite',
  ROCK_ANDESITE: 'rock_andesite',
  ROCK_BASALT: 'rock_basalt',
  ROCK_LIMESTONE: 'rock_limestone',
  ROCK_MARBLE: 'rock_marble',
  ROCK_SLATE: 'rock_slate',
  ROCK_SANDSTONE: 'rock_sandstone',
  ROCK_SANDY: 'rock_sandy',
  ROCK_OBSIDIAN: 'rock_obsidian',
  ROCK_MOSSY: 'rock_mossy',
  ROCK_JUNGLE: 'rock_jungle',
  ROCK_ICE: 'rock_ice',
  ROCK_MAGMA: 'rock_magma',
  ROCK_MOONSTONE: 'rock_moonstone',
  ROCK_CRYSTAL_RED: 'rock_crystal_red',
  ROCK_CRYSTAL_BLUE: 'rock_crystal_blue',
  ROCK_CRYSTAL_GREEN: 'rock_crystal_green',
  ROCK_CRYSTAL_PURPLE: 'rock_crystal_purple',

  // Ores & Treasures
  CHEST: 'chest',
  ORE_COAL: 'ore_coal',
  ORE_IRON: 'ore_iron',
  ORE_GOLD: 'ore_gold',
  ORE_DIAMOND: 'ore_diamond',
  ORE_MITHRIL: 'ore_mithril',
  ORE_ADAMANTINE: 'ore_adamantine',
} as const); // Helper since TS Enums in Zod can be tricky, using const object or nativeEnum if real TS enum

// Re-defining TS enums as Zod Enums for better schema validation
export const BiomeTypeSchema = z.enum([
  'ocean',
  'beach',
  'plains',
  'forest',
  'desert',
  'mountain',
  'snowy_peaks',
  'lava_wastes',
  'mystic_forest',
  'crystal_peaks',
  'badlands',
  'swamp',
  'tundra',
  'jungle',
  'savanna',
  'fungal_groves',
]);

export const ZLevelSchema = z.union([
  z.literal(-3),
  z.literal(-2),
  z.literal(-1),
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const CoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: ZLevelSchema,
});

export const StructureInfoSchema = z.object({
  type: z.enum(['city', 'castle', 'tower', 'dungeon', 'church', 'cave', 'none']),
  worldX: z.number(),
  worldY: z.number(),
  size: z.number(),
  seed: z.string(),
});

export const TileSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: ZLevelSchema,
  block: z.string(), // BlockTypeSchema ideally
  biome: BiomeTypeSchema,
  isWalkable: z.boolean(),
  isTransparent: z.boolean(),
  variant: z.number().optional(),
  elevation: z.number().optional(),
  moisture: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ChunkDTOSchema = z.object({
  x: z.number(),
  y: z.number(),
  tiles: z.array(z.array(z.array(TileSchema))),
});

export const WorldConfigSchema = z.object({
  seed: z.string(),
  chunkSize: z.number(),
  globalScale: z.number(),
  seaLevel: z.number(),
  elevationScale: z.number(),
  roughness: z.number(),
  detail: z.number(),
  moistureScale: z.number(),
  temperatureOffset: z.number(),
  structureChance: z.number(),
  structureSpacing: z.number(),
  structureSizeAvg: z.number(),
  roadDensity: z.number(),
  fogRadius: z.number(),
});
