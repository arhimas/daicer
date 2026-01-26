export type ZoneType = 'core' | 'head' | 'hand_l' | 'hand_r' | 'weapon' | 'back' | 'legs' | 'accessory' | 'none';
export type Archetype = string;

export interface AssetStub {
  pixelData: string[][];
  blueprint: ZoneType[][];
  archetype: Archetype;
}

export interface Point {
  x: number;
  y: number;
  minY?: number;
  maxY?: number;
}

export type AnchorType = 'primary_hand' | 'off_hand' | 'head_top' | 'head_bottom' | 'feet_bottom' | 'body_center' | 'item_grip';
