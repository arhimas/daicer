import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupStrapi, cleanupStrapi } from '../../../../tests/setup-strapi';
import crypto from 'crypto';

describe('Determinism', () => {
  beforeAll(async () => {
    await setupStrapi();
  }, 30000);

  afterAll(async () => {
    await cleanupStrapi();
  }, 30000);

  const generateAndHash = async (seed: string, roomId: string): Promise<string> => {
    // 1. Create Room & World Context
    const world = await strapi.documents('api::world.world').create({
      data: {
        name: `World ${seed}`,
        seed: seed,
        chunkSize: 16,
        status: 'published',
      },
    });

    const room = await strapi.documents('api::room.room').create({
      data: {
        roomId: roomId,
        world: world.documentId,
        phase: 'game',
        status: 'published',
      },
    });

    // 2. Generate a 3x3 Chunk Grid (Center 0,0)
    // We call the voxel engine direct to simulate initial gen
    const chunks: string[] = [];

    // Config object mimics what mutation-resolvers pass
    const config = {
      seed: seed,
      chunkSize: 16,
      // Default noise params if not in world
      elevationScale: 1.0,
      roughness: 0.5,
      structureChance: 1.0, // Force structures to test their determinism too
    };

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const chunk = await strapi.service('api::voxel-engine.voxel-engine').getChunk(x, y, config);
        // We deterministically stringify the voxels
        // chunk.voxels is map or array? It's usually a flat list or map.
        // We'll trust JSON.stringify handles it deterministically if we sort keys?
        // Actually, JSON.stringify order is technically not guaranteed for objects keys, but reasonably stable in V8.
        // Better: chunk.id + content hash.

        // Let's rely on JSON string of the whole chunk object for now.
        // It's robust enough for a "Same Run" comparison.
        chunks.push(JSON.stringify(chunk));
      }
    }

    // 3. Hash the Result
    const combined = chunks.join('|');
    return crypto.createHash('sha256').update(combined).digest('hex');
  };

  it('should generate identical chunks for identical seeds', async () => {
    const seed = 'TEST_SEED_ALPHA_123';

    console.log('Generating Run A...');
    const hashA = await generateAndHash(seed, 'room-A');

    console.log('Generating Run B...');
    const hashB = await generateAndHash(seed, 'room-B');

    console.log(`Hash A: ${hashA}`);
    console.log(`Hash B: ${hashB}`);

    expect(hashA).toBe(hashB);
  });

  it('should generate DIFFERENT chunks for different seeds', async () => {
    const seed1 = 'SEED_ONE';
    const seed2 = 'SEED_TWO';

    const hash1 = await generateAndHash(seed1, 'room-1');
    const hash2 = await generateAndHash(seed2, 'room-2');

    expect(hash1).not.toBe(hash2);
  });
});
