import { calculateModifier } from './attributes';
import { calculateAC, calculateHP } from './defenses';
import { deriveSpeed, deriveActions } from './capabilities';
import { calculateSkillBonus, calculateProficiencyBonus } from './skills';
import { DerivationContext } from './types';

export * from './attributes';
export * from './defenses';
export * from './capabilities';
export * from './skills';
export * from './types';

export class EntityDeriver {
  static calculateModifier = calculateModifier;
  static calculateProficiencyBonus = calculateProficiencyBonus;

  /**
   * Derives all dependent stats from the context.
   */
  static derive(context: DerivationContext | any) {
    // 0. Normalize Attributes (Handle mismatch between Schema 'str' and Logic 'strength')
    if (context.attributes) {
      const map: Record<string, string> = {
        str: 'strength',
        Str: 'strength',
        Strength: 'strength',
        dex: 'dexterity',
        Dex: 'dexterity',
        Dexterity: 'dexterity',
        con: 'constitution',
        Con: 'constitution',
        Constitution: 'constitution',
        int: 'intelligence',
        Int: 'intelligence',
        Intelligence: 'intelligence',
        wis: 'wisdom',
        Wis: 'wisdom',
        Wisdom: 'wisdom',
        cha: 'charisma',
        Cha: 'charisma',
        Charisma: 'charisma',
      };
      const newAttrs: any = {};
      for (const [k, v] of Object.entries(context.attributes)) {
        if (map[k]) newAttrs[map[k]] = v;
        else newAttrs[k] = v; // Preserve others
      }
      // Ensure we fill in missing with defaults or fallback if creating from partial
      context = { ...context, attributes: newAttrs };
    }

    // 1. Resolve Level & Proficiency Bonus
    let totalLevel = 1;

    const isMonster = context.isMonster || (context as any).type === 'monster';

    if (isMonster && context.level) {
      totalLevel = context.level;
    } else if (context.classes && context.classes.length > 0) {
      totalLevel = context.classes.reduce((sum: number, c: any) => sum + c.level, 0);
    } else if (context.level) {
      totalLevel = context.level;
    }

    // console.log(`DEBUG: derive level`, { isMonster, classes: context.classes?.length, level: context.level, totalLevel });

    // Default PB calculation if not explicitly provided
    // (This allows backend to inject custom PB if needed, but Engine defaults to rules)
    if (context.proficiencyBonus === undefined) {
      context.proficiencyBonus = calculateProficiencyBonus(totalLevel);
    }

    // 2. Perform Derivations
    let ac = calculateAC(context);
    let hp = calculateHP(context);
    let speed = deriveSpeed(context);

    // Override with raw values if provided (especially for Monsters)
    if (context.ac !== undefined) ac = context.ac;
    if (context.maxHp !== undefined) hp = context.maxHp;
    else if (context.hp !== undefined) hp = context.hp; // Fallback to hp if maxHp undefined

    if (context.speed !== undefined) {
      if (typeof context.speed === 'number') {
        speed = { walk: context.speed };
      } else {
        speed = { ...(context.speed as any) };
      }
    }

    // Ensure innate actions are passed correctly
    const effectiveContext = {
      ...context,
      innateActions: context.innateActions || context.actions || [],
    };

    const actions = this.deriveActions(effectiveContext);

    // We can also derive passive perception, etc.
    const passivePerception =
      10 +
      calculateSkillBonus(
        'perception',
        // Need to know if proficient. For now assuming 0 if not passed in context.
        // Ideally context should have 'skills' map.
        0,
        context.attributes,
        context.proficiencyBonus
      );

    return {
      ...context, // Preserve original data (name, id, etc.)
      ...context.attributes, // Flattens attributes if needed, but usually we want 'stats' key
      stats: context.attributes, // Ensure 'stats' key is populated for EntitySheet compatibility
      ac,
      hp,
      maxHp: hp,
      speed,
      passivePerception,
      structuredActions: actions,
      actions: actions, // Alias for backward compatibility
      proficiencyBonus: context.proficiencyBonus,
      level: totalLevel,
    };
  }

  static deriveActions = deriveActions; // Static alias for direct usage

  // TODO: Implement 'create' and 'levelUp' workflows as higher level abstractions
  // if they involve more than just stat calculation (e.g. choice validation).
}
