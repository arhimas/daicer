import { useState, useCallback } from 'react';
import type { CombatCharacter, CombatState, CombatHistory } from '../types/combat';
import type { GridPosition } from '../types/spells';

export type Position = GridPosition;

export function useCombat(roomId: string) {
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [history, setHistory] = useState<CombatHistory[]>([]);

  // Socket logic removed.
  // TODO: Implement GraphQL mutations and polling for combat state.

  const attack = useCallback(
    (
      attackerId: string,
      defenderId: string,
      options?: {
        weaponDamage?: string;
        damageType?: string;
      }
    ) => {
      console.warn('Combat attack not implemented (waiting for GraphQL migration)');
    },
    [roomId]
  );

  const move = useCallback(
    (characterId: string, targetX: number, targetY: number) => {
      console.warn('Combat move not implemented (waiting for GraphQL migration)');
    },
    [roomId]
  );

  const endTurn = useCallback(() => {
    console.warn('Combat endTurn not implemented (waiting for GraphQL migration)');
  }, [roomId]);

  const restoreState = useCallback(
    (historyIndex: number) => {
      console.warn('Combat restoreState not implemented (waiting for GraphQL migration)');
    },
    [roomId]
  );

  const getActiveCharacter = useCallback((): CombatCharacter | null => {
    if (!combatState || !combatState.activeCharacterId) return null;
    return combatState.characters.find((c) => c.id === combatState.activeCharacterId) ?? null;
  }, [combatState]);

  const getCharacter = useCallback(
    (id: string): CombatCharacter | undefined => {
      if (!combatState) return undefined;
      return combatState.characters.find((c) => c.id === id);
    },
    [combatState]
  );

  return {
    combatState,
    history,
    attack,
    move,
    endTurn,
    restoreState,
    getActiveCharacter,
    getCharacter,
  };
}
