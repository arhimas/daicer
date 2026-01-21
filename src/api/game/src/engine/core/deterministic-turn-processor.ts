import { Action, MoveCommand } from '../types';

export interface EntityState {
  id: string; // This is the generic ID (likely documentId from Strapi)
  position: { x: number; y: number; z: number };
  hp: number;
  maxHp: number;
}

export interface GameState {
  entities: EntityState[];
  exploredTiles: Set<string>;
  timeSeconds: number;
}

/**
 * Pure logic processor for a single turn in the Simulation.
 * 
 * DESIGN:
 * This class MUST remain pure (no Side Effects, no DB calls).
 * It takes State + Actions -> Returns New State.
 * This ensures replayability and testability of the core game logic.
 */
export class DeterministicTurnProcessor {
  /**
   * Process a batch of actions against the current state
   * strictly and deterministically.
   */
  public process(initialState: GameState, actions: Action[]): GameState {
    // Deep clone state to ensure immutability
    const nextState: GameState = JSON.parse(
      JSON.stringify({
        ...initialState,
        exploredTiles: Array.from(initialState.exploredTiles), // Handle Set serialization
      })
    );

    // Rehydrate Set
    nextState.exploredTiles = new Set(nextState.exploredTiles);

    for (const action of actions) {
      this.applyAction(nextState, action);
    }

    return nextState;
  }

  private applyAction(state: GameState, action: Action) {
    if (action.type === 'MOVE') {
      this.handleMove(state, action as MoveCommand);
    }
    // Add other handlers here (ATTACK, SPAWN, etc)
  }

  private handleMove(state: GameState, action: MoveCommand) {
    const entity = state.entities.find((e) => e.id === action.payload.actorId);
    if (!entity) return; // Entity not found, ignore

    const target = action.payload.targetPosition;
    if (!target) return;

    // Deterministic Collision Check
    const isOccupied = state.entities.some(
      (e) =>
        e.id !== entity.id &&
        Math.round(e.position.x) === Math.round(target.x) &&
        Math.round(e.position.y) === Math.round(target.y)
    );

    if (isOccupied) {
      // Collision: Do nothing (or log failure event if we had an event log)
      return;
    }

    // Apply Move
    entity.position = { x: target.x, y: target.y, z: target.z ?? 0 };

    // Update Exploration (Standard 8-tile radius)
    this.updateExploration(state, target);
  }

  private updateExploration(state: GameState, center: { x: number; y: number }) {
    const VISION_RADIUS = 8;
    for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
      for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
        if (Math.sqrt(dx * dx + dy * dy) <= VISION_RADIUS) {
          const wx = Math.round(center.x) + dx;
          const wy = Math.round(center.y) + dy;
          state.exploredTiles.add(`${wx},${wy}`);
        }
      }
    }
  }
}
