
// Types
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
}

// --- PIXEL ANALYSIS TOOLS ---

// Find the visual bounding box of the non-transparent pixels
export const getVisualBounds = (pixels: string[][]) => {
  let minX = 32, maxX = -1, minY = 32, maxY = -1;
  let hasPixels = false;

  pixels.forEach((row, y) => {
    row.forEach((color, x) => {
      // Logic for "has color" - handle transparent string or null
      if (color && color !== 'transparent' && color !== 'none') {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });
  });

  return hasPixels ? { minX, maxX, minY, maxY, cx: Math.floor((minX + maxX) / 2), cy: Math.floor((minY + maxY) / 2) } : null;
};

// Find the centroid of a specific zone
export const getZoneCentroid = (blueprint: ZoneType[][], targetZone: ZoneType): Point | null => {
  let sumX = 0, sumY = 0, count = 0;
  // We also track bounds to find specific edges (like top of head)
  let minY = 32, maxY = -1;

  if (!blueprint) return null;

  blueprint.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === targetZone) {
        sumX += x;
        sumY += y;
        count++;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });
  });

  if (count === 0) return null;

  return {
    x: Math.round(sumX / count),
    y: Math.round(sumY / count), // Default center
    // We attach extra props for smarter alignment (not in Point interface but useful internally)
    // @ts-ignore - attaching internal props
    minY, 
    // @ts-ignore
    maxY
  };
};

// --- SMART ANCHOR LOGIC ---

export type AnchorType = 'primary_hand' | 'off_hand' | 'head_top' | 'head_bottom' | 'feet_bottom' | 'body_center' | 'item_grip';

const getSmartAnchor = (asset: AssetStub, target: AnchorType): { point: Point, method: string } => {
  const { blueprint, pixelData } = asset;
  const visual = getVisualBounds(pixelData);
  const centerFallback = { x: 16, y: 16 };

  if (!visual) return { point: centerFallback, method: 'Empty Grid' };

  switch (target) {
    case 'primary_hand': {
      // 1. Try Blueprint 'hand_r'
      const zone = getZoneCentroid(blueprint, 'hand_r');
      if (zone) return { point: zone, method: 'Blueprint (Hand R)' };
      
      // 2. Smart Scan: Right-most visual extremity (common for 2D side view weapons)
      const rightMostX = visual.maxX;
      let sumY = 0, count = 0;
      pixelData.forEach((row, y) => {
         if (row[rightMostX] && row[rightMostX] !== 'transparent') {
             sumY += y; count++;
         }
      });
      if (count > 0) return { point: { x: rightMostX - 1, y: Math.round(sumY / count) }, method: 'Visual Extremity (Right)' };
      
      return { point: { x: visual.maxX, y: visual.cy }, method: 'Visual Bounds (Right)' };
    }

    case 'off_hand': {
      const zone = getZoneCentroid(blueprint, 'hand_l');
      if (zone) return { point: zone, method: 'Blueprint (Hand L)' };
      return { point: { x: visual.minX + 1, y: visual.cy }, method: 'Visual Extremity (Left)' };
    }

    case 'head_top': {
      const zone = getZoneCentroid(blueprint, 'head');
      if (zone) {
          // @ts-ignore
          return { point: { x: zone.x, y: zone.minY }, method: 'Blueprint (Head Top)' };
      }
      return { point: { x: visual.cx, y: visual.minY }, method: 'Visual Extremity (Top)' };
    }

    case 'head_bottom': {
      const zone = getZoneCentroid(blueprint, 'head'); 
      if (zone) {
           // @ts-ignore
           return { point: { x: zone.x, y: zone.maxY }, method: 'Blueprint (Hat Bottom)' };
      }
      return { point: { x: visual.cx, y: visual.maxY }, method: 'Visual Extremity (Bottom)' };
    }

    case 'feet_bottom': {
      const zone = getZoneCentroid(blueprint, 'legs');
      if (zone) {
          // @ts-ignore
          return { point: { x: zone.x, y: zone.maxY }, method: 'Blueprint (Feet Bottom)' };
      }
      return { point: { x: visual.cx, y: visual.maxY }, method: 'Visual Extremity (Bottom)' };
    }
    
    case 'item_grip': {
      const core = getZoneCentroid(blueprint, 'core');
      if (core) return { point: core, method: 'Blueprint (Core/Handle)' };
      
      const weapon = getZoneCentroid(blueprint, 'weapon');
      if (weapon) return { point: weapon, method: 'Blueprint (Weapon Center)' };

      return { point: { x: visual.cx, y: visual.cy }, method: 'Visual Center' };
    }

    case 'body_center':
    default: {
      const core = getZoneCentroid(blueprint, 'core');
      if (core) return { point: core, method: 'Blueprint (Core)' };
      return { point: { x: visual.cx, y: visual.cy }, method: 'Visual Center' };
    }
  }
};


// --- COMPOSITOR ---

export const compositeLoadout = (baseAsset: AssetStub, equipment: AssetStub[]): { grid: string[][], status: string } => {
  // Z-Index Sorting
  const score = (arch: Archetype) => {
    if (arch === 'Legwear') return 1;
    if (arch === 'Body Armor') return 2;
    if (arch === 'Footwear') return 3;
    if (arch === 'Handwear') return 4;
    if (arch === 'Headwear') return 5;
    if (arch === 'Accessory') return 6;
    if (arch === 'Shield') return 7;
    return 8; // Weapons
  };

  const sortedLoadout = [...equipment].sort((a, b) => score(a.archetype) - score(b.archetype));

  // Clone base grid
  const newGrid = baseAsset.pixelData.map(row => [...row]);
  const logs: string[] = [];

  sortedLoadout.forEach(overlayAsset => {
      let baseAnchorPoint: { point: Point, method: string };
      let overlayAnchorPoint: { point: Point, method: string };
      
      const arch = overlayAsset.archetype;
      
      if (arch === 'Headwear') {
          baseAnchorPoint = getSmartAnchor(baseAsset, 'head_top');
          overlayAnchorPoint = getSmartAnchor(overlayAsset, 'head_bottom');
      } else if (arch === 'Footwear' || arch === 'Handwear' || arch === 'Body Armor' || arch === 'Legwear') {
          baseAnchorPoint = getSmartAnchor(baseAsset, 'body_center');
          overlayAnchorPoint = getSmartAnchor(overlayAsset, 'body_center');
      } else if (arch === 'Shield') {
          baseAnchorPoint = getSmartAnchor(baseAsset, 'off_hand');
          overlayAnchorPoint = getSmartAnchor(overlayAsset, 'item_grip');
      } else {
          baseAnchorPoint = getSmartAnchor(baseAsset, 'primary_hand');
          overlayAnchorPoint = getSmartAnchor(overlayAsset, 'item_grip');
      }

      const offsetX = baseAnchorPoint.point.x - overlayAnchorPoint.point.x;
      const offsetY = baseAnchorPoint.point.y - overlayAnchorPoint.point.y;

      overlayAsset.pixelData.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color && color !== 'transparent' && color !== 'none') {
            const targetX = x + offsetX;
            const targetY = y + offsetY;
            if (targetX >= 0 && targetX < 32 && targetY >= 0 && targetY < 32) {
              newGrid[targetY][targetX] = color;
            }
          }
        });
      });

      logs.push(arch);
  });

  const status = `Attached: ${logs.join(', ')}`;
  return { grid: newGrid, status };
};
