import { Action } from '../types';

/**
 * GameLoop
 * The heartbeat of the deterministic engine.
 * Responsibilities:
 * - Managing Global Time (tick)
 * - Processing a queue of Events (Inputs)
 * - Emitting resulting Events (Outputs)
 * - Keeping track of strict sequence
 */
export class GameLoop {
  private _currentTimeSeconds: number = 0;
  private _sequenceId: bigint = 0n;

  // Handlers for "Tick" logic (Entropy, Bio, etc)
  private _onTick: ((deltaSeconds: number) => void)[] = [];

  constructor(initialTime: number = 0, initialSequence: bigint = 0n) {
    this._currentTimeSeconds = initialTime;
    this._sequenceId = initialSequence;
  }

  get currentTime() {
    return this._currentTimeSeconds;
  }

  get currentSequence() {
    return this._sequenceId;
  }

  /**
   * Register a system to run on every tick
   */
  public registerSystem(callback: (deltaSeconds: number) => void) {
    this._onTick.push(callback);
  }

  /**
   * Advance time by a specific delta.
   * This is the "Pure" way to move the simulation forward.
   * @param deltaSeconds Amount of time to pass (6s, 60s, 3600s)
   */
  public tick(deltaSeconds: number) {
    this._currentTimeSeconds += deltaSeconds;

    // Execute all registered systems
    for (const system of this._onTick) {
      system(deltaSeconds);
    }

    // In a real iteration, this might also process an 'Action Queue'
    // and intersperse logic between time slices.
    // For Phase 2 MVP, we just strictly advance.
  }

  /**
   * Deterministically generate the next Sequence ID
   */
  public nextSequenceId(): bigint {
    this._sequenceId += 1n;
    return this._sequenceId;
  }
}
