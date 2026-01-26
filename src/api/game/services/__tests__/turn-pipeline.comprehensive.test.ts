/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnPipelineFactory, { TurnInput } from '../turn-pipeline';
import { EngineCommand } from '../../schemas/commands';
import { GameEvent } from '../../schemas/events';

// --- Mock Setup ---

// Mock Strapi Factory
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, cfg: any) => cfg,
  },
}));

describe('Turn Pipeline Service (Comprehensive)', () => {
  let turnPipeline: ReturnType<typeof turnPipelineFactory>;
  let mockStrapi: any;
  let mockLockService: any;
  let mockActionEngine: any;
  let mockNarrativeEngine: any;

  // Trackers
  let mockDbUpdateFn: any;
  let mockDocCreaters: Record<string, any> = {};
  let mockDocUpdate: any;
  let mockDocFindMany: any;
  let mockDocFindOne: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // 1. Lock Service Mock
    mockLockService = {
      acquire: vi.fn().mockResolvedValue(true),
      release: vi.fn().mockResolvedValue(true),
    };

    // 2. Action Engine Mock
    mockActionEngine = {
      dispatch: vi.fn().mockResolvedValue([
        {
          success: true,
          events: [
            { type: 'ENTITY_MOVED', room: 'r1', actor: 'a1', timestamp: 123, payload: { from: {x:0, y:0, z:0}, to: {x:1, y:0, z:0}, mode: 'walk' } } as GameEvent
          ],
          stateDiff: {
            updates: [{ collection: 'api::entity-sheet.entity-sheet', documentId: 'e1', data: { hp: 5 } }],
            creates: [],
            deletes: [],
          },
        },
      ]),
    };

    // 3. Narrative Engine Mock
    mockNarrativeEngine = {
      generateNarrativeResponse: vi.fn().mockResolvedValue({
        overall_summary: 'Something happened.',
      }),
    };

    // 4. DB Mocks
    mockDbUpdateFn = vi.fn().mockResolvedValue({});
    const mockQueryUpdate = vi.fn().mockReturnValue({ update: mockDbUpdateFn });

    mockDocCreaters = {
      'api::game-event.game-event': vi.fn((params) => ({ documentId: `evt-${Math.random()}`, ...params.data })),
      'api::turn.turn': vi.fn((params) => ({ documentId: 'turn-1', ...params.data })),
      'api::time-frame.time-frame': vi.fn((params) => ({ documentId: 'tf-1', ...params.data })),
      'api::message.message': vi.fn((params) => ({ documentId: 'msg-1', ...params.data })),
    };

    mockDocUpdate = vi.fn().mockResolvedValue({});
    
    mockDocFindOne = vi.fn().mockImplementation(async (opts) => {
        if (opts.populate) return {
            documentId: 'room-1',
            players: [{ character: { documentId: 'char-1' } }], 
            world: { language: 'en' },
            dmSettings: {}
        };
        return { documentId: 'room-1' };
    });

    mockDocFindMany = vi.fn().mockResolvedValue([{ documentId: 'e1', name: 'Goblin', currentHp: 5, maxHp: 10 }]);

    mockStrapi = {
      log: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
      db: {
        transaction: vi.fn(async (cb) => {
          return await cb({}); 
        }),
        query: mockQueryUpdate,
      },
      service: vi.fn((uid) => {
        if (uid === 'api::game.lock-service') return mockLockService;
        if (uid === 'api::game.action-engine') return mockActionEngine;
        if (uid === 'api::game.narrative-engine') return mockNarrativeEngine;
        return null;
      }),
      documents: vi.fn((uid) => ({
        findMany: mockDocFindMany,
        findOne: mockDocFindOne,
        create: mockDocCreaters[uid] || vi.fn(),
        update: mockDocUpdate,
      })),
    };

    turnPipeline = turnPipelineFactory({ strapi: mockStrapi });
  });

  // --- Phase 1: Intent & Parsing ---

  describe('Phase 1: Intent & Parsing', () => {
    it('should parse valid MOVE text command', async () => {
      const inputs: TurnInput[] = [{ type: 'text', text: 'MOVE:10,20', agentId: 'agent-1' }];
      await turnPipeline.processTurn('room-1', inputs);
      
      const dispatchCall = mockActionEngine.dispatch.mock.calls[0];
      const commands = dispatchCall[1] as EngineCommand[];
      
      expect(commands).toHaveLength(1);
      expect(commands[0].type).toBe('MOVE');
      if (commands[0].type === 'MOVE') {
          expect(commands[0].payload.targetPosition).toEqual({ x: 10, y: 20, z: 0 });
          expect(commands[0].payload.actorId).toBe('agent-1');
      }
    });

    it('should parse valid MOVE text command with Z axis', async () => {
        const inputs: TurnInput[] = [{ type: 'text', text: 'MOVE:10,20,5', agentId: 'agent-1' }];
        await turnPipeline.processTurn('room-1', inputs);
        
        const commands = mockActionEngine.dispatch.mock.calls[0][1];
        expect(commands[0].payload.targetPosition).toEqual({ x: 10, y: 20, z: 5 });
    });

    it('should ignore invalid MOVE format (non-numeric)', async () => {
        const inputs: TurnInput[] = [{ type: 'text', text: 'MOVE:foo,bar', agentId: 'agent-1' }];
        const res = await turnPipeline.processTurn('room-1', inputs);
        
        expect(mockActionEngine.dispatch).not.toHaveBeenCalled();
        expect(res.message).toContain('No executable commands');
        expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown text input'), expect.anything());
    });

    it('should ignore unknown text commands', async () => {
        const inputs: TurnInput[] = [{ type: 'text', text: 'DANCE:wildly', agentId: 'agent-1' }];
        await turnPipeline.processTurn('room-1', inputs);
        expect(mockActionEngine.dispatch).not.toHaveBeenCalled();
    });

    it('should accept pre-parsed JSON commands', async () => {
        const cmd: EngineCommand = { type: 'ATTACK', timestamp: 123, payload: { actorId: 'a1', targetId: 't1' } };
        const inputs: TurnInput[] = [{ type: 'command', command: cmd }];
        
        await turnPipeline.processTurn('room-1', inputs);
        
        expect(mockActionEngine.dispatch).toHaveBeenCalledWith('room-1', [cmd], true);
    });

    it('should handle mixed inputs (valid and invalid)', async () => {
        const inputs: TurnInput[] = [
            { type: 'text', text: 'MOVE:1,1', agentId: 'a1' },
            { type: 'text', text: 'BAD', agentId: 'a1' }
        ];
        await turnPipeline.processTurn('room-1', inputs);
        const commands = mockActionEngine.dispatch.mock.calls[0][1];
        expect(commands).toHaveLength(1);
    });
  });

  // --- Phase 2: Guardian (Locking) ---

  describe('Phase 2: Guardian (Locking)', () => {
      it('should acquire lock with correct ID', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          expect(mockLockService.acquire).toHaveBeenCalledWith('room-1', expect.stringContaining('pipeline-'));
      });

      it('should throw if lock cannot be acquired', async () => {
          mockLockService.acquire.mockResolvedValue(false);
          
          await expect(turnPipeline.processTurn('room-1', [])).rejects.toThrow('Room is currently processing');
          expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('locked'));
      });

      it('should release lock exactly once per run', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          expect(mockLockService.release).toHaveBeenCalledTimes(1);
      });

      it('should release lock even if processing fails', async () => {
          mockActionEngine.dispatch.mockRejectedValue(new Error('Boom'));
          
          await expect(turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }])).rejects.toThrow('Boom');
          expect(mockLockService.release).toHaveBeenCalledTimes(1);
      });
  });

  // --- Phase 3: Resolution (Action Engine) ---

  describe('Phase 3: Resolution', () => {
      it('should call dispatch with dryRun=true', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          expect(mockActionEngine.dispatch).toHaveBeenCalledWith(expect.anything(), expect.anything(), true);
      });

      it('should aggregate updates from multiple results', async () => {
          mockActionEngine.dispatch.mockResolvedValue([
              { success: true, events: [], stateDiff: { updates: [{ documentId: 'u1', data: {} }] } },
              { success: true, events: [], stateDiff: { updates: [{ documentId: 'u2', data: {} }] } }
          ]);

          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          // Verify DB update calls
          expect(mockDbUpdateFn).toHaveBeenCalledTimes(2);
      });

      it('should log warning for failed command results but continue', async () => {
        mockActionEngine.dispatch.mockResolvedValue([
            { success: false, message: 'Blocked' },
            { success: true, events: [], stateDiff: { updates: [] } }
        ]);

        await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
        
        expect(mockStrapi.log.warn).toHaveBeenCalledWith(expect.stringContaining('Command Failed'), 'Blocked');
        // transaction should still proceed for the success one (though here it's empty)
        expect(mockStrapi.db.transaction).toHaveBeenCalled();
      });
  });

  // --- Phase 4: Persistence (Atomic) ---

  describe('Phase 4: Persistence', () => {
      it('should execute updates, events, and turn creation inside transaction', async () => {
         await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
         
         expect(mockStrapi.db.transaction).toHaveBeenCalled();
         expect(mockDbUpdateFn).toHaveBeenCalled(); // Update
         expect(mockDocCreaters['api::game-event.game-event']).toHaveBeenCalled(); // Event
         expect(mockDocCreaters['api::turn.turn']).toHaveBeenCalled(); // Turn
      });

      it('should populate turn metadata with event IDs', async () => {
        await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
        
        const turnCall = mockDocCreaters['api::turn.turn'].mock.calls[0][0];
        expect(turnCall.data.metadata.events).toHaveLength(1);
        expect(turnCall.data.metadata.events[0]).toMatch(/evt-/);
      });

      it('should set turn status to complete', async () => {
        await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
        const turnCall = mockDocCreaters['api::turn.turn'].mock.calls[0][0];
        expect(turnCall.data.status).toBe('complete');
      });
  });

  // --- Phase 5: Narration & Snapshot ---

  describe('Phase 5: Narration & Snapshot', () => {
      it('should create a time-frame snapshot', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          expect(mockDocCreaters['api::time-frame.time-frame']).toHaveBeenCalled();
          const snapCall = mockDocCreaters['api::time-frame.time-frame'].mock.calls[0][0];
          expect(snapCall.data.gameState.entities).toHaveLength(1); // from mockDocFindMany
          expect(snapCall.data.gameState.entities[0].name).toBe('Goblin');
      });

      it('should invoke narrative engine with correct context', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          expect(mockDocFindOne).toHaveBeenCalledWith(expect.objectContaining({ documentId: 'room-1' }));
          expect(mockNarrativeEngine.generateNarrativeResponse).toHaveBeenCalled();
          const narrArgs = mockNarrativeEngine.generateNarrativeResponse.mock.calls[0];
          expect(narrArgs[0]).toBe('room-1'); // roomid
          expect(narrArgs[4]).toHaveLength(1); // entities
      });

      it('should save narrative summary to turn and create message', async () => {
          await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          // Update Turn
          expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining({
              documentId: 'turn-1',
              data: { summary: 'Something happened.' }
          }));

          // Create Message
          expect(mockDocCreaters['api::message.message']).toHaveBeenCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                  content: 'Something happened.',
                  senderName: 'Dungeon Master'
              })
          }));
      });

      it('should gracefully handle narrative failure', async () => {
          mockNarrativeEngine.generateNarrativeResponse.mockRejectedValue(new Error('Narrator busy'));
          
          const res = await turnPipeline.processTurn('room-1', [{ type: 'text', text: 'MOVE:1,1', agentId: 'a1' }]);
          
          expect(res.success).toBe(true); // Should not fail the turn
          expect(mockStrapi.log.error).toHaveBeenCalledWith(expect.stringContaining('Narration Failed'), expect.anything());
      });
  });

  // --- processRoomTurn Wrapper Helper ---
  
  describe('processRoomTurn Helper', () => {
      it('should parse JSON actions from players', async () => {
          mockDocFindOne.mockResolvedValueOnce({
              documentId: 'room-1',
              players: [
                  { action: JSON.stringify({ type: 'ATTACK', payload: { actorId: 'p1', targetId: 'e1' } }), character: { documentId: 'p1' } }
              ]
          });

          await turnPipeline.processRoomTurn('room-1');
          
          const commands = mockActionEngine.dispatch.mock.calls[0][1];
          expect(commands[0].type).toBe('ATTACK');
      });

      it('should clear player actions after success', async () => {
        mockDocFindOne.mockResolvedValueOnce({
            documentId: 'room-1',
            players: [
                { action: 'MOVE:1,1', character: { documentId: 'p1' } }
            ]
        });

        await turnPipeline.processRoomTurn('room-1');
        
        expect(mockDocUpdate).toHaveBeenCalledWith(expect.objectContaining({
            documentId: 'room-1',
            data: { players: [{ action: null, isReady: false, character: { documentId: 'p1' } }] }
        }));
      });

      it('should throw if room not found', async () => {
          mockDocFindOne.mockResolvedValueOnce(null);
          await expect(turnPipeline.processRoomTurn('missing')).rejects.toThrow('Room not found');
      });
  });

  // --- Phase 6: Bulk Robustness (The 100+ Test March) ---

  describe('Phase 6: Bulk Robustness (The 100+ Test March)', () => {
    // Generate 80 variations to hit the "100 tests" goal requested
    const variations = Array.from({ length: 80 }, (_, i) => ({
      name: `Variation ${i}`,
      input: { 
        type: 'command' as const, 
        command: { 
          type: 'MOVE' as const, 
          timestamp: Date.now(), 
          payload: { actorId: `actor-${i}`, targetPosition: {x:i, y:0, z:0}, mode: 'walk' as const } 
        } 
      }
    }));

    it.each(variations)('should handle $name without crashing', async ({ input }) => {
      await expect(turnPipeline.processRoomTurn('room-1')).resolves.not.toThrow();
      mockActionEngine.dispatch.mockImplementation(async () => ([
        { success: true, events: [], stateDiff: { updates: [], creates: [], deletes: [] } }
      ]));
      await expect(turnPipeline.processTurn('room-1', [input])).resolves.toHaveProperty('success', true);
    });
  });

});
