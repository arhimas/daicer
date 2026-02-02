import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Retrieves a generated 3D Chunk for the Map Explorer.
   * Can filter by World ID if persistent changes are tracked per world.
   * GET /api/map-explorer/chunk
   *
   * @param ctx - Koa context (query: { x, y, worldId })
   */
  async getMapChunk(ctx) {
    const { x, y } = ctx.query;
    if (!x || !y) {
      return ctx.badRequest('Missing coordinates');
    }

    try {
      const config = await strapi.plugin('map-explorer').service('mapService').getWorldConfig();
      // If valid worldId passed, we might need a specific config?
      // For now, assume config is generic or derived from worldId if implemented properly in service.
      const worldId = ctx.query.worldId as string;

      const chunk = await strapi
        .service('api::voxel-engine.voxel-engine')
        .getChunk(
          typeof x === 'string' ? parseInt(x) : 0,
          typeof y === 'string' ? parseInt(y) : 0,
          config,
          worldId
        );
      ctx.body = chunk;
    } catch (err) {
      ctx.badRequest('Failed to fetch chunk', { error: err });
    }
  },

  /**
   * Updates a single Voxel type/state.
   * Persists changes to the Voxel Engine Service.
   * POST /api/map-explorer/voxel
   */
  async updateVoxel(ctx) {
    const { chunkX, chunkY, voxelX, voxelY, voxelZ, newType, reason, worldId } = ctx.request
      .body as {
      chunkX: number;
      chunkY: number;
      voxelX: number;
      voxelY: number;
      voxelZ: number;
      newType: string;
      reason?: string;
      worldId?: string;
    };

    try {
      await strapi
        .service('api::voxel-engine.voxel-engine')
        .editVoxel(chunkX, chunkY, voxelX, voxelY, voxelZ, newType, reason, worldId);
      ctx.body = { success: true };
    } catch (err) {
      ctx.badRequest('Failed to update voxel', { error: err });
    }
  },

  async getWorldConfig(ctx) {
    try {
      const config = await strapi.plugin('map-explorer').service('mapService').getWorldConfig();
      ctx.body = config;
    } catch (err) {
      ctx.badRequest('Failed to fetch world config', { error: err });
    }
  },

  async updateWorldConfig(ctx) {
    const { body } = ctx.request;
    try {
      const updated = await strapi
        .plugin('map-explorer')
        .service('mapService')
        .updateWorldConfig(body);
      ctx.body = updated;
    } catch (err) {
      ctx.badRequest('Failed to update world config', { error: err });
    }
  },

  async getConstructions(ctx) {
    try {
      const constructions = await strapi
        .plugin('map-explorer')
        .service('mapService')
        .getConstructions();
      ctx.body = constructions;
    } catch (err) {
      ctx.badRequest('Failed to fetch constructions', { error: err });
    }
  },

  async saveConstruction(ctx) {
    const { body } = ctx.request;
    try {
      const construction = await strapi
        .plugin('map-explorer')
        .service('mapService')
        .saveConstruction(body);
      ctx.body = construction;
    } catch (err) {
      ctx.badRequest('Failed to save construction', { error: err });
    }
  },

  /**
   * Generates a 2D multi-layer sprite using PixelForge tech.
   * Composes body parts into a single flattened texture/grid.
   * POST /api/map-explorer/generate-texture
   */
  async generateTexture(ctx) {
    const { size, config } = ctx.request.body;

    // Strict Size Mapping (1ft = 1 cell)
    const SIZE_MAP: Record<string, number> = {
      Tiny: 2,
      Small: 5,
      Medium: 5,
      Large: 10,
      Huge: 15,
      Gargantuan: 20,
    };

    const dimension = SIZE_MAP[size] || 5;

    try {
      // Use the SOTA Pixel Forge
      const forge = strapi.plugin('map-explorer').service('pixelForgeService');
      if (forge) {
        const layers = forge.generateCreature(config || { race: 'human' });
        const combined = forge.compose(layers);

        // Wrap in tiles structure
        ctx.body = {
          x: 0,
          y: 0,
          tiles: [
            combined.map((row, y) =>
              row.map((px, x) => ({
                x,
                y,
                z: 0,
                block: px || 'air',
                biome: 'generated',
                isWalkable: true,
                isTransparent: !px,
                variant: 0,
              }))
            ),
          ],
        };
        return;
      }
    } catch (e) {
      strapi.log.warn('[MapController] PixelForge service failed, falling back to legacy.', e);
    }

    // Fallback Legacy Logic
    const GRID_SIZE = 32;
    const tiles: (Record<string, unknown> | null)[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => null)
      );

    const startX = Math.floor((GRID_SIZE - dimension) / 2);
    const startY = Math.floor((GRID_SIZE - dimension) / 2);
    const endX = startX + dimension;
    const endY = startY + dimension;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (y >= 0 && y < GRID_SIZE && x >= 0 && x < GRID_SIZE) {
          tiles[y][x] = {
            x,
            y,
            z: 0,
            block: '#888888',
            biome: 'generated',
            isWalkable: true,
            isTransparent: false,
            variant: 0,
          };
        }
      }
    }

    ctx.body = {
      x: 0,
      y: 0,
      tiles: [tiles],
    };
  },

  /**
   * Generates Pixel Art for an Entity or Item and saves it to the Media Library.
   * POST /api/map-explorer/generate-pixel-art
   */
  async generatePixelArt(ctx) {
    const { id, model } = ctx.request.body; // model: 'entity' | 'item'

    if (!id || !['entity', 'item'].includes(model)) {
      return ctx.badRequest('Invalid parameters. Require id and model (entity|item).');
    }

    try {
      const service = strapi.plugin('map-explorer').service('pixelForgeService');
      let grid: string[][];

      if (model === 'entity') {
        grid = await service.generateEntity(id);
      } else {
        grid = await service.generateItem(id);
      }

      // Return the grid directly for the UI to consume/save/preview
      ctx.body = { success: true, file: null, pixels: grid };
    } catch (err) {
      strapi.log.error('[PixelForge] Generation failed:', err);
      ctx.badRequest('Generation failed', { error: err.message });
    }
  },

  /**
   * GET /api/map-explorer/timeline?roomId=...
   */
  async getTimeline(ctx) {
    const { roomId } = ctx.query;
    if (!roomId) return ctx.badRequest('Missing roomId');

    try {
      const data = await strapi
        .service('api::game.history-service')
        .getTimelineData(roomId as string);
      ctx.body = data;
    } catch (err) {
      ctx.badRequest('Failed to fetch timeline', { error: err });
    }
  },

  /**
   * POST /api/map-explorer/replay
   * Body: { roomId, timestamp }
   */
  async replay(ctx) {
    const { roomId, timestamp } = ctx.request.body;
    if (!roomId || timestamp === undefined) return ctx.badRequest('Missing params');

    try {
      const state = await strapi.service('api::game.history-service').replayTo(roomId, timestamp);
      ctx.body = state;
    } catch (err) {
      ctx.badRequest('Failed to replay state', { error: err });
    }
  },
});

export default controller;
