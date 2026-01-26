import { AssetStub, AnchorType, Point } from './types';
import { getVisualBounds, getZoneCentroid } from './visual-analysis';

export const getSmartAnchor = (asset: AssetStub, target: AnchorType): { point: Point, method: string } => {
  const { blueprint, pixelData } = asset;
  const visual = getVisualBounds(pixelData);
  const gridSize = pixelData.length || 32;
  const center = Math.floor(gridSize / 2);
  const centerFallback = { x: center, y: center };

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
          return { point: { x: zone.x, y: zone.minY! }, method: 'Blueprint (Head Top)' };
      }
      return { point: { x: visual.cx, y: visual.minY }, method: 'Visual Extremity (Top)' };
    }

    case 'head_bottom': {
      const zone = getZoneCentroid(blueprint, 'head'); 
      if (zone) {
           return { point: { x: zone.x, y: zone.maxY! }, method: 'Blueprint (Hat Bottom)' };
      }
      return { point: { x: visual.cx, y: visual.maxY }, method: 'Visual Extremity (Bottom)' };
    }

    case 'feet_bottom': {
      const zone = getZoneCentroid(blueprint, 'legs');
      if (zone) {
          return { point: { x: zone.x, y: zone.maxY! }, method: 'Blueprint (Feet Bottom)' };
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
