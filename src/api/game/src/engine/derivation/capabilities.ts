import { RuntimeAction } from './types';
import { DerivationContext } from './types';
import { ActionHydrator } from './ActionHydrator';

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
  const actions: RuntimeAction[] = [];

  // 1. Process Innate Actions (from blueprints/JSONs) first
  if (innateActions && Array.isArray(innateActions)) {
    // TODO: Hydrate these if they follow the new schema
    actions.push(...innateActions);
  }

  // 2. Derive Weapon Actions from Equipment via Hydrator
  if (equipment) {
    equipment.forEach((item) => {
      // Skip unequipped items
      if (!item.isEquipped) return; // Handle both flag styles

      const hydrated = ActionHydrator.hydrateFromEquipment(item, context);
      actions.push(...hydrated);
    });
  }

  // 3. Derive Spells (if present in context)
  // Context needs to pass 'activeSpells' or similar
  const spells = context.spells || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spells.forEach((spell: any) => {
    const hydrated = ActionHydrator.hydrateFromSpell(spell, context);
    actions.push(hydrated);
  });

  // Default Unarmed Strike if no actions at all
  if (actions.length === 0) {
    // Keep Unarmed fallback for now
    const str = attributes.strength ?? 10;
    const strMod = Math.floor((str - 10) / 2);
    actions.push({
      id: 'action-unarmed',
      name: 'Unarmed Strike',
      sourceType: 'feature',
      sourceId: 'system_unarmed',
      cost: { type: 'action_economy', amount: 1, actionType: 'action' },
      range: { type: 'melee', value: 5, reach: 5 },
      description: 'Punch, kick, or headbutt.',
      attack: {
        type: 'melee_weapon',
        bonus: strMod + (proficiencyBonus || 2),
      },
      effects: [
        {
          type: 'damage',
          subtype: 'bludgeoning',
          dice: '1',
          flat: strMod,
          timing: 'instant',
        },
      ],
    });
  }

  return actions;
}
