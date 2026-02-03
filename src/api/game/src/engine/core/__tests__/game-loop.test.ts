import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '@daicer/engine/core/game-loop';
import { EntropySystem } from '@daicer/engine/entropy';

describe('GameLoop', () => {
  it('should initialize with default values', () => {
    const gameLoop = new GameLoop();
    expect(gameLoop.currentTime).toBe(0);
    expect(gameLoop.currentSequence).toBe(0n);
    expect(gameLoop.entropy).toBeUndefined();
  });

  it('should initialize with provided values', () => {
    const mockEntropy = {} as EntropySystem;
    const gameLoop = new GameLoop(100, 10n, mockEntropy);
    expect(gameLoop.currentTime).toBe(100);
    expect(gameLoop.currentSequence).toBe(10n);
    expect(gameLoop.entropy).toBe(mockEntropy);
  });

  it('should advance time and execute registered systems on tick', () => {
    const gameLoop = new GameLoop();
    const systemMock = vi.fn();

    gameLoop.registerSystem(systemMock);

    gameLoop.tick(6); // 6 seconds (1 round)

    expect(gameLoop.currentTime).toBe(6);
    expect(systemMock).toHaveBeenCalledTimes(1);
    expect(systemMock).toHaveBeenCalledWith(6);
  });

  it('should generate sequential IDs', () => {
    const gameLoop = new GameLoop(0, 100n);

    expect(gameLoop.nextSequenceId()).toBe(101n);
    expect(gameLoop.nextSequenceId()).toBe(102n);
    expect(gameLoop.currentSequence).toBe(102n);
  });
});
