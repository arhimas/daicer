import { calculateModifier } from '@daicer/engine/derivation/attributes';
import { DerivationContext } from '@daicer/engine/derivation/types';

/**
 * Calculates Armor Class (AC) based on 5e rules.
 *
 * Rules:
 * - Unarmored: 10 + Dex Mod
 * - Light Armor: Base + Dex Mod
 * - Medium Armor: Base + Dex Mod (max 2)
 * - Heavy Armor: Base
 * - Shield: +2
 * - Monk/Barbarian Unarmored Defense: Handled if class features provided (future scope)
 */
export function calculateAC(context: DerivationContext): number {
  const { attributes, equipment } = context;
  const dexMod = calculateModifier(attributes.dexterity); // Was dex

  // Find equipped armor and shield
  // Assuming 'equipment' list contains equipped items.
  // In a real app, might need { isEquipped: boolean } field if inspecting full inventory.

  const armor = equipment.find(
    (item) =>
      item.equipment_category?.slug === 'armor' ||
      item.equipment_category?.slug === 'heavy-armor' ||
      item.equipment_category?.slug === 'medium-armor' ||
      item.equipment_category?.slug === 'light-armor'
  );

  const shield = equipment.find((item) => item.equipment_category?.slug === 'shield');

  let ac = 0;

  if (armor) {
    const baseAC = armor.armor_class_base || 10;
    const category = armor.equipment_category?.slug;

    if (category === 'heavy-armor') {
      ac = baseAC;
    } else if (category === 'medium-armor') {
      ac = baseAC + Math.min(dexMod, 2);
    } else {
      // Light Armor or generic armor with dex bonus
      if (armor.armor_class_dex_bonus) {
        ac = baseAC + dexMod;
      } else {
        // Fallback for undefined category but has base AC
        ac = baseAC + dexMod;
      }
    }
  } else {
    // Unarmored
    ac = 10 + dexMod;
  }

  // Add Shield
  if (shield) {
    const shieldBonus = shield.armor_class_base || 2;
    ac += shieldBonus;
  }

  return ac;
}

/**
 * Calculates max Hit Points (HP).
 *
 * Formula:
 * - Level 1: Max Hit Die + Con Mod
 * - Level > 1: (Avg Hit Die + Con Mod) * (Level - 1)
 *
 * Avg Hit Die = (Die / 2) + 1
 */
export function calculateHP(context: DerivationContext): number {
  const { attributes, hitDie } = context;
  const level = context.level || 1;
  const conMod = calculateModifier(attributes.constitution); // Was con

  if (!hitDie) {
    // Fallback if no hit die provided (e.g. simple monster or error)
    return 10 + conMod * level;
  }

  // Parse "1d8" or "d8" or just "8"
  let maxHitDie = 8;
  if (typeof hitDie === 'number') {
    maxHitDie = hitDie;
  } else {
    const parts = hitDie.split('d');
    maxHitDie = parseInt(parts[parts.length - 1]);
    if (isNaN(maxHitDie)) maxHitDie = 8;
  }

  const avgHitDie = maxHitDie / 2 + 1;

  if (level === 1) {
    return maxHitDie + conMod;
  }

  const level1HP = maxHitDie + conMod;
  const subsequentLevelsHP = (avgHitDie + conMod) * (level - 1);

  return Math.floor(level1HP + subsequentLevelsHP);
}
