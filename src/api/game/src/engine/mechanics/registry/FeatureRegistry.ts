import { Entity, EntityAction } from '@daicer/engine/types';

export interface CombatContext {
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  isCritical: boolean;
  target?: Entity;
  allyAdjacent?: boolean;
}

export interface FeatureHandler {
  name: string; // "Sneak Attack"

  /**
   * Can this feature apply to the current action?
   */
  canApply(attacker: Entity, action: EntityAction, context: CombatContext): boolean;

  /**
   * Returns damage bonus info
   */
  applyDamageBonus?(attacker: Entity, context: CombatContext): { amount: number; dice: string; type: string };

  /**
   * Returns hit modifier
   */
  applyToHitBonus?(attacker: Entity, context: CombatContext): number;
}

/**
 * Registry for Special Abilities (Feats, Class Features).
 * Maps specific feature names ("Sneak Attack", "Rage") to executable code `FeatureHandler`.
 */
export class FeatureRegistry {
  private static handlers = new Map<string, FeatureHandler>();

  static register(handler: FeatureHandler) {
    this.handlers.set(handler.name.toLowerCase(), handler);
  }

  static get(name: string): FeatureHandler | undefined {
    return this.handlers.get(name.toLowerCase());
  }
}
