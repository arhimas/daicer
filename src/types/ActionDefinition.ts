/**
 * The Runtime Action Definition
 * This interface represents any action (Spell, Weapon, Feature) in a unified way
 * for the Game Engine to consume.
 */

/**
 * The Runtime Action Definition.
 *
 * This interface represents any action (Spell, Weapon, Feature) in a unified,
 * machine-readable way for the Game Engine to consume. It abstracts the source
 * (e.g., whether it came from a Spell or Item) and provides raw mechanical constants.
 */

export interface ActionDefinition {
  /** Unique runtime identifier (e.g. "spell_fireball", "item_longsword_attack_01") */
  id: string;

  /** Display Name shown in UI and logs */
  name: string;

  /** Origin of the action for traceability */
  sourceType: 'spell' | 'weapon' | 'feature' | 'item' | 'monster_action';

  /** Document ID of the source entity (Strapi ID) */
  sourceId: string;

  /** Markdown description */
  description?: string;

  /** Icon path or URL */
  img?: string;

  /** Cost to execute this action */
  cost?: {
    type: 'slot' | 'charge' | 'ammo' | 'action_economy' | 'cooldown';
    resourceId?: string; // e.g. "spell_slots_level_3", "ammo_arrow"
    amount: number;
    actionType: 'start_turn' | 'action' | 'bonus' | 'reaction' | 'legendary' | 'lair' | 'none';
  };

  /** Targeting Rules */
  range: {
    type: 'melee' | 'ranged' | 'self' | 'sight' | 'touch' | 'unlimited';
    value?: number; // Distance in feet
    reach?: number; // Reach in feet (default 5)
  };

  /** Area of Effect (if applicable) */
  aoe?: {
    shape: 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder' | 'hemisphere';
    size: number; // Radius or Length
    height?: number; // For Cylinder
  };

  /** Attack Roll Configuration */
  attack?: {
    type: 'melee_weapon' | 'ranged_weapon' | 'melee_spell' | 'ranged_spell' | 'auto_hit';
    bonus: number; // To Hit Bonus
    critRange?: number; // Default 20
  };

  /** Saving Throw Configuration */
  save?: {
    attribute: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    dc: number;
    effect: 'negate' | 'half' | 'none';
  };

  /** Effects applied on Hit/Failure */
  effects: Array<{
    type: 'damage' | 'healing' | 'apply_condition';
    subtype?: string; // Damage Type (Fire) or Condition (Stunned)
    dice?: string; // "8d6"
    flat?: number;
    paramAttribute?: string; // "spellcasting_mod", "str", "dex"
    timing: 'instant' | 'start_turn' | 'end_turn' | 'one_time';
    chance?: number; // 1-100
    duration?: number; // Rounds (for conditions)
  }>;

  /** Usage Limits (e.g. "1/Day") */
  usage?: {
    current: number;
    max: number;
    per: 'short_rest' | 'long_rest' | 'day' | 'dawn' | 'dusk' | 'never';
  };
}
