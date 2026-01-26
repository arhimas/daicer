import { Entity, EntityAction } from '../../types';
import { CombatContext, FeatureHandler, FeatureRegistry } from '../registry/FeatureRegistry';

/**
 * Rogue Sneak Attack Implementation.
 * Checks Finesse/Range + Advantage/Ally interaction.
 * Adds level-scaling precision damage.
 */
export const SneakAttack: FeatureHandler = {
  name: 'Sneak Attack',

  canApply: (attacker: Entity, action: EntityAction, context: CombatContext): boolean => {
    // 1. Must use Finesse or Ranged weapon
    // MVP: Check action type or properties
    const hasFinesse = action.properties?.some(p => p === 'finesse') || false;
    const isFinesse = ['ranged', 'ranged_attack'].includes(action.type) || hasFinesse;

    if (!isFinesse) return false;

    // 2. Must have Advantage OR (Ally Adjacent AND No Disadvantage)
    if (context.hasDisadvantage) return false;

    if (context.hasAdvantage) return true;
    if (context.allyAdjacent) return true;

    return false;
  },

  applyDamageBonus: (attacker: Entity, _context: CombatContext) => {
    // Logic: ceil(level / 2) d6
    // Assuming pure level for now, or explicit "Rogue Level" if we had it.
    const level = attacker.level || 1;
    const diceCount = Math.ceil(level / 2);

    return {
      amount: 0,
      dice: `${diceCount}d6`,
      type: 'precision', // or matches weapon type? usually matches weapon.
    };
  },
};

// Auto-register
FeatureRegistry.register(SneakAttack);
