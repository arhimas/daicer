import { describe, it, expect, beforeEach } from 'vitest';
import { DeterministicTurnProcessor, GameState } from '../deterministic-turn-processor';

describe('DeterministicTurnProcessor', () => {
  let processor: DeterministicTurnProcessor;
  let initialState: GameState;

  beforeEach(() => {
    processor = new DeterministicTurnProcessor();
    initialState = {
      timeSeconds: 0,
      exploredTiles: new Set(['0,0']),
      entities: [
        { id: 'hero', position: { x: 0, y: 0, z: 0 }, hp: 10, maxHp: 10 },
        { id: 'orc', position: { x: 5, y: 5, z: 0 }, hp: 10, maxHp: 10 }
      ]
    };
  });

  it('should process move commands', () => {
    const action = {
      type: 'MOVE',
      payload: {
        actorId: 'hero',
        targetPosition: { x: 1, y: 0, z: 0 }
      }
    };

     
    const nextState = processor.process(initialState, [action as any]);

    const hero = nextState.entities.find(e => e.id === 'hero');
    expect(hero?.position).toEqual({ x: 1, y: 0, z: 0 });
  });

  it('should prevent collision on move', () => {
    const action = {
      type: 'MOVE',
      payload: {
        actorId: 'hero',
        targetPosition: { x: 5, y: 5, z: 0 } // Orc is here
      }
    };

     
    const nextState = processor.process(initialState, [action as any]);

    const hero = nextState.entities.find(e => e.id === 'hero');
    expect(hero?.position).toEqual({ x: 0, y: 0, z: 0 }); // Stayed put
  });

  it('should update exploration on move', () => {
    const action = {
      type: 'MOVE',
      payload: {
        actorId: 'hero',
        targetPosition: { x: 50, y: 50, z: 0 } // Teleport/Far move
      }
    };

     
    const nextState = processor.process(initialState, [action as any]);

    // Check if new tiles explored around 50,50
    expect(nextState.exploredTiles.has('50,50')).toBe(true);
    expect(nextState.exploredTiles.has('51,50')).toBe(true);
  });

  it('should maintain immutability', () => {
    const action = {
      type: 'MOVE',
      payload: { actorId: 'hero', targetPosition: { x: 1, y: 0, z: 0 } }
    };

     
    processor.process(initialState, [action as any]);

    // Initial state should be unchanged
    const hero = initialState.entities.find(e => e.id === 'hero');
    expect(hero?.position).toEqual({ x: 0, y: 0, z: 0 });
  });
});
