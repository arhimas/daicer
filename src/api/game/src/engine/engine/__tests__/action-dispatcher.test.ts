import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionDispatcher } from '@daicer/engine/engine/action-dispatcher';
import { GameState, MoveCommand, AttackCommand } from '@daicer/engine/types';

// Mock dependencies
vi.mock('../../rules/spatial', () => ({
  findPath: vi.fn(),
}));
vi.mock('../../rules/combat', () => ({
  resolveAttack: vi.fn(),
}));

import { findPath } from '@daicer/engine/rules/spatial';
import { resolveAttack } from '@daicer/engine/rules/combat';

describe('Engine ActionDispatcher', () => {
  let dispatcher: ActionDispatcher;
  let mockState: GameState;

  beforeEach(() => {
    dispatcher = new ActionDispatcher();
    mockState = {
      entities: [
        {
          id: 'actor1',
          position: { x: 0, y: 0, z: 0 },
          hp: 10,
          maxHp: 10,
          speed: 30,
          actions: [{ id: 'strike', name: 'Strike' }],
        },
        { id: 'target1', position: { x: 5, y: 5, z: 0 }, hp: 10, maxHp: 10 },
      ],
      timeSeconds: 0,
      exploredTiles: new Set(),
    } as unknown as GameState; // Partial mock
  });

  describe('handleMove', () => {
    it('should return failure if actor not found', () => {
      const cmd: MoveCommand = {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'missing', targetPosition: { x: 1, y: 1, z: 0 } },
      };
      const result = dispatcher.dispatch(mockState, cmd);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Actor not found');
    });

    it('should move if path found', () => {
      vi.mocked(findPath).mockReturnValue([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ]);
      const cmd: MoveCommand = {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'actor1', targetPosition: { x: 5, y: 0, z: 0 } },
      };

      const result = dispatcher.dispatch(mockState, cmd);

      expect(result.success).toBe(true);
      expect(result.events[0].type).toBe('ENTITY_MOVED');
      expect(mockState.entities[0].position).toEqual({ x: 5, y: 0, z: 0 }); // Mutated state logic
    });

    it('should fail if path blocked (empty path)', () => {
      vi.mocked(findPath).mockReturnValue([]);
      const cmd: MoveCommand = {
        type: 'MOVE',
        id: '1',
        timestamp: 0,
        payload: { actorId: 'actor1', targetPosition: { x: 5, y: 0, z: 0 } },
      };

      const result = dispatcher.dispatch(mockState, cmd);
      expect(result.success).toBe(false);
    });
  });

  describe('handleAttack', () => {
    it('should resolve attack and apply damage', () => {
      vi.mocked(resolveAttack).mockReturnValue({
        hit: true,
        isCritical: false,
        damageTotal: 5,
        attackRoll: { total: 15, natural: 10, modifier: 5 },
        verdict: 'Hit',
        trace: [],
      });

      const cmd: AttackCommand = {
        type: 'ATTACK',
        id: '2',
        timestamp: 0,
        payload: { actorId: 'actor1', targetId: 'target1' },
      };
      const result = dispatcher.dispatch(mockState, cmd);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Hit');
      // Check damage application
      const target = mockState.entities.find((e) => e.id === 'target1');
      expect(target?.hp).toBe(5); // 10 - 5
    });

    it('should handle miss', () => {
      vi.mocked(resolveAttack).mockReturnValue({
        hit: false,
        isCritical: false,
        damageTotal: 0,
        attackRoll: { total: 5, natural: 2, modifier: 3 },
        verdict: 'Miss',
        trace: [],
      });

      const cmd: AttackCommand = {
        type: 'ATTACK',
        id: '2',
        timestamp: 0,
        payload: { actorId: 'actor1', targetId: 'target1' },
      };
      const result = dispatcher.dispatch(mockState, cmd);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Miss');
      const target = mockState.entities.find((e) => e.id === 'target1');
      expect(target?.hp).toBe(10); // No damage
    });
  });
});
