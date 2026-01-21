
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain';

export type Archetype = 
  // Creatures
  | 'Humanoid' | 'Quadruped' | 'Winged' | 'Ethereal' 
  // Gear / Items
  | 'Sword' | 'Polearm' | 'Shield' | 'Headwear' | 'Body Armor' | 'Legwear' | 'Handwear' | 'Footwear' | 'Accessory'
  // Terrain
  | 'Solid Block' | 'Landscape/Floor';

export type CreatureSize = 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';

export type ZoneType = 
  | 'core' 
  | 'head' 
  | 'hand_l' 
  | 'hand_r' 
  | 'weapon' 
  | 'back' 
  | 'legs' 
  | 'accessory' 
  | 'none';

export type AssetStatus = 'queued' | 'processing' | 'ready' | 'error';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  archetype: Archetype;
  size: CreatureSize;
  pixelData: string[][]; // 32x32 grid of hex colors
  blueprint: ZoneType[][]; // 32x32 grid of structural metadata
  prompt: string;
  model: string; // The AI model used
  timestamp: number;
  status: AssetStatus;
}

export interface GenerationConfig {
  prompt: string;
  type: AssetType;
  archetype: Archetype;
  size: CreatureSize;
  blueprint: ZoneType[][];
  model: string;
}
