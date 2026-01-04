import { DerivationContext } from './types';

/**
 * Derives movement speeds.
 *
 * Logic:
 * - Base speed from Race
 * - Modifiers can be added (e.g. Monk Unarmored Movement, Mobile feat) - Placeholder for now.
 * - Heavy Armor penalty (if str < str_minimum)
 */
export function deriveSpeed(context: DerivationContext): { walk: number; [key: string]: number } {
  const { race, attributes, equipment } = context;

  let baseSpeed: { walk: number; [key: string]: number } = { walk: 30 };

  if (race?.speed) {
    if (typeof race.speed === 'number') {
      baseSpeed = { walk: race.speed };
    } else {
      // Assuming race.speed object already uses new keys? Or do we need to map?
      // Race schema is "integer" currently (Step 375). So it hits the 'number' block.
      // If race had object speed, it would need to match SpeedSchema.
      // But let's assume it maps directly if object.
      baseSpeed = { ...race.speed } as { walk: number; [key: string]: number };
    }
  }

  // Heavy Armor Penalty
  const armor = equipment.find((item) => item.equipment_category?.slug === 'heavy-armor');

  if (armor && armor.str_minimum && attributes.str < armor.str_minimum) {
    baseSpeed.walk = Math.max(0, baseSpeed.walk - 10);
  }

  return baseSpeed;
}

/**
 * Derives actions from equipment (weapons).
 */
export function deriveActions(context: DerivationContext) {
  const { equipment, attributes, proficiencyBonus } = context;
  const actions: any[] = [];

  equipment.forEach((item) => {
    // Check if item is a weapon
    // Logic: Has damage_dice OR category is weapon
    const isWeapon =
      item.damage_dice ||
      (item.equipment_category && ['weapon', 'simple-weapon', 'martial-weapon'].includes(item.equipment_category.slug));

    if (isWeapon && item.damage_dice) {
      // Determine stat (STR or DEX)
      // Default STR for melee, DEX for ranged/finesse
      let statMod = typeof attributes.str === 'number' ? Math.floor((attributes.str - 10) / 2) : 0;
      let statUsed = 'strength';

      const isRanged = (item.range_normal && item.range_normal > 5) || false;
      const isFinesse = item.properties?.some((p) => p.slug === 'finesse');

      if (isRanged || (isFinesse && attributes.dex > attributes.str)) {
        statMod = typeof attributes.dex === 'number' ? Math.floor((attributes.dex - 10) / 2) : 0;
        statUsed = 'dexterity';
      }

      // Calculate Total Bonus (Stat + Prof if proficient)
      // Assuming proficiency with all equipped weapons for now (simplification)
      const toHit = statMod + proficiencyBonus;
      const damageBonus = statMod; // D&D rules: adds stat mod to damage

      const type = isRanged ? 'ranged' : 'melee';

      actions.push({
        id: `derived-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        type: type,
        description: `Attack with ${item.name}. ${item.range_long ? `Range: ${item.range_normal}/${item.range_long}` : 'Reach: 5ft'}`,
        reach: item.range_normal || 5,
        toHit: toHit,
        damage: [
          {
            dice: item.damage_dice,
            bonus: damageBonus,
            type: item.damage_type?.name || 'slashing',
          },
        ],
      });
    }
  });

  // Default Unarmed Strike if no weapons?
  if (actions.length === 0) {
    const strMod = Math.floor((attributes.str - 10) / 2);
    actions.push({
      id: 'action-unarmed',
      name: 'Unarmed Strike',
      type: 'melee',
      description: 'Punch, kick, or headbutt.',
      reach: 5,
      toHit: strMod + proficiencyBonus,
      damage: [{ dice: '1', bonus: strMod, type: 'bludgeoning' }],
    });
  }

  return actions;
}
