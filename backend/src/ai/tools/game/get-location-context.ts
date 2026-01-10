import { z } from 'zod';
import { createDaicerTool, StrapiContext } from '../tool-factory';
import { WorldAtlas } from '../../../api/game/src/engine/world';
import { WorldConfig } from '../../../api/game/src/engine';

const contextSchema = z.object({
  x: z.number().describe('The X coordinate to inspect'),
  y: z.number().describe('The Y coordinate to inspect'),
});

export const getLocationContextTool = (context: StrapiContext) =>
  createDaicerTool(
    {
      name: 'get_location_context',
      description: 'Get semantic context about a location (City, District, Region) to describe the environment.',
      schema: contextSchema,
      outputSchema: z.object({
        region: z.object({
          name: z.string(),
          biome: z.string(),
          description: z.string(),
        }),
        structure: z
          .object({
            type: z.string(),
            name: z.string(),
            description: z.string(),
          })
          .nullable(),
        nearby: z.array(z.string()),
      }),
      func: async ({ x, y }, { strapi, roomDocumentId }) => {
        // 1. Fetch Room Config
        const room = await strapi.documents('api::room.room').findOne({
          documentId: roomDocumentId,
          populate: ['settings'], // ensure settings are loaded
        });

        if (!room) throw new Error('Room not found');

        // Extract Seed & Config
        // Handle legacy or nested structure if needed, but assuming standard WorldConfig logic
        const seed = room.world?.seed || room.settings?.seed || room.config?.seed || 'default';
        const config: WorldConfig = {
          ...(room.world || {}),
          seed,
          // defaults if missing
          chunkSize: 32,
          globalScale: 0.01,
          seaLevel: 0,
          elevationScale: 1,
          roughness: 0.5,
          detail: 4,
          moistureScale: 1,
          temperatureOffset: 0,
          structureChance: 0.1,
          structureSpacing: 10,
          structureSizeAvg: 10,
          roadDensity: 0.5,
          fogRadius: 10,
        };

        // 2. Instantiate Atlas
        const atlas = new WorldAtlas(config);

        // 3. Query Atlas
        const region = atlas.getRegion(x, y);
        const structure = atlas.getStructure(x, y);

        // 4. Format Output
        return {
          region: {
            name: region.name,
            biome: region.biome, // "Plains"
            description: `The region of ${region.name}, a ${region.wealth > 0.7 ? 'prosperous' : 'humble'} ${region.biome.toLowerCase()}.`,
          },
          structure: structure
            ? {
                type: structure.type,
                name: structure.name, // Usually matches region name for Capital
                description: `A ${structure.type} named ${structure.name}.`,
              }
            : null,
          nearby: [], // TODO: Query nearby using Voronoi neighbors
        };
      },
    },
    context
  );
