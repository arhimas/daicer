import { describe, it, expect } from 'vitest';
import { DeterministicTurnProcessor, GameState } from '../deterministic-turn-processor';
import { MoveCommand } from '../../types';

describe('DeterministicTurnProcessor', () => {
  const processor = new DeterministicTurnProcessor();
  const mockState: GameState = {
    entities: [
      { id: '1', position: { x: 0, y: 0, z: 0 }, hp: 10, maxHp: 10 },
      { id: '2', position: { x: 5, y: 5, z: 0 }, hp: 10, maxHp: 10 },
    ],
    exploredTiles: new Set(['0,0']),
    timeSeconds: 0,
  };

  it('should process move action', () => {
    const action: MoveCommand = {
      type: 'MOVE',
      payload: {
        actorId: '1',
        targetPosition: { x: 1, y: 1, z: 0 },
        mode: 'walk',
      },
      timestamp: 123,
    };

    const next = processor.process(mockState, [action]);
    const moved = next.entities.find((e) => e.id === '1');

    expect(moved?.position).toEqual({ x: 1, y: 1, z: 0 });
    expect(next.exploredTiles.has('1,1')).toBe(true);
  });

  it('should block move on collision', () => {
    // Move 1 to 5,5 (occupied by 2)
    const action: MoveCommand = {
      type: 'MOVE',
      payload: {
        actorId: '1',
        targetPosition: { x: 5, y: 5, z: 0 },
        mode: 'walk',
      },
      timestamp: 123,
    };

    const next = processor.process(mockState, [action]);
    const moved = next.entities.find((e) => e.id === '1');

    expect(moved?.position).toEqual({ x: 0, y: 0, z: 0 }); // Stayed put
  });

  it('should ignore invalid actor', () => {
    const action: MoveCommand = {
      type: 'MOVE',
      payload: {
        actorId: '999',
        targetPosition: { x: 10, y: 10, z: 0 },
        mode: 'walk',
      },
      timestamp: 123,
    };
    const next = processor.process(mockState, [action]);
    expect(next.entities).toEqual(mockState.entities);
  });

  it('should be immutable', () => {
    const action: MoveCommand = {
      type: 'MOVE',
      payload: {
        actorId: '1',
        targetPosition: { x: 1, y: 1, z: 0 },
        mode: 'walk',
      },
      timestamp: 123,
    };
    const next = processor.process(mockState, [action]);

    // Initial state unchanged
    expect(mockState.entities[0].position).toEqual({ x: 0, y: 0, z: 0 });
    // Next state updated
    expect(next.entities[0].position).toEqual({ x: 1, y: 1, z: 0 });
  });
});
