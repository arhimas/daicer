import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inspectMapTool } from '../inspect-map';
import { listEntitiesTool } from '../list-entities';
import { getMapImageTool } from '../get-map-image';
import { StrapiContext } from '../tool-factory';
import { Strapi } from '@strapi/strapi';

// Mock Dependencies
const mockGameEventService = {
  inspectTerrain: vi.fn(),
};

const mockEntityAdapter = {
  adapt: vi.fn((e) => ({
    id: e.documentId,
    name: e.name,
    type: e.type,
    position: e.position,
  })),
};

const mockGenerateMapImage = vi.fn().mockResolvedValue(Buffer.from('pretend-image'));

// Mock dynamic import in get-map-image
// Correct relative path from basic/src/ai/tools/game/__tests__ to backend/src/api/game/services
vi.mock('../../../../api/game/services/map-visualization', () => ({
  generateMapImage: mockGenerateMapImage,
}));

// Mock Strapi
const mockStrapi = {
  service: vi.fn((uid) => {
    if (uid === 'api::game-event.game-event') return mockGameEventService;
    if (uid === 'api::game.entity-adapter') return mockEntityAdapter;
    return {};
  }),
  documents: vi.fn(() => ({
    findOne: vi.fn(),
    findMany: vi.fn(), // Added findMany
  })),
  plugin: vi.fn(() => ({
    service: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ id: 'img-1' }),
    })),
  })),
  log: {
    warn: vi.fn(),
  },
};

const mockContext: StrapiContext = {
  strapi: mockStrapi as unknown as Strapi,
  roomDocumentId: 'room-1',
};

describe('Tool Interaction Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('inspect_map', () => {
    it('should delegate to game-event service', async () => {
      mockGameEventService.inspectTerrain.mockResolvedValue('Biome: Forest');

      const tool = inspectMapTool(mockContext);
      // Pass explicit radius to match expectation
      const result = await tool.func({ x: 10, y: 10, radius: 5 }, mockContext);

      // inspect-map.ts passes (room, x, y, radius)
      expect(mockGameEventService.inspectTerrain).toHaveBeenCalledWith('room-1', 10, 10, 5);
      expect(result).toBe('Biome: Forest');
    });
  });

  describe('list_entities', () => {
    it('should fetch room and adapt all entities', async () => {
      const mockEntities = [
        { documentId: 'p1', name: 'Player', type: 'player', position: { x: 0, y: 0, z: 0 } },
        { documentId: 'm1', name: 'Monster', type: 'monster', position: { x: 10, y: 10, z: 0 } },
      ];

      // list-entities uses findMany on 'api::entity-sheet.entity-sheet'
      // We need to mock findMany return value.
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn(),
        findMany: vi.fn().mockResolvedValue(mockEntities),
      });

      const tool = listEntitiesTool(mockContext);
      const result = await tool.func({}, mockContext);

      // Output is a string
      expect(result).toContain('Found 2 entities');
      expect(result).toContain('Player');
      expect(result).toContain('Monster');
    });

    it('should handle empty rooms', async () => {
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
        findOne: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      });

      const tool = listEntitiesTool(mockContext);
      const result = await tool.func({}, mockContext);
      expect(result).toContain('No entities found');
    });
  });

  describe('get_map_image', () => {
    it('should generate image for the chunk at location', async () => {
      const mockChunk = { tiles: [] };
      const mockVoxelService = {
        getChunk: vi.fn().mockResolvedValue(mockChunk),
      };

      // Update Strapi mock to return voxel service for this test
      mockStrapi.service.mockImplementation((uid) => {
        if (uid === 'api::game-event.game-event') return mockGameEventService;
        if (uid === 'api::game.entity-adapter') return mockEntityAdapter;
        if (uid === 'api::voxel-engine.voxel-engine') return mockVoxelService;
        return {};
      });

      const mockRoom = {
        documentId: 'room-1',
        entity_sheets: [],
        config: { seed: 'abc' },
        exploredTiles: [],
      };
      // get-map-image uses findOne on 'api::room.room'
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({ findOne: vi.fn().mockResolvedValue(mockRoom) });

      const tool = getMapImageTool(mockContext);
      const result = await tool.func({ x: 0, y: 0, radius: 10 }, mockContext);

      expect(mockVoxelService.getChunk).toHaveBeenCalled();
      expect(mockGenerateMapImage).toHaveBeenCalledWith(
        mockChunk,
        [],
        [],
        expect.any(Set),
        { x: 0, y: 0 }, // get-map-image passes {x,y} as center options
        32,
        32
      );

      const parsedJson = JSON.parse(result as string);
      expect(parsedJson.type).toBe('image');
      // base64 of 'pretend-image' is 'cHJldGVuZC1pbWFnZQ=='
      expect(parsedJson.base64).toBe('cHJldGVuZC1pbWFnZQ==');
    });
  });
});
