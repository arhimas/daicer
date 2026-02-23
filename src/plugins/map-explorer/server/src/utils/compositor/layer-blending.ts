import { AssetStub, Archetype, Point } from './types';
import { getSmartAnchor } from './smart-anchors';
import { blendPixels } from '../pixel-math';

export const compositeLoadout = (
  baseAsset: AssetStub,
  equipment: AssetStub[]
): { grid: string[][]; status: string } => {
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
  const newGrid = baseAsset.pixelData.map((row) => [...row]);
  const logs: string[] = [];

  sortedLoadout.forEach((overlayAsset) => {
    let baseAnchorPoint: { point: Point; method: string };
    let overlayAnchorPoint: { point: Point; method: string };

    const arch = overlayAsset.archetype;

    if (arch === 'Headwear') {
      baseAnchorPoint = getSmartAnchor(baseAsset, 'head_top');
      overlayAnchorPoint = getSmartAnchor(overlayAsset, 'head_bottom');
    } else if (
      arch === 'Footwear' ||
      arch === 'Handwear' ||
      arch === 'Body Armor' ||
      arch === 'Legwear'
    ) {
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
          // Dynamic bounds check
          const gridH = newGrid.length;
          const gridW = newGrid[0].length;

          if (targetX >= 0 && targetX < gridW && targetY >= 0 && targetY < gridH) {
            const bgPixel = newGrid[targetY][targetX] || 'transparent'; // Handle null/undefined
            newGrid[targetY][targetX] = blendPixels(bgPixel, color);
          }
        }
      });
    });

    logs.push(arch);
  });

  const status = `Attached: ${logs.join(', ')}`;
  return { grid: newGrid, status };
};
