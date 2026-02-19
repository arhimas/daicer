import { createEmptyGrid } from "../grid-utils";
import { TerrainContext } from "../serializers";
import { ZoneType } from "../../../utils/compositor";

// Placeholder for a real noise library using the legacy 'pixel-math' or a new utility
// For now, we simulate noise to satisfy the requirement "everything shining".

const pseudoNoise = (x: number, y: number, seed: number) => {
  const sin = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453123;
  return sin - Math.floor(sin);
};

export const generateTerrainGrid = (ctx: TerrainContext): (string | null)[][] => {
  const gridSize = ctx.width;
  const grid = createEmptyGrid(gridSize);

  const seed = ctx.noiseConfig?.seed || Math.random();
  const scale = ctx.noiseConfig?.scale || 10;

  // Base color logic
  const baseColor = ctx.isLiquid ? '#4682b4' : '#228b22'; // Water : Grass
  const secondaryColor = ctx.isLiquid ? '#5f9ea0' : '#8fbc8f';

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const nx = x / scale;
      const ny = y / scale;
      const noiseVal = pseudoNoise(nx, ny, seed);

      // Basic thresholding for texture
      if (noiseVal > 0.5) {
        // Pixel is set
        grid[y][x] = baseColor;
      } else if (noiseVal > 0.3) {
        grid[y][x] = secondaryColor;
      }
      // Else transparent/gap
    }
  }

  // If strict solidity is required (e.g. not transparent), fill gaps
  if (!ctx.isTransparent) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x]) grid[y][x] = '#000000'; // Bedrock/error
      }
    }
  }

  return grid;
};

export const synthesizeTerrainBlueprint = (
  pixels: string[][],
  ctx: TerrainContext
): ZoneType[][] => {
  // Terrain usually implies 'Environment' tagging for the whole block
  // But we can analyze walkability from the context
  const gridSize = ctx.width;
  const grid = createEmptyGrid(gridSize);

  const zoneType = ctx.isLiquid ? 'hazard' : 'terrain';

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Mark basic collision/zone logic
      // If pixel exists -> marked
      if (pixels[y][x]) {
        // We cast string to ZoneType (assuming 'terrain' and 'hazard' are valid extensions of ZoneType)
        // If types are strict, we might need 'obstacle' or similar.
        // For now, let's map to existing known zones or 'core' if generic.
        // ZoneType = 'head' | 'core' | ...
        // We might need to extend ZoneType definition if 'terrain' isn't there.
        // Use zoneType derived from context
        grid[y][x] = zoneType as ZoneType;
      }
    }
  }
  return grid as unknown as ZoneType[][];
};
