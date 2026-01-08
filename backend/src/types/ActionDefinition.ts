/**
 * The Runtime Action Definition
 * This interface represents any action (Spell, Weapon, Feature) in a unified way
 * for the Game Engine to consume.
 */

export interface ActionDefinition {
  id: string; // Unique ID (e.g. "spell_fireball", "item_longsword_attack")
  name: string; // Display Name
  sourceType: 'spell' | 'weapon' | 'feature' | 'item' | 'monster_action';
  sourceId: string; // Document ID of the source entity
  description?: string;
  img?: string;

  // Cost Configuration
  cost?: {
    type: 'slot' | 'charge' | 'ammo' | 'action_economy' | 'cooldown';
    resourceId?: string; // e.g. "spell_slots_level_3", "ammo_arrow"
    amount: number;
    actionType: 'start_turn' | 'action' | 'bonus' | 'reaction' | 'legendary' | 'lair' | 'none';
  };

  // Targeting Configuration
  range: {
    type: 'melee' | 'ranged' | 'self' | 'sight' | 'touch' | 'unlimited';
    value?: number; // Distance in feet
    reach?: number; // Reach in feet (default 5)
  };

  aoe?: {
    shape: 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder' | 'hemisphere';
    size: number; // Radius or Length
    height?: number; // For Cylinder
  };

  // Mechanics Configuration
  attack?: {
    type: 'melee_weapon' | 'ranged_weapon' | 'melee_spell' | 'ranged_spell' | 'auto_hit';
    bonus: number; // To Hit Bonus
    critRange?: number; // Default 20
  };

  save?: {
    attribute: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    dc: number;
    effect: 'negate' | 'half' | 'none';
  };

  // Effect Payload
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

  // Usage Limits
  usage?: {
    current: number;
    max: number;
    per: 'short_rest' | 'long_rest' | 'day' | 'dawn' | 'dusk' | 'never';
  };
}
