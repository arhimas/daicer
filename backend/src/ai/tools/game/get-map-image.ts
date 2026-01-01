import { z } from 'zod';
import { Creature, WorldConfig, Chunk, DEFAULT_WORLD_CONFIG } from '@daicer/engine';
import { createDaicerTool, StrapiContext } from '../tool-factory';
import { RoomWithPopulations } from '../../../lifecycle/socket/types';

const mapImageSchema = z.object({
  x: z.number().describe('Center X coordinate'),
  y: z.number().describe('Center Y coordinate'),
  radius: z.number().default(16).describe('View radius'),
});

const mapImageOutput = z.object({
  type: z.literal('image'),
  base64: z.string(),
  description: z.string(),
});

interface VoxelEngineService {
  getChunk(x: number, y: number, config: WorldConfig): Promise<Chunk>;
}

export const getMapImageTool = (context: StrapiContext) =>
  createDaicerTool(
    {
      name: 'get_map_image',
      description: 'Generates a visual map image (PNG) centered at the coordinates.',
      schema: mapImageSchema,
      outputSchema: mapImageOutput,
      func: async ({ x, y, radius }, { strapi, roomDocumentId }) => {
        // Dynamic import to avoid circular dependencies or massive builds if not needed
        // Assuming path relative to this file: ../../../api/game/services/map-visualization
        const { generateMapImage } = await import('../../../api/game/services/map-visualization');

        // Fetch Room Data
        const roomRaw = await strapi.documents('api::room.room').findOne({
          documentId: roomDocumentId,
          populate: ['entity_sheets'],
        });

        if (!roomRaw) throw new Error('Room not found.');

        // Assert type with a check or direct cast if we trust Strapi schema sync
        const room = roomRaw as unknown as RoomWithPopulations;

        const chunkX = Math.floor(x / 32);
        const chunkY = Math.floor(y / 32);

        let chunk: Chunk | undefined;
        const voxelService = strapi.service('api::voxel-engine.voxel-engine') as VoxelEngineService;

        if (voxelService && voxelService.getChunk) {
          // Ensure config matches WorldConfig
          const config: WorldConfig = (room.config as WorldConfig) || { ...DEFAULT_WORLD_CONFIG, seed: 'default' };
          chunk = await voxelService.getChunk(chunkX, chunkY, config);
        } else {
          throw new Error('Voxel Engine service unavailable.');
        }

        if (!chunk) throw new Error('Failed to load map chunk.');

        // Map sheets to creatures
        const creatures: Creature[] = (room.entity_sheets || []).map((cs) => {
          // Validate creature type
          const type: Creature['type'] = (
            ['player', 'npc', 'monster'].includes(cs.type) ? cs.type : 'monster'
          ) as Creature['type'];

          return {
            id: cs.documentId,
            name: cs.name,
            type,
            position: cs.position,
            hp: cs.currentHp,
            maxHp: cs.maxHp,
            ac: cs.ac || 10,
          };
        });

        // Generate Buffer
        const imageBuffer = await generateMapImage(
          chunk,
          [], // Players - needed? Room players not fully mapped here yet.
          creatures,
          new Set((room.exploredTiles as string[]) || []),
          { x, y }
        );

        const base64 = imageBuffer.toString('base64');

        return {
          type: 'image',
          base64: base64,
          description: `Map image generated at ${x},${y} with radius ${radius}.`,
        };
      },
    },
    context
  );
