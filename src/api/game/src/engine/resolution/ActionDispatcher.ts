import { RuntimeAction } from '../derivation/types';
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
   * Resolves a "hydrated" RuntimeAction against a target Entity.
   * This is the "Engine Room" where dice meets stats.
   *
   * Pipeline:
   * 1. Attack Roll (d20 + Bonus vs AC).
   * 2. Saving Throw (d20 + Bonus vs DC) - If applicable.
   * 3. Effect Application (Damage/Condition resolution).
   *
   * @param source - The actor performing the action.
   * @param target - The entity being targeted.
   * @param action - The full RuntimeAction object (hydrated).
   * @param _rollSeed - Optional seed for deterministic replay.
   * @returns Detailed ResolutionResult including logs and final damage.
   */
  static resolve(source: Entity, target: Entity, action: RuntimeAction, _rollSeed?: string): ResolutionResult {
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
      const saveAttrShort = action.save.attribute; // 'str', 'dex'

      const attrMap: Record<string, string> = {
        str: 'strength',
        dex: 'dexterity',
        con: 'constitution',
        int: 'intelligence',
        wis: 'wisdom',
        cha: 'charisma',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetStats = target.stats as any;
      const fullAttr = attrMap[saveAttrShort] || 'dexterity';

      const statVal = targetStats?.[fullAttr] ?? 10;
      const mod = Math.floor((statVal - 10) / 2);

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

    if (hit && action.effects) {
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
          if (action.save && savePassed !== undefined && savePassed) {
            if (action.save.effect === 'negate') val = 0;
            if (action.save.effect === 'half') val = Math.floor(val / 2);
          }

          damageTotal += val;
          damageDetails.push(`${val} ${effect.subtype || 'Damage'}`);
        }

        if (effect.type === 'apply_condition') {
          if (savePassed === false || savePassed === undefined) {
            // Conditions apply if save failed or no save
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
