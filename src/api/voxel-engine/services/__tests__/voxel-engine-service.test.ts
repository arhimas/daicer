import { describe, it, expect, vi, beforeEach } from 'vitest';
import voxelEngineFactory from '@/api/voxel-engine/services/voxel-engine';

// Mock ChunkManager singleton
const mockChunkManager = {
  getChunk: vi.fn(),
  editVoxel: vi.fn(),
};

vi.mock('@/api/voxel-engine/services/chunk-manager', () => ({
  ChunkManager: {
    getInstance: () => mockChunkManager,
  },
}));

describe('Voxel Engine Service', () => {
  let service: any;

  beforeEach(() => {
    service = voxelEngineFactory();
    vi.clearAllMocks();
  });

  it('getChunk should delegate to ChunkManager', async () => {
    const config = { seed: 123 } as any;
    await service.getChunk(1, 2, config, 'w1');
    expect(mockChunkManager.getChunk).toHaveBeenCalledWith(1, 2, config, 'w1');
  });

  it('editVoxel should delegate to ChunkManager', async () => {
    await service.editVoxel(1, 1, 0, 0, 0, 'dirt', 'reason', 'w1', { meta: 1 });
    expect(mockChunkManager.editVoxel).toHaveBeenCalledWith(1, 1, 0, 0, 0, 'dirt', 'w1', 'reason', { meta: 1 });
  });
});
