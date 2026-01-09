import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMutationResolvers } from '../mutation-resolvers';
import { getMutationResolvers } from '../mutation-resolvers';

import { StrapiInterface } from '../../../ai/tools/tool-factory';

// Mock Strapi
const mockGameService = {
  submitAction: vi.fn(),
  spawnCreature: vi.fn(),
  processTurn: vi.fn(),
};

const mockVoxelService = {
  getChunk: vi.fn(),
};

const mockStrapi = {
  service: (uid: string) => {
    if (uid === 'api::game.game') return mockGameService;
    if (uid === 'api::voxel-engine.voxel-engine') return mockVoxelService;
    return {};
  },
  documents: vi.fn(),
  log: { info: vi.fn(), error: vi.fn() },
  plugin: () => ({ service: () => ({ use: vi.fn() }) }), // For registerGraphQLExtension check
};

const mutationResolvers = getMutationResolvers(mockStrapi as unknown as StrapiInterface);

describe('GraphQL Mutation: Game Interaction', () => {
  const mockUser = { documentId: 'u1', username: 'P1' };
  const mockContext = { state: { user: mockUser } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitAction', () => {
    it('should throw if unauthorized', async () => {
      await expect(mutationResolvers.submitAction({}, {}, { state: {} })).rejects.toThrow('Unauthorized');
    });

    it('should delegate to game service', async () => {
      const args = { roomId: 'r1', action: '{"type":"MOVE"}', mode: 'manual' };
      await mutationResolvers.submitAction(null, args, mockContext);
      expect(mockGameService.submitAction).toHaveBeenCalledWith('r1', '{"type":"MOVE"}', mockUser, 'manual');
    });

    // Fuzzing 30 Payload types
    const actions = [
      'ATTACK',
      'MOVE',
      'CAST_SPELL',
      'USE_ITEM',
      'EQUIP',
      'UNEQUIP',
      'INTERACT',
      'PICKUP',
      'DROP',
      'REST',
      'HIDE',
      'DASH',
      'DISENGAGE',
      'DODGE',
      'HELP',
      'READY',
      'SEARCH',
      'SKILL_CHECK',
      'SAVING_THROW',
      'DEATH_SAVE',
      'END_TURN',
      'INITIATIVE',
      'PING',
      'EMOTE',
      'WHISPER',
    ];

    const fuzzedArgs = actions.map((type) => ({
      desc: `Action: ${type}`,
      action: JSON.stringify({ type, target: 't1' }),
    }));

    it.each(fuzzedArgs)('should handle $desc', async ({ action }) => {
      await mutationResolvers.submitAction(null, { roomId: 'r1', action }, mockContext);
      expect(mockGameService.submitAction).toHaveBeenCalledWith(
        'r1',
        action,
        mockUser,
        undefined // mode defaults undefined
      );
    });
  });

  describe('spawnCreature', () => {
    it('should delegate spawn', async () => {
      await mutationResolvers.spawnCreature(null, { roomId: 'r1', creature: {} }, mockContext);
      expect(mockGameService.spawnCreature).toHaveBeenCalled();
    });
  });

  describe('processTurn', () => {
    const mockFindMany = vi.fn();
    beforeEach(() => {
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({ findMany: mockFindMany });
    });

    it('should merge settings and delegate', async () => {
      mockFindMany.mockResolvedValue([
        {
          documentId: 'r1',
          world: { language: 'fr', seed: 'w1' },
          dmSettings: { difficulty: 'easy' },
          players: [],
          worldConditions: [],
        },
      ]);

      await mutationResolvers.processTurn(null, { roomId: 'r1', messages: [] }, mockContext);

      expect(mockGameService.processTurn).toHaveBeenCalledWith(
        'r1',
        '', // world desc
        expect.any(Array),
        expect.any(Array), // players
        expect.any(Array), // ??? args check implementation
        'fr', // language
        expect.objectContaining({ seed: 'w1', difficulty: 'easy' }),
        expect.any(Array)
      );
    });

    it('should throw if room not found', async () => {
      mockFindMany.mockResolvedValue([]);
      await expect(mutationResolvers.processTurn(null, { roomId: 'bad' }, mockContext)).rejects.toThrow(
        'Room not found'
      );
    });
  });

  describe('generateTerrainChunk', () => {
    const mockFindMany = vi.fn();
    beforeEach(() => {
      (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({ findMany: mockFindMany });
    });

    it('should merge world config and delegate', async () => {
      mockFindMany.mockResolvedValue([
        {
          roomId: 'code-1',
          world: { seed: 'real-seed', chunkSize: 32 },
        },
      ]);

      await mutationResolvers.generateTerrainChunk(null, { roomId: 'code-1', chunkX: 1, chunkY: 2 }, mockContext);

      expect(mockVoxelService.getChunk).toHaveBeenCalledWith(
        1,
        2,
        expect.objectContaining({
          seed: 'real-seed',
          chunkSize: 32,
        })
      );
    });
  });
});
