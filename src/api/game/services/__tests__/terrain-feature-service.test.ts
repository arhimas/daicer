/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import terrainFeatureServiceFactory from '../terrain-feature-service';

describe('Terrain Feature Service', () => {
  let service: any; // Will be typed when service is typed
  let mockStrapi: any;
  let mockSpawnService: any;
  let mockChunkManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSpawnService = {
      spawn: vi.fn().mockResolvedValue({ id: 'spawned-ent' }),
    };

    mockChunkManager = {
      editVoxel: vi.fn().mockResolvedValue(true),
    };

    mockStrapi = {
      db: {
        query: vi.fn(() => ({
          findOne: vi.fn().mockImplementation(async ({ where }) => {
            if (where['$or']?.some((c: any) => c.slug === 'awakened-tree')) {
              return { documentId: 'ent-bp', type: 'plant' }; // Mock blueprint
            }
            return null;
          }),
        })),
      },
      service: vi.fn((uid) => {
        if (uid === 'api::game.spawn-service') return mockSpawnService;
        if (uid === 'api::voxel-engine.chunk-manager') return mockChunkManager;
        return null;
      }),
    };

    service = terrainFeatureServiceFactory({ strapi: mockStrapi });
  });

  it('should spawn entity if blueprint found', async () => {
    await service.spawnFeature('room-1', 'plant', 'Awakened Tree', { x: 0, y: 0, z: 0 });

    expect(mockSpawnService.spawn).toHaveBeenCalledWith(
      'room-1',
      expect.objectContaining({ blueprintId: 'ent-bp', type: 'monster' })
    );
    expect(mockChunkManager.editVoxel).not.toHaveBeenCalled();
  });

  it('should fallback to voxel generation if no blueprint', async () => {
    await service.spawnFeature('room-1', 'tree', 'Oak', { x: 10, y: 10, z: 0 });

    expect(mockSpawnService.spawn).not.toHaveBeenCalled();
    // Oak tree generation should trigger voxel edits
    expect(mockChunkManager.editVoxel).toHaveBeenCalled();
  });
});
