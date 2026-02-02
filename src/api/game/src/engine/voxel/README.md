# Voxel Engine

This directory contains the core logic for the **Daicer Voxel Engine**, responsible for procedural terrain generation, chunk management, and deterministic world building.

## Core Components

### `TerrainGenerator` ([terrain-generator.ts](./terrain-generator.ts))

The heart of the voxel system. It converts seed inputs and configuration into volumetric voxel data.

- **Layers**: Generates 7 layers of verticality (3 underground, 1 surface, 3 sky).
- **Noise**: Uses Simplex noise and FBM for elevation and moisture maps.
- **Biomes**: Deterministically resolves biomes based on moisture/elevation overlap using the Whittaker diagram concept.

### `Config` ([config.ts](./config.ts))

Defines the `DEFAULT_GENERATION_PARAMS` used to control the procedural generation algorithms, such as noise scale, roughness, and sea level settings.

### Utilities ([utils/](./utils))

Core mathematical helpers required for volumetric generation:

- **FastNoise**: Efficient 2D Simplex noise implementation.
- **Alea**: Seedable PRNG for deterministic results.

## Usage

![Voxel Generation](/Users/lg/.gemini/antigravity/brain/55004d21-95c0-4b67-835f-042b83f6a447/voxel_gen_diagram.png)

```typescript
import { createUnifiedTerrainGenerator } from './terrain-generator';

const generator = createUnifiedTerrainGenerator('my-seed-123');

// Generate chunk at (0, 0)
const chunkData = generator(0, 0);

// Access a voxel
const tile = chunkData[3][0][0]; // Surface layer, top-left
console.log(tile.biome, tile.block);
```
