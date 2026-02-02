import { Alea, FastNoise } from '../math';

describe('Voxel Math Utils', () => {
  describe('Alea PRNG', () => {
    it('should be deterministic', () => {
      const rng1 = new Alea('seed1');
      const rng2 = new Alea('seed1');
      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.next()).toBe(rng2.next());
    });

    it('should diverge with different seeds', () => {
      const rng1 = new Alea('seedA');
      const rng2 = new Alea('seedB');
      expect(rng1.next()).not.toBe(rng2.next());
    });

    it('should generate numbers in [0, 1)', () => {
      const rng = new Alea('test');
      for (let i = 0; i < 100; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('FastNoise', () => {
    it('should be deterministic', () => {
      const noise1 = new FastNoise('noise-seed');
      const noise2 = new FastNoise('noise-seed');

      const v1 = noise1.noise2D(10, 20);
      const v2 = noise2.noise2D(10, 20);
      expect(v1).toBe(v2);
    });

    it('should return consistent FBM values', () => {
      const noise = new FastNoise('fbm-seed');
      const val = noise.fbm(0.5, 0.5, 4);
      expect(typeof val).toBe('number');
      expect(val).not.toBeNaN();
    });
  });
});
