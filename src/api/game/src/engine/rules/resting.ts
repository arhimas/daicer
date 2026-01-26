import { z } from 'zod';
import { EntitySheetSchema } from '../schemas/entity-sheet';
/**
 * Resting Mechanics (Short & Long).
 * Handles Resource Recovery, HP Healing, and Hit Dice Logic.
 */
import { rollDie } from './dice';
import { calculateModifier } from './dnd5e';

type EntitySheet = z.infer<typeof EntitySheetSchema>;

export interface RestResult {
  hpHealed: number;
  hitDiceSpent: number;
  hitDiceRecovered: number;
  resourcesRecovered: string[]; // Names of resources/features/slots
  newHp: number;
  newHitDice: number;
}

/**
 * Performs a Short Rest.
 * Allows spending Hit Dice to heal.
 * Resets "short-rest" resources.
 * 
 * @param sheet - The entity sheet to mutate.
 * @param hitDiceToSpend - Number of hit dice to spend.
 * @returns RestResult describing changes.
 */
export function shortRest(sheet: EntitySheet, hitDiceToSpend: number): RestResult {
  let hpHealed = 0;
  let hitDiceSpent = 0;

  // 1. Spend Hit Dice
  const conScore = sheet.attributes.Constitution ?? 10;
  const conMod = calculateModifier(conScore);

  let currentHitDice = sheet.hitDice.current;

  // Dice Parsing: "1d8" -> sides=8
  const hitDieStr = sheet.hitDice.die || '1d8'; // Default fallback
  const sides = parseInt(hitDieStr.replace(/[^0-9]/g, ''), 10) || 8;

  for (let i = 0; i < hitDiceToSpend; i++) {
    if (currentHitDice > 0) {
      const rollVal = rollDie(sides);
      const heal = Math.max(0, rollVal + conMod); // Min 0 heal
      hpHealed += heal;
      currentHitDice--;
      hitDiceSpent++;
    }
  }

  // Cap HP
  const newHp = Math.min(sheet.maxHp, sheet.hp + hpHealed);

  // 2. Reset Resources (Short Rest)
  const recoveredList: string[] = [];

  // Apply State Changes (Mutation)
  sheet.hp = newHp;
  sheet.hitDice.current = currentHitDice;

  // Reset Features
  if (Array.isArray(sheet.features)) {
    sheet.features.forEach((f) => {
      if (f.usage && (f.usage.per === 'short_rest' || f.usage.per === 'short')) {
        f.usage.current = f.usage.max; // Reset
        recoveredList.push(f.name);
      }
    });
  }

  // Reset Resources (Generic Pools)
  if (sheet.resources) {
      sheet.resources.forEach((r) => {
        if (r.refresh === 'short-rest') {
          r.current = r.max;
          recoveredList.push(r.name);
        }
      });
  }

  // MVP: Skipping complex Warlock slot logic until strict Class definitions are available.

  return {
    hpHealed,
    hitDiceSpent,
    hitDiceRecovered: 0,
    resourcesRecovered: recoveredList,
    newHp,
    newHitDice: currentHitDice,
  };
}

/**
 * Performs a Long Rest.
 * Full Heal, Reset All Slots, Recover 1/2 Hit Dice.
 */
export function longRest(sheet: EntitySheet): RestResult {
  const hpHealed = sheet.maxHp - sheet.hp;

  // 1. Recover HP
  sheet.hp = sheet.maxHp;

  // 2. Recover Hit Dice (Half Max, flow)
  const maxHitDice = sheet.hitDice.total;
  const recoverAmount = Math.max(1, Math.floor(maxHitDice / 2));
  const oldHitDice = sheet.hitDice.current;
  sheet.hitDice.current = Math.min(maxHitDice, oldHitDice + recoverAmount);

  const hitDiceRecovered = sheet.hitDice.current - oldHitDice;

  // 3. Reset All Resources
  const recoveredList: string[] = ['HP', 'Hit Dice'];

  // Spell Slots
  if (sheet.spellbook && sheet.spellbook.slots) {
    sheet.spellbook.slots.forEach((s) => {
      s.current = s.max; // All slots back
    });
    recoveredList.push('Spell Slots');
  }

  // Features
  if (Array.isArray(sheet.features)) {
    sheet.features.forEach((f) => {
      if (f.usage) {
        // Long rest resets Short AND Long rest features usually?
        // Yes, Long Rest resets everything.
        f.usage.current = f.usage.max;
        recoveredList.push(f.name);
      }
    });
  }

  // Generic Resources
  sheet.resources.forEach((r) => {
    // Refresh checks? 'daily', 'long-rest'
    if (['long-rest', 'daily', 'short-rest'].includes(r.refresh)) {
      r.current = r.max;
      recoveredList.push(r.name);
    }
  });

  return {
    hpHealed,
    hitDiceSpent: 0,
    hitDiceRecovered,
    resourcesRecovered: recoveredList,
    newHp: sheet.hp,
    newHitDice: sheet.hitDice.current,
  };
}
