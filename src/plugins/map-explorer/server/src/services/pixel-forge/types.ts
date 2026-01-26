export type BodyPartType = 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right';
export type CreatureSize = 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain';
export type Archetype = 
  | 'Humanoid' | 'Quadruped' | 'Winged' | 'Ethereal' 
  | 'Sword' | 'Polearm' | 'Shield' | 'Headwear' | 'Body Armor' | 'Legwear' | 'Handwear' | 'Footwear' | 'Accessory';

export interface GenerationConfig {
    race?: string; // slug or name
    gender?: 'male' | 'female';
    skinTone?: string; // Hex
    itemType?: string;
    subType?: string;
    size?: CreatureSize;
}

export interface PixelLayer {
    name: string;
    pixels: (string | null)[][]; // 32x32 grid of Hex or rgba colors
    zIndex: number;
    opacity?: number;
}
