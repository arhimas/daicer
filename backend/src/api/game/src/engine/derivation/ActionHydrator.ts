import { ActionDefinition } from '..'; // Keep for input types if needed, or remove if unused
import { RuntimeAction } from './types';
import { DerivationContext } from './types';
import { calculateModifier } from './attributes';

export class ActionHydrator {
  /**
   * Hydrate Actions from Equipment (Weapons)
   */
  static hydrateFromEquipment(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any,
    context: DerivationContext
  ): RuntimeAction[] {
    const actions: RuntimeAction[] = [];

    // Check if it's a weapon or has damage dice
    const isWeapon =
      item.damage_dice ||
      (item.equipment_category && ['weapon', 'simple-weapon', 'martial-weapon'].includes(item.equipment_category.slug));

    if (!isWeapon) return actions;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes = (context.attributes || context.stats || {}) as any;
    const profBonus = context.proficiencyBonus || 2;
    const str = attributes.strength ?? 10;
    const dex = attributes.dexterity ?? 10;

    // Finesse / Ranged Logic
    let statUsed = 'str';
    let mod = calculateModifier(str);

    const isRanged = (item.range_normal && item.range_normal > 5) || false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isFinesse = item.properties?.some((p: any) => p.slug === 'finesse');

    if (isRanged || (isFinesse && calculateModifier(dex) > mod)) {
      statUsed = 'dex';
      mod = calculateModifier(dex);
    }

    const toHit = mod + profBonus; // Assuming proficiency
    const damageBonus = mod; // Standard 5e

    const mainAction: RuntimeAction = {
      id: `weapon_${item.documentId || item.id}`,
      name: item.name,
      sourceType: 'weapon',
      sourceId: item.documentId || item.id,
      description: item.description || `Attack with ${item.name}`,
      img: item.image?.url,

      cost: {
        type: 'action_economy',
        amount: 1,
        actionType: 'action',
      },

      range: {
        type: isRanged ? 'ranged' : 'melee',
        value: item.range_normal || 5,
      },

      attack: {
        type: isRanged ? 'ranged_weapon' : 'melee_weapon',
        bonus: toHit,
        critRange: 20,
      },

      effects: [
        {
          type: 'damage',
          subtype: item.damage_type?.name || 'Slashing',
          dice: item.damage_dice || '1d4',
          flat: damageBonus,
          paramAttribute: statUsed,
          timing: 'instant',
        },
      ],
    };

    actions.push(mainAction);

    // Versatile handling
    if (item.versatile_damage) {
      actions.push({
        ...mainAction,
        id: `weapon_${item.documentId || item.id}_versatile`,
        name: `${item.name} (Two-Handed)`,
        effects: [
          {
            type: 'damage',
            subtype: item.damage_type?.name || 'Slashing',
            dice: item.versatile_damage,
            flat: damageBonus,
            paramAttribute: statUsed,
            timing: 'instant',
          },
        ],
      });
    }

    return actions;
  }

  /**
   * Hydrate Actions from Spells
   */
  static hydrateFromSpell(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spell: any,
    context: DerivationContext
  ): RuntimeAction {
    const attributes = context.attributes || context.stats || {};
    const profBonus = context.proficiencyBonus || 2;
    // Default to Int if not specified (should be passed in context based on class)
    const castStat = context.spellcastingAbility || 'intelligence';
    const mod = calculateModifier(attributes[castStat] || 10);
    const spellAttackBonus = mod + profBonus;
    const saveDC = 8 + mod + profBonus;

    const definitions = spell.mechanics_config || {};
    const damage = spell.damage_instances || [];
    const casting = spell.casting_config || {};
    const range = spell.range_config || {};

    // Map Action Type
    let attackConfig: RuntimeAction['attack'] | undefined;
    if (definitions.action_type?.includes('Attack')) {
      attackConfig = {
        type: definitions.action_type.includes('Melee') ? 'melee_spell' : 'ranged_spell',
        bonus: spellAttackBonus,
      };
    }

    // Map Save Config
    let saveConfig: RuntimeAction['save'] | undefined;
    if (definitions.action_type?.includes('Save')) {
      const saveAttr = definitions.action_type.split(' ')[0].toLowerCase().slice(0, 3); // "Dexterity" -> "dex"
      saveConfig = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attribute: saveAttr as any,
        dc: saveDC,
        effect: definitions.save_effect?.toLowerCase() || 'none',
      };
    }

    // Map Effects
    const effects: RuntimeAction['effects'] = [];

    // Damage Effects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    damage.forEach((d: any) => {
      effects.push({
        type: d.effect_type === 'Healing' ? 'healing' : 'damage',
        subtype: d.damage_type,
        dice: `${d.dice_count}d${d.dice_value}`,
        flat: d.flat_bonus || 0,
        timing: d.timing?.toLowerCase() || 'instant',
      });
    });

    // Condition Effects
    if (spell.condition_instances) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spell.condition_instances.forEach((c: any) => {
        effects.push({
          type: 'apply_condition',
          subtype: c.condition,
          timing: 'instant', // Conditions are usually applied instantly on fail
          duration: c.duration_rounds,
          chance: c.chance,
        });
      });
    }

    const action: RuntimeAction = {
      id: `spell_${spell.documentId || spell.id}`,
      name: spell.name,
      sourceType: 'spell',
      sourceId: spell.documentId || spell.id,
      description: spell.description ? JSON.stringify(spell.description) : 'Spell', // Flatten rich text if needed or handle in UI
      img: spell.image?.url,

      cost: {
        type: 'slot',
        amount: spell.level,
        resourceId: `spell_slots_level_${spell.level}`,
        actionType:
          casting.time_unit?.toLowerCase() === 'bonus action'
            ? 'bonus'
            : casting.time_unit?.toLowerCase() === 'reaction'
              ? 'reaction'
              : 'action',
      },

      range: {
        type: range.type?.toLowerCase().includes('ranged')
          ? 'ranged'
          : range.type?.toLowerCase().includes('touch')
            ? 'touch'
            : 'self',
        value: range.distance,
      },

      aoe: range.aoe_shape
        ? {
            shape: range.aoe_shape.toLowerCase(),
            size: range.aoe_size,
            height: range.aoe_height,
          }
        : undefined,

      attack: attackConfig,
      save: saveConfig,
      effects: effects,
    };

    return action;
  }
}
