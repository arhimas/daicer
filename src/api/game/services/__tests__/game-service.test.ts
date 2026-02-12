import { describe, it, expect, vi, beforeEach } from 'vitest';
import gameServiceFactory from '../game';

// Mocks
const mockWorldGenService = {
  generateWorld: vi.fn(),
};
const mockTurnProcessingService = {
  processTurn: vi.fn(),
  submitAction: vi.fn(),
  executeDeterministicTurn: vi.fn(),
};
const mockEntityLifecycleService = {
  generateEntityOpening: vi.fn(),
  generateMainOpening: vi.fn(),
  addPlayerEntity: vi.fn(),
  createSnapshot: vi.fn(),
};
const mockVoxelEngineService = {
  getChunk: vi.fn(),
};

const mockRoomRepo = {
  findMany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
};
const mockMessageRepo = {
  create: vi.fn(),
};
const mockTurnRepo = {
  create: vi.fn(),
};

const mockStrapi = {
  service: vi.fn((uid) => {
    switch (uid) {
      case 'api::game.world-generation': return mockWorldGenService;
      case 'api::game.turn-processing': return mockTurnProcessingService;
      case 'api::game.entity-lifecycle': return mockEntityLifecycleService;
      case 'api::voxel-engine.voxel-engine': return mockVoxelEngineService;
    }
  }),
  documents: vi.fn((uid) => {
    switch (uid) {
      case 'api::room.room': return mockRoomRepo;
      case 'api::message.message': return mockMessageRepo;
      case 'api::turn.turn': return mockTurnRepo;
    }
  }),
  log: {
    warn: vi.fn(),
    error: vi.fn(),
  },
};

describe('Game Service', () => {
  let gameService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    gameService = gameServiceFactory({ strapi: mockStrapi });
  });

  describe('generateWorld', () => {
    it('should delegate to world-generation service', async () => {
       mockWorldGenService.generateWorld.mockResolvedValue('A mocked world');
       const result = await gameService.generateWorld({}, 'en');
       expect(mockWorldGenService.generateWorld).toHaveBeenCalledWith({}, 'en');
       expect(result).toBe('A mocked world');
    });
  });

  describe('processTurn', () => {
    it('should fetch chunk if settings provided', async () => {
       // Mock players looking at 0,0
       await gameService.processTurn('room1', 'desc', [], [{ position: { x: 0, y: 0 } }], [], 'en', { seed: 'test' });
       
       expect(mockVoxelEngineService.getChunk).toHaveBeenCalled();
       expect(mockTurnProcessingService.processTurn).toHaveBeenCalled();
       // Check that chunk was passed (impl detail: it's the last arg usually)
    });

    it('should proceed if chunk fetch fails', async () => {
       mockVoxelEngineService.getChunk.mockRejectedValue(new Error('Chunk Error'));
       
       await gameService.processTurn('room1', 'desc', [], [{ position: { x: 0, y: 0 } }], [], 'en', { seed: 'test' });
       
       expect(mockStrapi.log.warn).toHaveBeenCalledWith('Failed to fetch chunk for turn processing:', expect.any(Error));
       expect(mockTurnProcessingService.processTurn).toHaveBeenCalled();
    });
  });
  
  describe('startGame', () => {
      const mockRoom = {
          documentId: 'room1',
          players: [
              { name: 'P1', isReady: true, user: { documentId: 'u1' }, characterSheet: { documentId: 's1' } }
          ],
          world: { description: 'World Desc' },
          dmSettings: {},
          entity_sheets: [{ documentId: 's1', name: 'Sheet 1' }]
      };
      
      beforeEach(() => {
          mockRoomRepo.findMany.mockResolvedValue([mockRoom]);
          mockRoomRepo.findOne.mockResolvedValue(mockRoom);
          mockEntityLifecycleService.generateMainOpening.mockResolvedValue('Main Opening Text');
          mockEntityLifecycleService.generateEntityOpening.mockResolvedValue('Entity Opening Text');
          mockEntityLifecycleService.createSnapshot.mockResolvedValue([]);
          mockTurnRepo.create.mockResolvedValue({ documentId: 'turn0' });
      });

      it('should start successfully', async () => {
           const result = await gameService.startGame('room1');
           
           expect(result.success).toBe(true);
           expect(mockTurnRepo.create).toHaveBeenCalledWith(expect.objectContaining({
               data: expect.objectContaining({ turnNumber: 0 })
           }));
           expect(mockMessageRepo.create).toHaveBeenCalledTimes(2); // Main + Private
           expect(mockRoomRepo.update).toHaveBeenCalledWith({
               documentId: 'room1',
               data: expect.objectContaining({ phase: 'game', isActive: true })
           });
      });

      it('should throw if room not found', async () => {
           mockRoomRepo.findMany.mockResolvedValue([]);
           await expect(gameService.startGame('bad-room')).rejects.toThrow('Room not found');
      });
      
      it('should throw if no players', async () => {
           mockRoomRepo.findMany.mockResolvedValue([{ ...mockRoom, players: [] }]);
           await expect(gameService.startGame('room1')).rejects.toThrow('Cannot start game with no players');
      });

      it('should throw if players not ready', async () => {
           mockRoomRepo.findMany.mockResolvedValue([{ 
               ...mockRoom, 
               players: [{ name: 'P1', isReady: false }] 
           }]);
           await expect(gameService.startGame('room1')).rejects.toThrow(/not ready/);
      });
  });
  
  describe('togglePlayerReady', () => {
      const mockRoom = {
          documentId: 'room1',
          players: [
              { user: { documentId: 'u1' }, isReady: false }
          ]
      };

      it('should toggle ready status', async () => {
          mockRoomRepo.findMany.mockResolvedValue([mockRoom]);
          
          const result = await gameService.togglePlayerReady('room1', 'u1', true);
          
          expect(result.success).toBe(true);
          expect(result.isReady).toBe(true);
          expect(mockRoomRepo.update).toHaveBeenCalledWith({
              documentId: 'room1',
              data: expect.objectContaining({ 
                  players: expect.arrayContaining([expect.objectContaining({ isReady: true })])
               })
          });
      });

      it('should throw if user not in room', async () => {
          mockRoomRepo.findMany.mockResolvedValue([mockRoom]);
          await expect(gameService.togglePlayerReady('room1', 'u2', true)).rejects.toThrow('User is not a player');
      });
  });
});
