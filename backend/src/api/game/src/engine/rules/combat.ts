export { ActionType } from './actions';
import { ActionDefinition, ActionIntent, ActionType } from './actions';
import { Entity, ExecutionTrace, ExecutionStep, EntityAction } from '../types';
import { roll, DiceResult, parseDiceString } from './dice';
import { calculateDistance } from '../utils/geometry';
import { getConditionModifiers, hasCondition, ConditionType } from './conditions';
import { calculateModifier } from './dnd5e';

// SOTA Imports
import { DamageInstance } from '../mechanics/damage/DamageInstance';
import { DamageType } from '../mechanics/damage/DamageType';
import { FeatureRegistry, CombatContext } from '../mechanics/registry/FeatureRegistry';
import '../mechanics/features/sneak-attack'; // Ensure registration
import '../mechanics/features/rage'; // Ensure registration

// ============================================================================
// Types
// ============================================================================

export interface CombatPositions {
  attacker: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

export interface AttackResult {
  hit: boolean;
  isCritical: boolean;
  isCriticalFail: boolean;
  attackRoll: DiceResult;
  damageTotal: number;
  damageDetails: {
    type: string;
    total: number;
    diceRolls: number[];
    bonus: number;
    diceString: string;
  }[];
  verdict: string; // "Hit!", "Miss", "Critical Hit!"
  trace: ExecutionTrace;
}

// ============================================================================
// Helpers
// ============================================================================

function findAction(entity: Entity, actionId: string): ActionDefinition | undefined {
  // Use resolved actions from entity adapter
  return entity.actions.find((a) => a.id === actionId) as unknown as ActionDefinition | undefined;
}

// ============================================================================
// Combat Logic
// ============================================================================

/**
 * Validates if an attack is possible (Range check).
 */
export function validateAttack(
  attacker: Entity,
  target: Entity,
  intent: ActionIntent,
  positions: CombatPositions
): { valid: boolean; reason?: string } {
  if (intent.type !== ActionType.Attack) return { valid: false, reason: 'Not an attack' };

  const action = findAction(attacker, intent.actionId);
  if (!action) return { valid: false, reason: 'Action not found' };

  const dist = calculateDistance(positions.attacker, positions.target);

  if (action?.type === 'melee' || action?.type === 'melee_attack') {
    // TS Guard
    const reach = action.reach || 5;
    if (dist > reach) return { valid: false, reason: `Target out of range (${dist.toFixed(1)}ft vs ${reach}ft)` };
  } else if (action?.type === 'ranged' || action?.type === 'ranged_attack') {
    const maxRange = (action.range as unknown as { long: number }).long || 120; // Type loose for string vs obj
    if (dist > maxRange) return { valid: false, reason: `Target out of range (${dist.toFixed(1)}ft vs ${maxRange}ft)` };
    // Note: Disadvantage at long range is a resolution mechanic, not a hard validation failure.
  }

  return { valid: true };
}

/**
 * Resolves a unified Attack Action using SRO Architecture.
 */
export function resolveAttack(
  attacker: Entity,
  target: Entity,
  intent: ActionIntent,
  rng?: () => number
): AttackResult {
  if (intent.type !== ActionType.Attack) {
    throw new Error('Invalid intent type for resolveAttack');
  }

  const action = findAction(attacker, intent.actionId);
  if (
    !action ||
    (action.type !== 'melee' &&
      action.type !== 'ranged' &&
      action.type !== 'melee_attack' &&
      action.type !== 'ranged_attack')
  ) {
    throw new Error(`Action ${intent.actionId} is not a valid attack definition.`);
  }

  const trace: ExecutionTrace = [];

  // ===========================================================================
  // 1. Establish Combat Context
  // ===========================================================================
  const attackerMods = getConditionModifiers(attacker);
  const targetMods = getConditionModifiers(target);

  let hasAdvantage = intent.advantage ?? false;
  let hasDisadvantage = intent.disadvantage ?? false;

  // Global Context Modifiers
  if (attackerMods.hasAdvantageOnAttack) hasAdvantage = true;
  if (attackerMods.hasDisadvantageOnAttack) hasDisadvantage = true;
  if (targetMods.grantAdvantageToAttacker) hasAdvantage = true;
  if (targetMods.grantDisadvantageToAttacker) hasDisadvantage = true;

  // Prone Nuance
  if (hasCondition(target, ConditionType.Prone)) {
    if (action.type === 'melee' || action.type === 'melee_attack') {
      hasAdvantage = true;
    } else if (action.type === 'ranged' || action.type === 'ranged_attack') {
      hasDisadvantage = true;
    }
  }

  const ctx: CombatContext = {
    hasAdvantage,
    hasDisadvantage,
    isCritical: false, // determined later
    target,
    // allyAdjacent: false // TODO: SOTA V2 Map Integration
  };

  // ===========================================================================
  // 2. Roll to Hit
  // ===========================================================================

  let rollRes: DiceResult;
  if (hasAdvantage && !hasDisadvantage) {
    const r1 = roll({ count: 1, sides: 20, bonus: action.toHit }, rng);
    const r2 = roll({ count: 1, sides: 20, bonus: action.toHit }, rng);
    rollRes = r1.total >= r2.total ? r1 : r2;
  } else if (hasDisadvantage && !hasAdvantage) {
    const r1 = roll({ count: 1, sides: 20, bonus: action.toHit }, rng);
    const r2 = roll({ count: 1, sides: 20, bonus: action.toHit }, rng);
    rollRes = r1.total <= r2.total ? r1 : r2;
  } else {
    rollRes = roll({ count: 1, sides: 20, bonus: action.toHit }, rng);
  }

  const natural = rollRes.rolls[0];
  const totalHit = rollRes.total;

  // Auto Crit logic
  const isAutoCrit =
    (targetMods.autoCritReceived ?? false) && (action.type === 'melee' || action.type === 'melee_attack');
  const isCritical = natural === 20 || isAutoCrit;
  const isCriticalFail = natural === 1;

  ctx.isCritical = isCritical;

  // Determine Hit
  const targetAC = target.armorClass || 10;
  const hit = isCritical || (!isCriticalFail && totalHit >= targetAC);

  const attackRollStep: ExecutionStep = {
    type: 'roll_to_hit',
    description: `Attack Roll (${action.name})`,
    base: natural,
    modifiers: [{ source: 'To Hit Bonus', value: action.toHit || 0 }],
    total: totalHit,
    diceNotation: '1d20',
    rolls: rollRes.rolls,
    outcome: hit ? (isCritical ? 'Critical Hit' : 'Hit') : isCriticalFail ? 'Critical Miss' : 'Miss',
    targetValue: targetAC,
  };
  if (hasAdvantage) attackRollStep.modifiers?.push({ source: 'Advantage', value: 0 });
  if (hasDisadvantage) attackRollStep.modifiers?.push({ source: 'Disadvantage', value: 0 });
  trace.push(attackRollStep);

  // ===========================================================================
  // 3. Resolve Damage (SRO Pipeline)
  // ===========================================================================
  const damageDetails = [];
  let totalDamage = 0;

  if (hit) {
    // A. Base Action Damage
    if (action.damage) {
      for (const d of action.damage) {
        // Parse dice
        const def = parseDiceString(d.dice);
        if (isCritical) def.count *= 2;

        // Roll
        const dmgRoll = roll({ ...def, bonus: d.bonus }, rng);
        // We create a temporary bonus variable if features add flat damage to this specific type?
        // SRO Architecture: DamageInstance handles the 'Type' logic against the Target.

        // Resolve against target using DamageInstance
        const instance = new DamageInstance(dmgRoll.total, d.type as DamageType, action.name);
        const { finalAmount, logic } = instance.resolveAgainst(target);

        totalDamage += finalAmount;
        damageDetails.push({
          type: d.type,
          total: finalAmount,
          diceRolls: dmgRoll.rolls,
          bonus: d.bonus,
          diceString: isCritical ? `${def.count}d${def.sides}+${d.bonus}` : `${d.dice}+${d.bonus}`,
        });

        // Trace Logic from SRO
        if (logic.length > 0) {
          trace.push({
            type: 'modifier',
            description: `Defense Interaction (${d.type})`,
            total: 0,
            outcome: logic.join(', '),
          });
        }
      }
    }

    // B. Feature Injections (Plugin System)
    // Iterate over Attacker's Features and see if any handlers apply
    if (attacker.features) {
      for (const feat of attacker.features) {
        const handler = FeatureRegistry.get(feat.name);
        // Cast explicit to avoid any, assuming ActionDefinition is compatible with EntityAction runtime
        if (handler && handler.canApply(attacker, action as unknown as EntityAction, ctx)) {
          // Apply Damage Bonus
          if (handler.applyDamageBonus) {
            const bonus = handler.applyDamageBonus(attacker, ctx);

            let rollTotal = bonus.amount;
            let rolls: number[] = [];

            if (bonus.dice && bonus.dice !== '0') {
              const def = parseDiceString(bonus.dice);
              if (isCritical) def.count *= 2;
              const res = roll(def, rng);
              rollTotal += res.total;
              rolls = res.rolls;
            }

            // Resolve SRO
            const instance = new DamageInstance(rollTotal, bonus.type as DamageType, feat.name);
            const { finalAmount, logic } = instance.resolveAgainst(target);

            totalDamage += finalAmount;
            damageDetails.push({
              type: bonus.type,
              total: finalAmount,
              diceRolls: rolls,
              bonus: bonus.amount,
              diceString: bonus.dice,
            });

            trace.push({
              type: 'feature_trigger',
              description: `Feature: ${feat.name}`,
              total: finalAmount,
              outcome: logic.length > 0 ? `Applied (${logic.join(', ')})` : 'Applied',
            });
          }
        }
      }
    }
  }

  return {
    hit,
    isCritical,
    isCriticalFail,
    attackRoll: rollRes,
    damageTotal: totalDamage,
    damageDetails,
    verdict: isCritical ? 'Critical Hit!' : hit ? 'Hit' : isCriticalFail ? 'Critical Miss!' : 'Miss',
    trace,
  };
}
// ... imports ...

export interface GrappleResult {
  success: boolean;
  attackerRoll: { total: number; modifier: number; roll: number };
  targetRoll: { total: number; modifier: number; roll: number; skillUsed: string };
  verdict: string;
}

/**
 * Resolves a Grapple attempt (Contested Check).
 */
export function resolveGrapple(attacker: Entity, target: Entity): GrappleResult {
  // 1. Attacker: Athletics
  // Check if exists, else fallback to Str Mod.
  // Attributes fallback to 10 if missing to avoid NaN.
  const strScore = attacker.stats.strength ?? 10;

  // Skills not yet on Entity, fallback to stat override or check sheet for now...
  // Wait, Entity stats are clean. Skills are usually on sheet.
  // For MVP we use raw stat calc.
  const atkModVal = calculateModifier(strScore); // Simplified: Athletics = Str Mod

  const atkRoll = roll({ count: 1, sides: 20, bonus: atkModVal });

  // 2. Target: Best of Athletics or Acrobatics
  // Target Attributes fallback
  const tgtStr = target.stats.strength ?? 10;
  const tgtDex = target.stats.dexterity ?? 10;

  const tgtAth = calculateModifier(tgtStr); // Simplified
  const tgtAcro = calculateModifier(tgtDex);

  const useAth = tgtAth >= tgtAcro;
  const tgtModVal = useAth ? tgtAth : tgtAcro;
  const skillUsed = useAth ? 'Athletics' : 'Acrobatics';

  const tgtRoll = roll({ count: 1, sides: 20, bonus: tgtModVal });

  // 3. Compare
  // Tie goes to status quo? In 5e Grapple, Attacker needs to exceed?
  // PHB: "If you succeed, you subject the target..."
  // Contested checks: If tie, the situation remains the same. Since grapple is a change, Attacker needs to WIN?
  // Actually, standard contested rule: "If the contest results in a tie, the situation remains the same."
  // So: Attacker fails on tie.
  // Let's assume Attacker > Target to change state.

  const success = atkRoll.total > tgtRoll.total;
  // Wait, commonly Ties in contests mean "nothing happens".
  // So Grapple fails.

  return {
    success,
    attackerRoll: { total: atkRoll.total, modifier: atkModVal, roll: atkRoll.rolls[0] },
    targetRoll: { total: tgtRoll.total, modifier: tgtModVal, roll: tgtRoll.rolls[0], skillUsed },
    verdict: success ? 'Grappled!' : 'Failed',
  };
}
