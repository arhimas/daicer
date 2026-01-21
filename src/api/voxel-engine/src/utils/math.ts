/**
 * Alea PRNG for deterministic generation.
 *
 * Implements the Alea algorithm (Johannes Baagøe) for high-quality pseudo-random number generation.
 * Crucial for deterministic procedural generation in the voxel engine.
 *
 * @see {@link https://github.com/nquinlan/better-random-numbers-for-javascript-mirror}
 */
export class Alea {
  private s0: number = 0;
  private s1: number = 0;
  private s2: number = 0;
  private c: number = 1;

  /**
   * Creates a new Alea PRNG instance.
   *
   * @param {string} seed - The seed string for deterministic generation.
   */
  constructor(seed: string) {
    this.seed(seed);
  }

  /**
   * Mash function for hashing the seed.
   *
   * @param {string | number} data - Data to mash.
   * @returns {number} The mashed value.
   */
  private mash(data: string | number): number {
    let n = 0xefc8249d;
    const str = String(data);
    for (let i = 0; i < str.length; i++) {
      n += str.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }
    return (n >>> 0) * 2.3283064365386963e-10;
  }

  /**
   * Initializes the PRNG state with the given seed.
   *
   * @param {string} seed - The initialization seed.
   */
  private seed(seed: string) {
    this.s0 = this.mash(' ');
    this.s1 = this.mash(' ');
    this.s2 = this.mash(' ');
    this.c = 1;

    this.s0 -= this.mash(seed);
    if (this.s0 < 0) this.s0 += 1;
    this.s1 -= this.mash(seed);
    if (this.s1 < 0) this.s1 += 1;
    this.s2 -= this.mash(seed);
    if (this.s2 < 0) this.s2 += 1;
  }

  /**
   * Returns the next random number in the sequence [0, 1).
   *
   * @returns {number} A pseudo-random number between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.c = t | 0;
    this.s2 = t - this.c;
    return this.s2;
  }
}

/**
 * Fast Simplex Noise Implementation (Simplified for 2D).
 *
 * Provides 2D Simplex Noise and Fractal Brownian Motion (fbm) for terrain generation.
 * Uses `Alea` for deterministic permutation table generation.
 */
export class FastNoise {
  private perm: number[] = [];
  private rng: Alea;

  /**
   * Creates a new FastNoise instance.
   *
   * @param {string} seed - The seed for the noise generator.
   */
  constructor(seed: string) {
    this.rng = new Alea(seed);
    this.buildPermutationTable();
  }

  /**
   * Builds the permutation table using the PRNG.
   */
  private buildPermutationTable() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 0; i < 255; i++) {
      const r = i + ~~(this.rng.next() * (256 - i));
      const aux = p[r]!;
      p[r] = p[i]!;
      p[i] = aux;
    }
    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255]!;
  }

  private dot(g: number[], x: number, y: number) {
    return g[0]! * x + g[1]! * y;
  }

  private grad2 = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
  ];

  /**
   * Generates 2D Simplex Noise.
   *
   * @param {number} xin - X coordinate.
   * @param {number} yin - Y coordinate.
   * @returns {number} Noise value (typically between -1 and 1).
   */
  public noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.perm[ii + this.perm[jj]!]! % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]!]! % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]!]! % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    let n0_val = 0;
    if (t0 >= 0) {
      t0 *= t0;
      n0_val = t0 * t0 * this.dot(this.grad2[gi0]!, x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    let n1_val = 0;
    if (t1 >= 0) {
      t1 *= t1;
      n1_val = t1 * t1 * this.dot(this.grad2[gi1]!, x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    let n2_val = 0;
    if (t2 >= 0) {
      t2 *= t2;
      n2_val = t2 * t2 * this.dot(this.grad2[gi2]!, x2, y2);
    }

    return 70.0 * (n0_val + n1_val + n2_val);
  }

  /**
   * Fractal Brownian Motion (fbm).
   *
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} octaves - Number of noise layers (octaves).
   * @param {number} persistence - How much amplitude decreases per octave (default 0.5).
   * @param {number} lacunarity - How much frequency increases per octave (default 2.0).
   * @returns {number} The combined noise value (normalized).
   */
  public fbm(x: number, y: number, octaves: number, persistence: number = 0.5, lacunarity: number = 2.0): number {
    let total = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

/**
 * Represents a point in 3D space.
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates Euclidean distance between two 3D points.
 *
 * @param {Point3D} a - First point.
 * @param {Point3D} b - Second point.
 * @returns {number} Distance between a and b.
 */
export function calculateDistance(a: Point3D, b: Point3D): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}
