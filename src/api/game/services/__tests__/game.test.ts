import { describe, it, expect, vi, beforeEach } from 'vitest';
import gameServiceFactory from '../game';
// Using any for Strapi mocks is standard for unit testing services without full harness
 
const mockStrapi: any = {
  service: vi.fn(),
  documents: vi.fn(),
  log: {
    warn: vi.fn(),
    error: vi.fn(),
  },
};

describe('Game Service', () => {
  let gameService: ReturnType<typeof gameServiceFactory>;

  beforeEach(() => {
    vi.clearAllMocks();
    gameService = gameServiceFactory({ strapi: mockStrapi });
  });

  describe('generateWorld', () => {
    it('should delegate to world-generation service', async () => {
      const mockGenerate = vi.fn().mockResolvedValue('World Description');
      mockStrapi.service.mockReturnValue({ generateWorld: mockGenerate });

      const settings: any = { biome: 'forest' };
      const result = await gameService.generateWorld(settings, 'en');

      expect(mockStrapi.service).toHaveBeenCalledWith('api::game.world-generation');
      expect(mockGenerate).toHaveBeenCalledWith(settings, 'en');
      expect(result).toBe('World Description');
    });
  });

  describe('processTurn', () => {
    it('should fetch chunk and delegate to turn-processing service', async () => {
      const mockGetChunk = vi.fn().mockResolvedValue({ id: 'chunk-1' });
      const mockProcessTurn = vi.fn().mockResolvedValue({ success: true });

      mockStrapi.service.mockImplementation((name: string) => {
        if (name === 'api::voxel-engine.voxel-engine') return { getChunk: mockGetChunk };
        if (name === 'api::game.turn-processing') return { processTurn: mockProcessTurn };
        return {};
      });

      const players = [{ position: { x: 32, y: 32 } }] as any;
      const settings = { size: 100 } as any;

      await gameService.processTurn('room-1', 'desc', [], players, [], 'en', settings);

      // Should fetch chunk for 32,32 -> 1,1
      expect(mockGetChunk).toHaveBeenCalledWith(1, 1, settings);
      
      // Should pass chunk to processTurn
      expect(mockProcessTurn).toHaveBeenCalledWith(
        'room-1',
        'desc',
        [],
        players,
        [],
        'en',
        settings,
        undefined,
        undefined,
        undefined,
        { id: 'chunk-1' }
      );
    });

    it('should handle chunk fetch failure gracefully', async () => {
      mockStrapi.service.mockImplementation((name: string) => {
        if (name === 'api::voxel-engine.voxel-engine') return { getChunk: vi.fn().mockRejectedValue(new Error('Fail')) };
        if (name === 'api::game.turn-processing') return { processTurn: vi.fn() };
        return {};
      });

      await gameService.processTurn('room-1', 'desc', [], [], [], 'en', {});
      
      expect(mockStrapi.log.warn).toHaveBeenCalled();
    });
  });

  describe('startGame', () => {
    it('should maintain strict logic: fail if room not found', async () => {
       mockStrapi.documents.mockReturnValue({
         findMany: vi.fn().mockResolvedValue([]),
       });

       await expect(gameService.startGame('bad-id')).rejects.toThrow('Room not found');
    });

    it('should fail if no players', async () => {
       mockStrapi.documents.mockReturnValue({
         findMany: vi.fn().mockResolvedValue([{ players: [] }]),
       });

       await expect(gameService.startGame('room-1')).rejects.toThrow('Cannot start game with no players');
    });
    
    it('should fail if players not ready', async () => {
       mockStrapi.documents.mockReturnValue({
         findMany: vi.fn().mockResolvedValue([{ players: [{ name: 'Bob', isReady: false }] }]),
       });

       await expect(gameService.startGame('room-1')).rejects.toThrow('not ready: Bob');
    });

    it('should successfully start game', async () => {
      const mockRoom = {
         documentId: 'room-doc-1',
         roomId: 'room-1',
         players: [{ name: 'Alice', isReady: true, user: { documentId: 'u1' } }],
         world: { description: 'World' },
         entity_sheets: [],
      };

      mockStrapi.documents.mockReturnValue({
         findMany: vi.fn().mockResolvedValue([mockRoom]),
         findOne: vi.fn().mockResolvedValue(mockRoom),
         create: vi.fn().mockResolvedValue({ documentId: 'turn-1' }),
         update: vi.fn().mockResolvedValue({}),
      });

      mockStrapi.service.mockReturnValue({
        generateMainOpening: vi.fn().mockResolvedValue('Opening Text'),
        generateEntityOpening: vi.fn().mockResolvedValue('Private Text'),
        createSnapshot: vi.fn().mockResolvedValue([]),
      });

      const result = await gameService.startGame('room-1');

      expect(result.success).toBe(true);
      expect(result.mainOpening).toBe('Opening Text');
      
      // Verify Room Update
      expect(mockStrapi.documents).toHaveBeenCalled(); // Generic check, could be specific
    });
  });

   describe('togglePlayerReady', () => {
    it('should update player ready status', async () => {
      const mockRoom = {
        documentId: 'doc-1',
        players: [
          { user: { documentId: 'u1' }, isReady: false }
        ]
      };
      
      const mockUpdate = vi.fn();
      mockStrapi.documents.mockReturnValue({
        findMany: vi.fn().mockResolvedValue([mockRoom]),
        update: mockUpdate,
      });

      await gameService.togglePlayerReady('room-1', 'u1', true);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        documentId: 'doc-1',
        data: expect.objectContaining({
           players: [{ user: { documentId: 'u1' }, isReady: true }]
        })
      }));
    });
   });
});
