import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapControllerFactory from '@/plugins/map-explorer/server/src/controllers/map-controller';
import type { Core } from '@strapi/strapi';

// Mocks
const mockVoxelEngine = {
  getChunk: vi.fn(),
  editVoxel: vi.fn(),
};
const mockMapService = {
  getWorldConfig: vi.fn(),
  updateWorldConfig: vi.fn(),
  getConstructions: vi.fn(),
  saveConstruction: vi.fn(),
};
const mockPixelForge = {
  generateCreature: vi.fn(),
  compose: vi.fn(),
  generateEntity: vi.fn(),
  generateItem: vi.fn(),
};
const mockHistoryService = {
  getTimelineData: vi.fn(),
  replayTo: vi.fn()
};

const mockStrapi = {
  plugin: vi.fn((uid) => {
    if (uid === 'map-explorer') {
      return {
        service: vi.fn((serviceName) => {
          if (serviceName === 'mapService') return mockMapService;
          if (serviceName === 'pixelForgeService') return mockPixelForge;
        })
      };
    }
  }),
  service: vi.fn((uid) => {
    if (uid === 'api::voxel-engine.voxel-engine') return mockVoxelEngine;
    if (uid === 'api::game.history-service') return mockHistoryService;
  }),
  log: {
    warn: vi.fn(),
    error: vi.fn(),
  }
};

describe('MapController', () => {
    let controller: any;
    // Helper to mock context
    const createCtx = (body = {}, query = {}, params = {}) => ({
        request: { body },
        query,
        params,
        badRequest: vi.fn(),
        body: null
    });

    beforeEach(() => {
        vi.clearAllMocks();
        controller = mapControllerFactory({ strapi: mockStrapi as unknown as Core.Strapi });
    });

    describe('getMapChunk', () => {
        it('should return chunk data', async () => {
             const ctx = createCtx({}, { x: '0', y: '0' });
             mockMapService.getWorldConfig.mockResolvedValue({ seed: 'test' });
             mockVoxelEngine.getChunk.mockResolvedValue({ tiles: [] });

             await controller.getMapChunk(ctx);

             expect(mockVoxelEngine.getChunk).toHaveBeenCalledWith(0, 0, { seed: 'test' }, undefined);
             expect(ctx.body).toEqual({ tiles: [] });
        });

        it('should badRequest on missing coords', async () => {
             const ctx = createCtx({}, {});
             await controller.getMapChunk(ctx);
             expect(ctx.badRequest).toHaveBeenCalledWith('Missing coordinates');
        });
    });

    describe('updateVoxel', () => {
        it('should update voxel', async () => {
             const ctx = createCtx({ chunkX: 0, chunkY: 0, voxelX: 0, voxelY: 0, voxelZ: 0, newType: 'stone' });
             await controller.updateVoxel(ctx);
             
             expect(mockVoxelEngine.editVoxel).toHaveBeenCalled();
             expect(ctx.body).toEqual({ success: true });
        });

        it('should handle errors', async () => {
             const ctx = createCtx({});
             mockVoxelEngine.editVoxel.mockRejectedValue(new Error('Fail'));
             await controller.updateVoxel(ctx);
             expect(ctx.badRequest).toHaveBeenCalled();
        });
    });

    describe('generateTexture', () => {
        it('should use PixelForge if available', async () => {
             const ctx = createCtx({ size: 'Medium', config: {} });
             mockPixelForge.generateCreature.mockReturnValue([]);
             mockPixelForge.compose.mockReturnValue([['#fff']]);
             
             await controller.generateTexture(ctx);
             
             expect(mockPixelForge.generateCreature).toHaveBeenCalled();
             expect(ctx.body.tiles).toBeDefined();
        });
        
        it('should fallback to legacy if PixelForge fails', async () => {
             const ctx = createCtx({ size: 'Medium' });
             mockPixelForge.generateCreature.mockImplementation(() => { throw new Error('Forge Down'); });
             
             await controller.generateTexture(ctx);
             
             expect(mockStrapi.log.warn).toHaveBeenCalled();
             expect(ctx.body.tiles).toBeDefined();
             expect(ctx.body.tiles[0].length).toBe(32); // Legacy grid size
        });
    });

    describe('generatePixelArt', () => {
        it('should generate entity art', async () => {
             const ctx = createCtx({ id: 'ent1', model: 'entity' });
             mockPixelForge.generateEntity.mockResolvedValue([['#000']]);
             
             await controller.generatePixelArt(ctx);
             
             expect(mockPixelForge.generateEntity).toHaveBeenCalledWith('ent1');
             expect(ctx.body.pixels).toEqual([['#000']]);
        });
        
         it('should validate params', async () => {
             const ctx = createCtx({ id: 'ent1' }); // missing model
             await controller.generatePixelArt(ctx);
             expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Invalid parameters'));
        });
    });

    describe('World Config & Constructions', () => {
        it('should get world config', async () => {
             const ctx = createCtx();
             mockMapService.getWorldConfig.mockResolvedValue({ seed: 'test' });
             await controller.getWorldConfig(ctx);
             expect(mockMapService.getWorldConfig).toHaveBeenCalled();
             expect(ctx.body).toEqual({ seed: 'test' });
        });

        it('should update world config', async () => {
             const ctx = createCtx({ seed: 'new' });
             mockMapService.updateWorldConfig.mockResolvedValue({ seed: 'new' });
             await controller.updateWorldConfig(ctx);
             expect(mockMapService.updateWorldConfig).toHaveBeenCalledWith({ seed: 'new' });
             expect(ctx.body).toEqual({ seed: 'new' });
        });

        it('should get constructions', async () => {
             const ctx = createCtx();
             mockMapService.getConstructions.mockResolvedValue([]);
             await controller.getConstructions(ctx);
             expect(mockMapService.getConstructions).toHaveBeenCalled();
             expect(ctx.body).toEqual([]);
        });

        it('should save construction', async () => {
             const ctx = createCtx({ type: 'house' });
             mockMapService.saveConstruction.mockResolvedValue({ id: 1 });
             await controller.saveConstruction(ctx);
             expect(mockMapService.saveConstruction).toHaveBeenCalledWith({ type: 'house' });
             expect(ctx.body).toEqual({ id: 1 });
        });
    });

    describe('Timeline & Replay', () => {
        it('should get timeline', async () => {
             const ctx = createCtx({}, { roomId: 'room1' });
             mockHistoryService.getTimelineData.mockResolvedValue([]);
             
             await controller.getTimeline(ctx);
             
             expect(mockHistoryService.getTimelineData).toHaveBeenCalledWith('room1');
             expect(ctx.body).toEqual([]);
        });

        it('should fail getTimeline without roomId', async () => {
             const ctx = createCtx();
             await controller.getTimeline(ctx);
             expect(ctx.badRequest).toHaveBeenCalledWith('Missing roomId');
        });

        it('should replay state', async () => {
             const ctx = createCtx({ roomId: 'room1', timestamp: 100 });
             mockHistoryService.replayTo.mockResolvedValue({ state: 'replayed' });
             
             await controller.replay(ctx);
             
             expect(mockHistoryService.replayTo).toHaveBeenCalledWith('room1', 100);
             expect(ctx.body).toEqual({ state: 'replayed' });
        });

        it('should fail replay with invalid params', async () => {
             const ctx = createCtx({}, {});
             await controller.replay(ctx);
             expect(ctx.badRequest).toHaveBeenCalledWith('Missing params');
        });
    });
});
