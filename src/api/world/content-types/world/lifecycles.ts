import { WorldConfig } from '@daicer/engine/types';

export default {
  async afterCreate(event) {
    const { result } = event;
    const {
      seed,
      chunkSize,
      detail,
      fogRadius,
      startingRadius,
      globalScale,
      seaLevel,
      elevationScale,
      roughness,
      moistureScale,
      temperatureOffset,
      roadDensity,
      structureChance,
      structureSpacing,
      structureSizeAvg,
    } = result;

    const config: WorldConfig = {
      seed: seed || 'default',
      chunkSize: chunkSize || 16,
      detail: detail || 4,
      globalScale: globalScale || 0.02,
      seaLevel: seaLevel || 0,
      elevationScale: elevationScale || 0.5,
      roughness: roughness || 0.5,
      moistureScale: moistureScale || 0.015,
      temperatureOffset: temperatureOffset || 0,
      fogRadius: fogRadius || 10,

      roadDensity: roadDensity || 0.1,
      structureChance: structureChance || 0.1,
      structureSpacing: structureSpacing || 3,
      structureSizeAvg: structureSizeAvg || 10,
    };

    const radius = startingRadius || 4;
    const voxelService = strapi.service('api::voxel-engine.voxel-engine');

    strapi.log.info(
      `[World] Pre-generating starting area (Radius: ${radius}) for world ${result.documentId || result.id}`
    );

    // Generate center chunks
    // We execute sequentially to ensure the worker isn't overwhelmed instantly, though it's single threaded.
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        try {
          // result.documentId is preferred in Strapi 5, fallback to result.id
          const worldId = result.documentId || result.id;
          await voxelService.getChunk(x, y, config, worldId);
        } catch (e) {
          strapi.log.error(`[WorldLifecycle] Failed to generate chunk ${x},${y}`, e);
        }
      }
    }
    strapi.log.info(`[World] Pre-generation complete.`);
  },
};
