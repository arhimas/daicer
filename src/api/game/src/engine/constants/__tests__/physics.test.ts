import { describe, it, expect } from 'vitest';
import { PHYSICS_CONSTANTS, DEFAULT_WORLD_CONFIG } from '@daicer/engine/constants/physics';

describe('Physics Constants', () => {
  it('should have standard physics values', () => {
    expect(PHYSICS_CONSTANTS.GRAVITY).toBe(9.81);
    expect(PHYSICS_CONSTANTS.CHUNK_SIZE).toBe(32);
  });

  it('should have default world config', () => {
    expect(DEFAULT_WORLD_CONFIG.chunkSize).toBe(32);
    expect(DEFAULT_WORLD_CONFIG.globalScale).toBe(0.01);
  });
});
