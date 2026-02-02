import { Point, ZoneType } from './types';

// Find the visual bounding box of the non-transparent pixels
export const getVisualBounds = (pixels: string[][]) => {
  const height = pixels.length;
  const width = pixels[0]?.length || 0;

  let minX = width,
    maxX = -1,
    minY = height,
    maxY = -1;
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

  return hasPixels
    ? {
        minX,
        maxX,
        minY,
        maxY,
        cx: Math.floor((minX + maxX) / 2),
        cy: Math.floor((minY + maxY) / 2),
      }
    : null;
};

// Find the centroid of a specific zone
export const getZoneCentroid = (blueprint: ZoneType[][], targetZone: ZoneType): Point | null => {
  let sumX = 0,
    sumY = 0,
    count = 0;
  // We also track bounds to find specific edges (like top of head)
  const height = blueprint?.length || 32;
  let minY = height,
    maxY = -1;

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
    minY,
    maxY,
  };
};
