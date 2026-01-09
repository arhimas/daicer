import { ActionDefinition } from '../../types/ActionDefinition';
import { Entity } from '../types';

export interface ResolutionResult {
  hit: boolean;
  crit: boolean;
  savePassed?: boolean;
  damageTotal: number;
  damageDetails: string[];
  conditionsApplied: string[];
  log: string[];
}

export class ActionDispatcher {
  /**
   * Resolve an action against a target
   * @param source The attacker
   * @param target The defender
   * @param action The action being used
   * @param rollSeed (Optional) for deterministic rolling
   */
  static resolve(source: Entity, target: Entity, action: ActionDefinition, _rollSeed?: string): ResolutionResult {
    // Using Entity for source/target wrapper
    const log: string[] = [];
    let hit = true;
    let crit = false;
    let savePassed = undefined;

    log.push(`Action: ${action.name} used by ${source.name} on ${target.name}`);

    // 1. Attack Roll
    if (action.attack) {
      const d20 = Math.floor(Math.random() * 20) + 1; // Replace with deterministic PRNG if seed provided
      const total = d20 + action.attack.bonus;
      crit = d20 >= (action.attack.critRange || 20);

      const ac = target.armorClass || 10;
      hit = total >= ac || crit;

      log.push(`Attack Roll: ${d20} + ${action.attack.bonus} = ${total} vs AC ${ac}. Result: ${hit ? 'HIT' : 'MISS'}`);
      if (crit) log.push('CRITICAL HIT!');
    }

    // 2. Saving Throw
    if (hit && action.save) {
      // Look up target save bonus
      const saveAttr = action.save.attribute; // e.g. 'dex'
      const mod = Math.floor(((target.stats?.[saveAttr] || 10) - 10) / 2);
      const prof = 0; // TODO: Check proficiency
      const saveBonus = mod + prof; // Simplified

      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + saveBonus;
      savePassed = total >= action.save.dc;

      log.push(
        `${action.save.attribute.toUpperCase()} Save: ${d20} + ${saveBonus} = ${total} vs DC ${action.save.dc}. Result: ${savePassed ? 'PASSED' : 'FAILED'}`
      );
    }

    // 3. Effect Application (Damage/Condition)
    let damageTotal = 0;
    const damageDetails: string[] = [];
    const conditionsApplied: string[] = [];

    if (hit) {
      action.effects.forEach((effect) => {
        if (effect.type === 'damage' || effect.type === 'healing') {
          // Parse Dice (e.g. "8d6")
          let val = 0;
          if (effect.dice) {
            const [count, face] = effect.dice.split('d').map(Number);
            for (let i = 0; i < count; i++) {
              val += Math.floor(Math.random() * face) + 1;
            }
            if (crit && effect.type === 'damage') {
              for (let i = 0; i < count; i++) {
                val += Math.floor(Math.random() * face) + 1;
              }
            }
          }
          val += effect.flat || 0;

          // Handle Save Mapping
          if (action.save && savePassed) {
            if (action.save.effect === 'negate') val = 0;
            if (action.save.effect === 'half') val = Math.floor(val / 2);
          }

          damageTotal += val;
          damageDetails.push(`${val} ${effect.subtype || 'Damage'}`);
        }

        if (effect.type === 'apply_condition') {
          if (!savePassed) {
            // Usually conditions apply on fail
            conditionsApplied.push(effect.subtype || 'Condition');
          }
        }
      });
    }

    log.push(`Total Damage: ${damageTotal}`);
    if (conditionsApplied.length > 0) log.push(`Conditions: ${conditionsApplied.join(', ')}`);

    return {
      hit,
      crit,
      savePassed,
      damageTotal,
      damageDetails,
      conditionsApplied,
      log,
    };
  }
}
