import { RuntimeAction, DerivationContext } from '@daicer/engine/derivation/types';
import { calculateModifier } from '@daicer/engine/derivation/attributes';

// Define DB Shapes (Stubbing them here to avoid any, ideally these come from Codegen/Strapi types)
interface SerializedProperty {
  slug: string;
  name?: string;
}

export interface SerializedDamage {
  effect_type: string; // 'Damage' | 'Healing'
  damage_type: string;
  dice_count: number;
  dice_value: number;
  flat_bonus?: number;
  timing?: string;
}

interface SerializedReference {
  documentId?: string;
  id?: number | string;
  slug?: string;
  name?: string;
}

export interface SerializedItem {
  documentId?: string;
  id?: number | string;
  name: string;
  description?: string;
  slug?: string;
  type?: string; // 'weapon', etc
  image?: { url: string };

  // Weapon specifics
  damage_dice?: string;
  versatile_damage?: string;
  damage_type?: { name: string };
  range_normal?: number;
  range_long?: number;

  equipment_category?: SerializedReference;
  properties?: SerializedProperty[];

  // Engine Utils
  isEquipped?: boolean;
  armor_class_base?: number;
  armor_class_dex_bonus?: boolean;
  str_minimum?: number;
  stealth_disadvantage?: boolean;
}

export interface SerializedSpell {
  documentId?: string;
  id?: number | string;
  name: string;
  slug?: string;
  level?: number;
  school?: string; // Relation or string? Based on compiler, looks like string/relation check might be needed
  description?: unknown; // Rich text often JSON
  image?: { url: string };

  mechanics_config?: {
    action_type?: string; // "Melee Weapon Attack", "Dexterity Save", etc.
    save_effect?: string;
  };

  casting_config?: {
    time_unit?: string;
    components?: string[];
    concentration?: boolean;
  };

  range_config?: {
    type?: string;
    distance?: number;
    aoe_shape?: string;
    aoe_size?: number;
    aoe_height?: number;
  };

  damage_instances?: SerializedDamage[];
  condition_instances?: Array<{
    condition: string;
    duration_rounds?: number;
    chance?: number;
  }>;
}

export class ActionHydrator {
  /**
   * Hydrates a raw Item (Weapon) into a usable RuntimeAction.
   * Calculates attack bonuses, damage dice + modifiers based on wielder's stats.
   *
   * @param item - The serialized Item/Equipment data.
   * @param context - The wielder's context (stats, proficiency).
   * @returns Array of RuntimeActions (e.g. "Longsword", "Longsword (Two-Handed)").
   */
  static hydrateFromEquipment(item: SerializedItem, context: DerivationContext): RuntimeAction[] {
    const actions: RuntimeAction[] = [];

    // Check if it's a weapon or has damage dice
    const isWeapon =
      !!item.damage_dice ||
      (item.equipment_category &&
        ['weapon', 'simple-weapon', 'martial-weapon'].includes(item.equipment_category.slug || ''));

    if (!isWeapon) return actions;

    const attributes = context.attributes || context.stats;
    const profBonus = context.proficiencyBonus || 2;
    const str = attributes.strength ?? 10;
    const dex = attributes.dexterity ?? 10;

    // Finesse / Ranged Logic
    let mod = calculateModifier(str);
    let attrKey = 'str'; // for paramAttribute string

    const isRanged = (item.range_normal && item.range_normal > 5) || false;
    const isFinesse = item.properties?.some((p) => p.slug === 'finesse') || false;

    if (isRanged || (isFinesse && calculateModifier(dex) > mod)) {
      attrKey = 'dex';
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
          paramAttribute: attrKey,
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
            paramAttribute: attrKey,
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
  static hydrateFromSpell(spell: SerializedSpell, context: DerivationContext): RuntimeAction {
    const attributes = context.attributes || context.stats;
    const profBonus = context.proficiencyBonus || 2;
    // Default to Int if not specified (should be passed in context based on class)
    // Default to Int if not specified (should be passed in context based on class)
    const castStat = (context.spellcastingAbility || 'intelligence').toLowerCase();
    const attrs = attributes as unknown as Record<string, number>;
    const castScore = Number(attrs[castStat]) || 10;

    const mod = calculateModifier(castScore);
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
        attribute: saveAttr as 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha',
        dc: saveDC,
        effect: (definitions.save_effect?.toLowerCase() || 'none') as 'none' | 'half' | 'negate',
      };
    }

    // Map Effects
    const effects: RuntimeAction['effects'] = [];

    // Damage Effects
    damage.forEach((d) => {
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
      spell.condition_instances.forEach((c) => {
        effects.push({
          type: 'apply_condition',
          subtype: c.condition,
          timing: 'instant', // Conditions are usually applied instantly on fail
          duration: c.duration_rounds || 1,
          chance: c.chance || 100,
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
        value: range.distance || 0,
      },

      aoe: range.aoe_shape
        ? {
            shape: range.aoe_shape.toLowerCase() as 'sphere' | 'cone' | 'cube' | 'line' | 'cylinder',
            size: range.aoe_size || 0,
            height: range.aoe_height,
          }
        : undefined,

      attack: attackConfig,
      save: saveConfig,
      effects: effects,

      level: spell.level,
      concentration: casting.concentration, // Assuming DB has this field in casting_config
      // Construct original range string for legacy compatibility or UI
      originalRange: range.type === 'ranged' ? `${range.distance} ft` : range.type,
    };

    return action;
  }
}
