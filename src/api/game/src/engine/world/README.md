# World Engine

This directory contains the `WorldAtlas` system, which manages macro-scale world features that overlay the voxel terrain generation.

## `WorldAtlas`

The `WorldAtlas` class uses a **Hierarchical Voronoi** (or Jittered Grid) approach to divide the infinite world plane into organic "Regions". Each region has a center point, a unique ID, and procedural properties.

### Key Features

1.  **Infinite Regions**: Uses coordinate-based hashing (via `Alea`) to generate regions deterministically for any (x, y) coordinate without storing a global map.
2.  **Structure Placement**: Determines where Cities, Villages, and Ruins are placed based on region centers. The `TerrainGenerator` uses this information to flatten the ground for these structures.
3.  **Region Metadata**: Simulates biome logic, naming (Markov chains), and wealth/danger factors for each region.

## Usage

```typescript
import { WorldAtlas } from './world-atlas';
import { DEFAULT_GENERATION_PARAMS } from '../voxel/config';

const atlas = new WorldAtlas(DEFAULT_GENERATION_PARAMS);

// Get the region enclosing player position
const region = atlas.getRegion(playerX, playerY);
console.log(`You are in ${region.name} (${region.biome})`);

// Check for structures
const structure = atlas.getStructure(playerX, playerY);
if (structure) {
  console.log(`Standing in ${structure.name} (${structure.type})`);
}
```
