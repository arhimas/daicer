import { DerivationContext } from './types';

/**
 * Derives movement speeds.
 *
 * Logic:
 * - Base speed from Race
 * - Modifiers can be added (e.g. Monk Unarmored Movement, Mobile feat) - Placeholder for now.
 * - Heavy Armor penalty (if str < str_minimum)
 */
// ... (deriveSpeed)
export function deriveSpeed(context: DerivationContext): { walk: number; [key: string]: number } {
  const { race, attributes, equipment } = context;

  let baseSpeed: { walk: number; [key: string]: number } = { walk: 30 };

  if (race?.speed) {
    if (typeof race.speed === 'number') {
      baseSpeed = { walk: race.speed };
    } else {
      baseSpeed = { ...race.speed } as { walk: number; [key: string]: number };
    }
  }

  // Heavy Armor Penalty
  const armor = equipment.find((item) => item.equipment_category?.slug === 'heavy-armor');

  if (armor && armor.str_minimum && attributes.strength < armor.str_minimum) {
    baseSpeed.walk = Math.max(0, baseSpeed.walk - 10);
  }

  return baseSpeed;
}

/**
 * Derives actions from equipment (weapons) and merges with innate actions.
 */
export function deriveActions(context: DerivationContext) {
  const { equipment, attributes, proficiencyBonus, innateActions } = context;
  const actions: any[] = [];

  // 1. Process Innate Actions (from blueprints/JSONs) first
  if (innateActions && Array.isArray(innateActions)) {
    actions.push(...innateActions);
  }

  // 2. Derive Weapon Actions from Equipment
  equipment.forEach((item) => {
    // Skip unequipped items
    // Shared schema uses 'isEquipped'
    if (!item.isEquipped) return;

    // Check if item is a weapon
    // Logic: Has damage_dice OR category is weapon
    const isWeapon =
      item.damage_dice ||
      (item.equipment_category && ['weapon', 'simple-weapon', 'martial-weapon'].includes(item.equipment_category.slug));

    if (isWeapon && item.damage_dice) {
      // Determine stat (Strength or Dexterity)
      // Standardize logic on full property names
      const str = attributes.strength ?? 10;
      const dex = attributes.dexterity ?? 10;

      let statMod = Math.floor((str - 10) / 2);
      let statUsed = 'strength';

      const isRanged = (item.range_normal && item.range_normal > 5) || false;
      const isFinesse = item.properties?.some((p) => p.slug === 'finesse');

      if (isRanged || (isFinesse && dex > str)) {
        statMod = Math.floor((dex - 10) / 2);
        statUsed = 'dexterity';
      }

      // Calculate Total Bonus (Stat + Prof if proficient)
      // Assuming proficiency with all equipped weapons for now (simplification)
      const toHit = statMod + (proficiencyBonus || 2);
      const damageBonus = statMod; // D&D rules: adds stat mod to damage

      const type = isRanged ? 'ranged' : 'melee';

      actions.push({
        id: `derived-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        type: type,
        description: `Attack with ${item.name}. ${item.range_long ? `Range: ${item.range_normal}/${item.range_long}` : 'Reach: 5ft'}`,
        reach: item.range_normal || 5,
        range: item.range_long ? `${item.range_normal}/${item.range_long}` : undefined,
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

  // Default Unarmed Strike if no actions at all
  if (actions.length === 0) {
    const str = attributes.strength ?? 10;
    const strMod = Math.floor((str - 10) / 2);
    actions.push({
      id: 'action-unarmed',
      name: 'Unarmed Strike',
      type: 'melee',
      description: 'Punch, kick, or headbutt.',
      reach: 5,
      toHit: strMod + (proficiencyBonus || 2),
      damage: [{ dice: '1', bonus: strMod, type: 'bludgeoning' }],
    });
  }

  return actions;
}
