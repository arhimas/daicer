import { describe, it, expect, vi, beforeEach } from 'vitest';
import lifecycle from '@/api/world/content-types/world/lifecycles';

// Mock Global Strapi
const mockVoxelService = {
  getChunk: vi.fn(),
};

declare let strapi: any;

global.strapi = {
  service: vi.fn(() => mockVoxelService),
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
} as any;

describe('World Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pre-generate chunks after create', async () => {
    const event = {
      result: {
        id: 1,
        documentId: 'doc-1',
        seed: 'test-seed',
        startingRadius: 1, // Small radius for testing (3x3 = 9 calls)
      },
    };

    mockVoxelService.getChunk.mockResolvedValue({});

    await lifecycle.afterCreate(event);

    expect(strapi.service).toHaveBeenCalledWith('api::voxel-engine.voxel-engine');

    // Radius 1: -1 to 1 => 3x3 grid
    expect(mockVoxelService.getChunk).toHaveBeenCalledTimes(9);

    // Verify specific calls
    expect(mockVoxelService.getChunk).toHaveBeenCalledWith(0, 0, expect.any(Object), 'doc-1');
  });

  it('should handle chunk generation errors', async () => {
    const event = {
      result: { id: 1, documentId: 'doc-1', startingRadius: 0 },
    };

    mockVoxelService.getChunk.mockRejectedValue(new Error('Chunk Error'));

    await lifecycle.afterCreate(event);

    expect(strapi.log.error).toHaveBeenCalled();
  });

  it('should use default config values if missing in result', async () => {
    const event = {
      result: {
        id: 1,
        // No config fields
      },
    };

    await lifecycle.afterCreate(event);

    expect(mockVoxelService.getChunk).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({
        seed: 'default',
        chunkSize: 16,
      }),
      1 // Fallback ID
    );
  });
});
