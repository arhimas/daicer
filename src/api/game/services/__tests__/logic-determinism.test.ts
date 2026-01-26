/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect } from 'vitest';
import { ChunkBuilder } from '../../../voxel-engine/services/chunk-builder'; // Relative path from api/game/services/__tests__
import crypto from 'crypto';

// Relative path adjustment:
// File is in: src/api/game/services/__tests__/logic-determinism.test.ts
// ChunkBuilder is in: src/api/voxel-engine/services/chunk-builder.ts
// Path: ../../../voxel-engine/services/chunk-builder

describe('World Generation Logic Determinism (ChunkBuilder)', () => {
  const generateAndHash = (seed: string): string => {
    const config = {
      seed: seed,
      chunkSize: 16,
      elevationScale: 1.0,
      roughness: 0.5,
      structureChance: 1.0, // Ensure structures generate
    };

    const builder = new ChunkBuilder(config);

    // Generate a 3x3 Grid
    const chunks: string[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const chunk = builder.generateChunk(x, y);
        chunks.push(JSON.stringify(chunk));
      }
    }

    const combined = chunks.join('|');
    return crypto.createHash('sha256').update(combined).digest('hex');
  };

  it('should produce identical output for the same seed (Run A vs Run B)', () => {
    const seed = 'LOGIC_TEST_ALPHA';

    const hashA = generateAndHash(seed);
    const hashB = generateAndHash(seed);

    expect(hashA).toBe(hashB);
  });

  it('should produce different output for different seeds', () => {
    const hash1 = generateAndHash('SEED_1');
    const hash2 = generateAndHash('SEED_2');

    expect(hash1).not.toBe(hash2);
  });
});
