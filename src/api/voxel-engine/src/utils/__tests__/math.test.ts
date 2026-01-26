
import { Alea, FastNoise, calculateDistance } from '../math';

describe('Voxel Engine Math Utils', () => {
  describe('Alea PRNG', () => {
    it('should be deterministic with the same seed', () => {
      const rng1 = new Alea('seed1');
      const rng2 = new Alea('seed1');

      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new Alea('seed1');
      const rng2 = new Alea('seed2');

      expect(rng1.next()).not.toBe(rng2.next());
    });

    it('should produce values in [0, 1)', () => {
      const rng = new Alea('test');
      for (let i = 0; i < 100; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('FastNoise', () => {
    it('should generate deterministic 2D noise', () => {
      const noise1 = new FastNoise('seed1');
      const noise2 = new FastNoise('seed1');

      const val1 = noise1.noise2D(10, 20);
      const val2 = noise2.noise2D(10, 20);

      expect(val1).toBe(val2);
    });

    it('should generate different noise for different coordinates', () => {
      const noise = new FastNoise('seed1');
      const val1 = noise.noise2D(10, 20);
      const val2 = noise.noise2D(11, 20);

      expect(val1).not.toBe(val2);
    });

    it('should support FBM (Fractal Brownian Motion)', () => {
      const noise = new FastNoise('seed1');
      const val = noise.fbm(10, 20, 3);
      expect(typeof val).toBe('number');
      // FBM is normalized, usually around -1 to 1 but depends on implementation.
      // The implementation divides by maxValue, so it should be within reaosnable bounds.
    });
  });

  describe('calculateDistance', () => {
    it('should calculate Euclidean distance correctly', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 4, z: 0 };
      expect(calculateDistance(p1, p2)).toBe(5);
    });

    it('should handle 3D distance', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 1, z: 1 };
      expect(calculateDistance(p1, p2)).toBeCloseTo(Math.sqrt(3));
    });
  });
});
