# Voxel Math Utilities

This directory contains low-level mathematical primitives specifically optimized for procedural generation.

## Components

### `FastNoise`
A JavaScript implementation of Simplex Noise, optimized for 2D terrain generation.
- **Method**: `noise2D(x, y)` and `fbm(...)`.
- **Use Case**: Generating elevation and moisture heightmaps.

### `Alea`
A seeded pseudo-random number generator (PRNG).
- **Purpose**: Ensures that world generation is deterministic for a given seed.
- **Performance**: Lightweight and fast compared to standard crypto libraries, suitable for tight generation loops.

### Geometry
- `Point3D` interface and `calculateDistance` helper for voxel space operations.
