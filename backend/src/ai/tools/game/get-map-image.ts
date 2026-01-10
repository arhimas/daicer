import { z } from 'zod';
import { Creature, WorldConfig, Chunk, DEFAULT_WORLD_CONFIG } from '../../../api/game/src/engine';
import { createDaicerTool, StrapiContext } from '../tool-factory';
// import { RoomWithPopulations } from '../../../lifecycle/socket/types'; // Removed

const mapImageSchema = z.object({
  entityId: z.string().optional().describe('Optional: The ID of the entity whose perspective to use (POV).'),
  x: z.number().optional().describe('Center X coordinate (overridden if entityId is provided)'),
  y: z.number().optional().describe('Center Y coordinate (overridden if entityId is provided)'),
  radius: z.number().default(16).describe('View radius'),
  broadcast: z.boolean().default(true).describe('Whether to broadcast the image to the game stream (default: true)'),
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
      description:
        'Generates a visual map image (PNG). Can be POV (perspective of an entity) or Know World (all explored).',
      schema: mapImageSchema,
      outputSchema: mapImageOutput,
      func: async ({ x, y, radius: _radius, entityId, broadcast }, { strapi, roomDocumentId }) => {
        // Dynamic import to avoid circular dependencies
        const { generateMapImage } = await import('../../../api/game/services/map-visualization');
        // streamManager removed

        // Fetch Room Data
        const roomRaw = await strapi.documents('api::room.room').findOne({
          documentId: roomDocumentId,
          populate: ['entity_sheets'],
        });

        if (!roomRaw) throw new Error('Room not found.');

        const room = roomRaw as unknown as any;
        const entities = room.entity_sheets || [];

        // 1. Determine Center & Perspective
        let centerX = x || 0;
        let centerY = y || 0;
        let povEntity: Creature | undefined;
        let visionSources: { x: number; y: number }[] = [];

        if (entityId) {
          const targetSheet = entities.find((e) => e.documentId === entityId);
          if (targetSheet && targetSheet.position) {
            centerX = Math.round(targetSheet.position.x);
            centerY = Math.round(targetSheet.position.y);
            povEntity = {
              id: targetSheet.documentId,
              name: targetSheet.name,
              type: (['player', 'npc', 'monster'].includes(targetSheet.type)
                ? targetSheet.type
                : 'monster') as Creature['type'],
              position: targetSheet.position,
              hp: targetSheet.currentHp,
              maxHp: targetSheet.maxHp,
              armorClass: targetSheet.ac || 10,
            };
            visionSources = [targetSheet.position];
          } else {
            strapi.log.warn(
              `[get_map_image] Entity ${entityId} not found or has no position, falling back to coordinates.`
            );
          }
        }

        // If no POV entity, assume "Global Party View" (uses all entities as vision sources? Or just players?)
        // For "Know World", we typically assume Player vision.
        if (!povEntity) {
          visionSources = entities
            .filter((e) => (e.type === 'player' || (e.owner && e.owner.documentId)) && e.position) // Crude check for player-owned
            .map((e) => e.position);

          if (x === undefined && y === undefined && visionSources.length > 0) {
            // Center on first player if no coords given
            centerX = visionSources[0].x;
            centerY = visionSources[0].y;
          }
        }

        const chunkX = Math.floor(centerX / 32);
        const chunkY = Math.floor(centerY / 32);

        // 2. Load World Data
        let chunk: Chunk | undefined;
        const voxelService = strapi.service('api::voxel-engine.voxel-engine') as VoxelEngineService;

        if (voxelService && voxelService.getChunk) {
          const config: WorldConfig = (room.config as WorldConfig) || { ...DEFAULT_WORLD_CONFIG, seed: 'default' };
          chunk = await voxelService.getChunk(chunkX, chunkY, config);
        } else {
          throw new Error('Voxel Engine service unavailable.');
        }

        if (!chunk) throw new Error('Failed to load map chunk.');

        // 3. Map Room Entities to Creatures (for Rendering)
        const creatures: Creature[] = entities
          .filter((cs) => cs.position) // Filter out entities with missing position
          .map((cs) => {
            return {
              id: cs.documentId,
              name: cs.name,
              type: (['player', 'npc', 'monster'].includes(cs.type) ? cs.type : 'monster') as Creature['type'],
              position: cs.position,
              hp: cs.currentHp,
              maxHp: cs.maxHp,
              armorClass: cs.ac || 10,
            };
          });

        // 4. Generate Image (Re-using map visualization service logic)
        // We need to pass "players" as vision sources to generateMapImage.
        // The service signature is: (chunk, players, creatures, exploredTiles, center)
        // We will mock "players" array with our determined visionSources for the POV effect.

        // Mock Player objects for the service (it only needs position for visibility calculation)
        const mockPlayers = visionSources.map((pos) => ({
          position: pos,
          id: 'pov',
          name: 'POV',
          role: 'player',
          userId: 'sys',
          action: null,
          isReady: true,
          joinedAt: 0,
          character: null,
        })) as unknown as import('../../../api/game/src/engine').Player[];

        // If POV mode, ONLY pass the POV entity's vision. If Global, pass all players.

        const imageBuffer = await generateMapImage(
          chunk,
          mockPlayers,
          creatures,
          new Set((room.exploredTiles as string[]) || []),
          { x: centerX, y: centerY },
          32, // Width
          32 // Height
          // Note: Service default is 32x32. If we want larger radius, we need to update service or generate multiple chunks.
          // For now, adhering to single chunk limit but ensuring POV centering is correct.
        );

        const base64 = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        // Broadcast logic removed

        return {
          type: 'image',
          base64: base64, // Returning raw base64 for LLM tool usage compatibility
          description: povEntity
            ? `Map image generated from perspective of ${povEntity.name} at ${centerX},${centerY}.`
            : `Map image generated at ${centerX},${centerY}.`,
        };
      },
    },
    context
  );
