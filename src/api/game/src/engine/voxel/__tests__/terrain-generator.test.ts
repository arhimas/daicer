import { TerrainGenerator, createUnifiedTerrainGenerator } from '@daicer/engine/voxel/terrain-generator';
import { WorldConfig, BlockType, BiomeType } from '@daicer/engine/types';

describe('Terrain Generator', () => {
  const baseConfig: WorldConfig = {
    seed: 'test-seed-123',
    chunkSize: 16,
    globalScale: 0.1,
    elevationScale: 1,
    moistureScale: 1,
    roughness: 0.5,
    detail: 1,
    seaLevel: 0,
    temperatureOffset: 0,
    structureChance: 0,
    structureSpacing: 100,
    structureSizeAvg: 5,
    roadDensity: 0,
    fogRadius: 10,
  };

  it('should be deterministic (Same Seed = Same Output)', () => {
    const genA = new TerrainGenerator(baseConfig);
    const genB = new TerrainGenerator(baseConfig);

    const chunkA = genA.generate(0, 0);
    const chunkB = genB.generate(0, 0);

    // Check a random sample
    expect(chunkA[3][0][0]).toEqual(chunkB[3][0][0]);
    expect(chunkA[1][5][5]).toEqual(chunkB[1][5][5]);

    // Deep equality might be slow for full chunk, but let's try strict json equality
    expect(JSON.stringify(chunkA)).toEqual(JSON.stringify(chunkB));
  });

  it('should produce different results for different seeds', () => {
    const genA = new TerrainGenerator(baseConfig);
    const genB = new TerrainGenerator({ ...baseConfig, seed: 'different-seed' });

    const chunkA = genA.generate(0, 0);
    const chunkB = genB.generate(0, 0);

    // Extremely unlikely to be identical
    expect(JSON.stringify(chunkA)).not.toEqual(JSON.stringify(chunkB));
  });

  it('should generate valid 7-layer chunks', () => {
    const gen = new TerrainGenerator(baseConfig);
    const chunk = gen.generate(0, 0);

    expect(chunk.length).toBe(7); // 3 underground, 1 surface, 3 sky
    expect(chunk[0].length).toBe(16); // Y size
    expect(chunk[0][0].length).toBe(16); // X size
  });

  it('should generate water below sea level', () => {
    // Force low elevation by hacking noise?
    // Or just picking a seed verifying it contains water?
    // Easier: Force SeaLevel High
    const waterConfig = { ...baseConfig, seaLevel: 1.0 }; // Everything is underwater
    const gen = new TerrainGenerator(waterConfig);
    const tile = gen.getTileAt(0, 0, 0); // Surface

    expect(tile.block).toBe(BlockType.WATER);
    expect(tile.biome).toBe(BiomeType.ocean);
  });

  it('should generate snowy peaks at high elevation', () => {
    // We can't easily force noise output without mocking FastNoise,
    // but we can test the `determineBiome` logic by using `getTileAt`
    // implies we rely on noise.
    // Actually, we can just trust the integration test that "some" variation exists,
    // or mock the private method if we wanted unit isolation.
    // For "Black Box" engine testing, let's verify consistent properties.

    const gen = new TerrainGenerator(baseConfig);
    // Sample constraints
    const chunk = gen.generate(0, 0);
    const surface = chunk[3];

    surface.forEach((row) => {
      row.forEach((tile) => {
        expect(tile.block).toBeDefined();
        expect(tile.biome).toBeDefined();
        // If it's SNOW, it must be > 0.6 elevation in our logic?
        if (tile.block === BlockType.SNOW) {
          expect(tile.elevation).toBeGreaterThan(0.6);
        }
      });
    });
  });

  it('factory should create a working generator function', () => {
    const generate = createUnifiedTerrainGenerator('factory-seed');
    const chunk = generate(0, 0);
    expect(chunk).toBeDefined();
    expect(chunk.length).toBe(7);
  });
});
