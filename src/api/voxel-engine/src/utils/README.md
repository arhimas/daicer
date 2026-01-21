
# Voxel Engine Utils

Core mathematical utilities and procedural generation algorithms for the Voxel Engine.

## Modules

### `math.ts`

Deterministic random number generation and noise functions.

- **`Alea`**: A fast, seedable pseudo-random number generator (PRNG).
- **`FastNoise`**: A 2D Simplex Noise implementation with Fractal Brownian Motion (fbm) support.
- **`calculateDistance`**: Euclidean distance utility for 3D points.

## Usage

```typescript
import { Alea, FastNoise } from './math';

const rng = new Alea('my-seed');
const nextRandom = rng.next(); // 0-1

const noise = new FastNoise('terrain-seed');
const height = noise.fbm(x, y, 4, 0.5, 2.0);
```
