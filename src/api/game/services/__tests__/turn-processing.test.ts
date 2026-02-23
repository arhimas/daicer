
import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnProcessingFactory from '@/api/game/services/turn-processing';

// Mock Dynamic Imports
const mockAdvanceTurn = vi.fn();
const mockEntropyState = { conditions: [] };

vi.mock('../../src/engine/entropy', () => {
    return {
        EntropySystem: class {
            state: any;
            constructor() {
                this.state = mockEntropyState;
            }
            advanceTurn(...args: any[]) { return mockAdvanceTurn(...args); }
        }
    };
});

const mockGenerateMapImage = vi.fn();
// IMPORTANT: Path must match exactly what is imported in the source file OR be resolved correctly.
// Source uses: import('./map-visualization')
vi.mock('../map-visualization', () => ({
  generateMapImage: (...args: any[]) => mockGenerateMapImage(...args),
}));

// Mock Strapi Services
const mockNarrativeEngine = { generateNarrativeResponse: vi.fn() };
const mockTurnPersistence = { persistTurn: vi.fn(), clearPlayerActions: vi.fn(), updateCharacterPosition: vi.fn() };
const mockActionEngine = { dispatch: vi.fn() };
const mockLedger = { logEvent: vi.fn() };
const mockSpawnService = { spawnMonster: vi.fn(), spawnCharacter: vi.fn() };
const mockBiomeSpawnService = { populateChunk: vi.fn() };
const mockUploadService = { upload: vi.fn() };
const mockVoxelService = { getChunk: vi.fn() };

const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();
const mockLogError = vi.fn();

const mockStrapi: any = {
  service: vi.fn((uid) => {
    switch(uid) {
        case 'api::game.narrative-engine': return mockNarrativeEngine;
        case 'api::game.turn-persistence': return mockTurnPersistence;
        case 'api::game.action-engine': return mockActionEngine;
        case 'api::game.game-ledger': return mockLedger;
        case 'api::game.spawn-service': return mockSpawnService;
        case 'api::game.biome-spawn-service': return mockBiomeSpawnService;
        case 'api::voxel-engine.voxel-engine': return mockVoxelService;
        default: return {};
    }
  }),
  plugin: vi.fn((uid) => {
      if (uid === 'upload') return { service: vi.fn(() => mockUploadService) };
      return {};
  }),
  documents: vi.fn(() => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    update: mockUpdate,
  })),
  log: {
      info: mockLogInfo,
      warn: mockLogWarn,
      error: mockLogError,
  }
};

describe('Turn Processing', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = turnProcessingFactory({ strapi: mockStrapi });
    
    // Self-Patching for internal calls
    mockStrapi.service.mockImplementation((uid: string) => {
        if (uid === 'api::game.turn-processing') return service;
        if (uid === 'api::game.narrative-engine') return mockNarrativeEngine;
        if (uid === 'api::game.turn-persistence') return mockTurnPersistence;
        if (uid === 'api::game.action-engine') return mockActionEngine;
        if (uid === 'api::game.game-ledger') return mockLedger;
        if (uid === 'api::game.spawn-service') return mockSpawnService;
        if (uid === 'api::game.biome-spawn-service') return mockBiomeSpawnService;
        if (uid === 'api::voxel-engine.voxel-engine') return mockVoxelService;
        return {};
    });

    // Default Mocks
    mockAdvanceTurn.mockReturnValue(null);
    mockGenerateMapImage.mockResolvedValue(Buffer.from('fake-map'));
    mockNarrativeEngine.generateNarrativeResponse.mockResolvedValue({ overall_summary: 'Summary', commands: [] });
    mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' }, room: { documentId: 'room-1' } });
    mockUploadService.upload.mockResolvedValue([{ id: 'file-1' }]);
    mockVoxelService.getChunk.mockResolvedValue({ tiles: [] });
    mockTurnPersistence.persistTurn.mockResolvedValue({ turn: { documentId: 'turn-1' }, room: { documentId: 'room-1' } });
    mockUploadService.upload.mockResolvedValue([{ id: 'file-1' }]);
    mockVoxelService.getChunk.mockResolvedValue({ tiles: [] });
    mockUpdate.mockResolvedValue({}); // Reset to success
  });

  describe('processTurn', () => {
      const roomData = {
          documentId: 'room-1',
          entity_sheets: [],
          exploredTiles: [],
          config: {}
      };

      it('should handle entropy events', async () => {
          mockFindOne.mockResolvedValue(roomData);
          mockAdvanceTurn.mockReturnValue({ newEvent: { visibility: 'public' } });

          await service.processTurn('room-1', 'desc', [], [], 'en');

          expect(mockLedger.logEvent).toHaveBeenCalledWith('room-1', expect.objectContaining({ type: 'ENTROPY_CHANGE' }));
      });

      it('should generate map image if chunk provided', async () => {
        mockFindOne.mockResolvedValueOnce({ 
            documentId: 'room-1',
            entity_sheets: [{ documentId: 'p1', position: {x:0,y:0}, type: 'player' }],
            exploredTiles: [],
            config: {}
        });

        // We use wait/expect loop or just rely on await if async flow is correct
        await service.processTurn('room-1', 'desc', [], [], 'en', {}, [], '', '', { tiles: [] });
        
        expect(mockGenerateMapImage).toHaveBeenCalled();
        expect(mockUploadService.upload).toHaveBeenCalled();
      });

      it('should handle upload failure gracefully', async () => {
        mockFindOne.mockResolvedValue({ 
            documentId: 'room-1',
            entity_sheets: [{ documentId: 'p1', position: {x:0,y:0}, type: 'player' }],
            exploredTiles: [],
            config: {}
        });
        mockUploadService.upload.mockRejectedValue(new Error('Upload Fail'));

        await service.processTurn('room-1', 'desc', [], [], 'en', {}, [], '', '', { tiles: [] });

        expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to generate/upload'), expect.any(Error));
      });

      it('should dispatch god mode commands', async () => {
          mockFindOne.mockResolvedValue(roomData);
          mockNarrativeEngine.generateNarrativeResponse.mockResolvedValueOnce({ 
              overall_summary: 'Summary', 
              commands: [{ type: 'SMITE' }] 
          });

          await service.processTurn('room-1', 'desc', [], [], 'en');

          expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [{ type: 'SMITE' }]);
      });
  });

  describe('executeDeterministicTurn', () => {
      it('should dispatch attack actions', async () => {
          mockFindOne.mockResolvedValue({ documentId: 'r1', entity_sheets: [] });

          await service.executeDeterministicTurn('r1', [{ type: 'attack', entityId: 'u1', payload: { targetId: 't1' } }]);

          expect(mockActionEngine.dispatch).toHaveBeenCalledWith('r1', expect.arrayContaining([
              expect.objectContaining({ type: 'ATTACK', payload: expect.objectContaining({ actorId: 'u1', targetId: 't1' }) })
          ]));
      });

      it('should handle spawn actions', async () => {
        mockFindOne.mockResolvedValue({ documentId: 'r1', entity_sheets: [] });

        await service.executeDeterministicTurn('r1', [
            { type: 'spawn', payload: { entityType: 'monster', id: 'm1', position: {x:1,y:1} } }
        ]);

        expect(mockSpawnService.spawnMonster).toHaveBeenCalledWith('r1', 'm1', {x:1,y:1});
      });

      it('should handle exploration updates (new tiles)', async () => {
          mockFindOne.mockResolvedValue({ 
              documentId: 'r1', 
              entity_sheets: [{ documentId: 'p1', position: {x:0,y:0}, name: 'P1' }],
              exploredTiles: [],
              exploredChunks: []
          });

          await service.executeDeterministicTurn('r1', [
              { type: 'move', entityId: 'p1', payload: { x: 1, y: 1 } }
          ]);

          expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                  exploredTiles: expect.any(Array)
              })
          }));
      });
      
      it('should trigger chunk spawn on new chunk discovery', async () => {
           mockFindOne.mockResolvedValue({ 
              documentId: 'r1', 
              entity_sheets: [{ documentId: 'p1', position: {x:0,y:0} }],
              exploredTiles: [],
              exploredChunks: [] 
          });
          
          mockVoxelService.getChunk.mockResolvedValue({ tiles: [] });

          await service.executeDeterministicTurn('r1', [
              { type: 'move', entityId: 'p1', payload: { x: 64, y: 64 } }
          ]);

          expect(mockBiomeSpawnService.populateChunk).toHaveBeenCalled();
      });
  });



  // --- HARDENING TESTS ---
  describe('Hardening Edge Cases', () => {
      it('executeDeterministicTurn: should block move on collision', async () => {
          // Setup room with existing entity at 10,10
          mockFindOne.mockResolvedValue({ 
              documentId: 'r1', 
              entity_sheets: [
                  { documentId: 'p1', position: {x:0,y:0}, name: 'Hero' },
                  { documentId: 'obs', position: {x:10,y:10}, name: 'Obstacle' }
              ],
              exploredTiles: []
          });

          await service.executeDeterministicTurn('r1', [
              { type: 'move', entityId: 'p1', payload: { x: 10, y: 10 } }
          ]);

          // Should NOT update position
          expect(mockTurnPersistence.updateCharacterPosition).not.toHaveBeenCalled();
          expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('Collision detected'));
      });

      it('executeDeterministicTurn: should handle spawn errors gracefully', async () => {
          mockFindOne.mockResolvedValue({ documentId: 'r1', entity_sheets: [] });
          mockSpawnService.spawnMonster.mockRejectedValue(new Error('Spawn Fail'));

          // Should not throw
          await service.executeDeterministicTurn('r1', [
              { type: 'spawn', payload: { entityType: 'monster', id: 'm1' } }
          ]);
          expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Failed to process spawn'), expect.any(Error));
      });

      it('executeDeterministicTurn: should handle attack dispatch errors gracefully', async () => {
          mockFindOne.mockResolvedValue({ documentId: 'r1', entity_sheets: [] });
          mockActionEngine.dispatch.mockRejectedValue(new Error('Dispatch Fail'));

          await service.executeDeterministicTurn('r1', [
              { type: 'attack', entityId: 'u1', payload: { targetId: 't1' } }
          ]);
          expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Failed to dispatch attack'), expect.any(Error));
      });

       it('executeDeterministicTurn: should handle exploration update failure', async () => {
          mockFindOne.mockResolvedValue({ 
              documentId: 'r1', 
              entity_sheets: [{ documentId: 'p1', position: {x:0,y:0} }],
              exploredTiles: []
          });
          // Update fails
          mockUpdate.mockRejectedValue(new Error('DB Error'));

          await service.executeDeterministicTurn('r1', [
              { type: 'move', entityId: 'p1', payload: { x: 1, y: 1 } }
          ]);
          expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Exploration update failed'), expect.any(Error));
      });
      
      it('processTurn: should parse MOVE:x,y correctly', async () => {
          // Verify strict action parsing from players
          const mockExecute = vi.spyOn(service, 'executeDeterministicTurn');
          
          await service.processTurn('r1', 'desc', [], [
              { userId: 'u1', action: 'MOVE:10,20' },
              { userId: 'u2', action: 'INVALID' } // Should be filtered
          ] as any, 'en');

          expect(mockExecute).toHaveBeenCalledWith('r1', expect.arrayContaining([
              expect.objectContaining({ 
                  type: 'move', 
                  payload: { x: 10, y: 20, z: 0 } 
              })
          ]));
          // Invalid action should not produce a command (array length 1)
          // Note: arrayContaining checks for presence. We can check call args length if we want strictness.
          const callArgs = mockExecute.mock.calls[0][1] as any[];
          expect(callArgs).toHaveLength(1);
      });
  });
  
  describe('submitAction', () => {
      it('should handle debug mode via narrator', async () => {
          const mockProcessAction = vi.fn();
          mockStrapi.service = vi.fn((uid) => {
             if (uid === 'api::narrator.narrator') return { processAction: mockProcessAction };
             return {};
          });

          await service.submitAction('r1', 'cmd', { id: 'u1' }, 'debug');
          expect(mockProcessAction).toHaveBeenCalled();
      });
  });
});
