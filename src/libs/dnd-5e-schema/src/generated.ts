import { z } from 'zod';

export const ActionSchema = z.object({
  name: z.string(),
  type: z.enum(['melee', 'ranged', 'spell', 'utility']).optional(),
  toHit: z.number().int().optional(),
  reach: z.number().int().optional(),
  damage: z.array(z.lazy(() => DamageInstanceSchema)).optional(),
  save: z.lazy(() => SaveDcSchema).optional(),
  area: z.lazy(() => AreaEffectSchema).optional(),
  duration: z
    .enum([
      'instantaneous',
      'concentration',
      'one_minute',
      'ten_minutes',
      'one_hour',
      'eight_hours',
      'twenty_four_hours',
      'until_dispelled',
      'special',
    ])
    .optional(),
  description: z.string().optional(),
  action_definition: z.unknown().optional(),
  spell_definition: z.unknown().optional(),
});

export const AppearanceSchema = z.object({
  age: z.number().int().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  eyes: z.string().optional(),
  skin: z.string().optional(),
  hair: z.string().optional(),
  description: z.string().optional(),
  texture: z.unknown().optional(),
});

export const AreaEffectSchema = z.object({
  shape: z.enum(['line', 'cone', 'cube', 'sphere', 'circle', 'cylinder']),
  size: z.number().int(),
  width: z.number().int().optional(),
});

export const CastingConfigSchema = z.object({
  time_value: z.number().int(),
  time_unit: z.enum(['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day', 'Round']),
  reaction_trigger: z.string().optional(),
  is_ritual: z.boolean().optional(),
  is_concentration: z.boolean().optional(),
  components: z.lazy(() => SpellComponentsSchema).optional(),
});

export const CharacterClassSchema = z.object({
  class: z.unknown().optional(),
  level: z.number().int(),
  subclass: z.unknown().optional(),
});

export const ClassProgressionSchema = z.object({
  level: z.number().int(),
  features: z.unknown().optional(),
  spell_slots: z.unknown().optional(),
  class_specifics: z.unknown().optional(),
});

export const CompilationStateSchema = z.object({
  status: z.enum(['Pending', 'Valid', 'Invalid', 'Warning']),
  last_run: z.unknown().optional(),
  summary: z.string().optional(),
  hash: z.string().optional(),
});

export const ComputedActionSchema = z.object({
  name: z.string(),
  type: z.enum(['melee', 'ranged', 'spell', 'utility']).optional(),
  toHit: z.number().int().optional(),
  damageDice: z.string().optional(),
  damageBonus: z.number().int().optional(),
  damageType: z.string().optional(),
  saveAbility: z.string().optional(),
  saveDc: z.number().int().optional(),
  range: z.number().int().optional(),
  description: z.string().optional(),
  resourceCost: z.unknown().optional(),
});

export const ConditionInstanceSchema = z.object({
  condition: z.enum([
    'Blinded',
    'Charmed',
    'Deafened',
    'Exhaustion',
    'Frightened',
    'Grappled',
    'Incapacitated',
    'Invisible',
    'Paralyzed',
    'Petrified',
    'Poisoned',
    'Prone',
    'Restrained',
    'Stunned',
    'Unconscious',
    'Special',
  ]),
  description: z.string().optional(),
  chance: z.number().int().optional(),
  duration_rounds: z.number().int().optional(),
});

export const DamageDiceSchema = z.object({
  dice: z.string(),
  bonus: z.number().int().optional(),
  type: z.string().optional(),
});

export const DamageInstanceSchema = z.object({
  effect_type: z.enum(['Damage', 'Healing', 'TempHP']),
  damage_type: z
    .enum([
      'Acid',
      'Bludgeoning',
      'Cold',
      'Fire',
      'Force',
      'Lightning',
      'Necrotic',
      'Piercing',
      'Poison',
      'Psychic',
      'Radiant',
      'Slashing',
      'Thunder',
    ])
    .optional(),
  dice_count: z.number().int().optional(),
  dice_value: z.number().int().optional(),
  flat_bonus: z.number().int().optional(),
  timing: z.enum(['Instant', 'Start of Turn', 'End of Turn', 'One Time Trigger']).optional(),
});

export const DamageModifierSchema = z.object({
  damageType: z.enum([
    'acid',
    'bludgeoning',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'piercing',
    'poison',
    'psychic',
    'radiant',
    'slashing',
    'thunder',
    'physical',
    'magical',
  ]),
  modifier: z.enum(['resistance', 'immunity', 'vulnerability']),
});

export const DmStyleSchema = z.object({
  verbosity: z.number().int().optional(),
  detail: z.number().int().optional(),
  engagement: z.number().int().optional(),
  narrative: z.number().int().optional(),
  specialMode: z.string().optional(),
  customDirectives: z.string().optional(),
});

export const DurationConfigSchema = z.object({
  type: z.enum(['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special']),
  value: z.number().int().optional(),
  unit: z.enum(['Rounds', 'Minutes', 'Hours', 'Days']).optional(),
  concentration: z.boolean().optional(),
});

export const EquipmentDataSchema = z.object({
  damage_dice: z.string().optional(),
  damage_type: z.unknown().optional(),
  range_normal: z.number().int().optional(),
  range_long: z.number().int().optional(),
  properties: z.unknown().optional(),
  armor_class_base: z.number().int().optional(),
  armor_class_dex_bonus: z.boolean().optional(),
  str_minimum: z.number().int().optional(),
  stealth_disadvantage: z.boolean().optional(),
  actions: z.unknown().optional(),
});

export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  source: z.enum(['race', 'class', 'monster', 'feat', 'item', 'other']).optional(),
  usage_max: z.number().int().optional(),
  usage_per: z.enum(['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']).optional(),
});

export const InventoryItemSchema = z.object({
  item: z.unknown().optional(),
  quantity: z.number().int().optional(),
  slot: z
    .enum([
      'backpack',
      'main_hand',
      'off_hand',
      'armor',
      'head',
      'feet',
      'neck',
      'hands',
      'cloak',
      'ring_1',
      'ring_2',
      'accessory',
    ])
    .optional(),
  isEquipped: z.boolean().optional(),
});

export const MechanicsConfigSchema = z.object({
  action_type: z.enum([
    'Melee Spell Attack',
    'Ranged Spell Attack',
    'Strength Save',
    'Dexterity Save',
    'Constitution Save',
    'Intelligence Save',
    'Wisdom Save',
    'Charisma Save',
    'Auto-Hit',
    'None',
  ]),
  save_effect: z.enum(['Negate', 'Half', 'None']).optional(),
});

export const PlayerSchema = z.object({
  user: z.unknown().optional(),
  character: z.unknown().optional(),
  characterSheet: z.unknown().optional(),
  isReady: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  name: z.string().optional(),
  joinedAt: z.unknown().optional(),
  action: z.string().optional(),
});

export const PositionSchema = z.object({
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  z: z.number().int().optional(),
  mapId: z.string().optional(),
});

export const RangeConfigSchema = z.object({
  type: z.enum(['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']),
  distance: z.number().int().optional(),
  aoe_shape: z.enum(['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']).optional(),
  aoe_size: z.number().int().optional(),
  aoe_height: z.number().int().optional(),
});

export const ResourcePoolSchema = z.object({
  name: z.string(),
  current: z.number().int(),
  max: z.number().int(),
  reset_on: z.enum(['short_rest', 'long_rest', 'never', 'dawn']).optional(),
});

export const SaveBonusSchema = z.object({
  stat: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']),
  value: z.number().int(),
  proficient: z.boolean().optional(),
});

export const SaveDcSchema = z.object({
  dc: z.number().int(),
  stat: z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']),
  success_type: z.enum(['none', 'half', 'other']).optional(),
});

export const ScalingConfigSchema = z.object({
  scales: z.boolean().optional(),
  type: z.enum(['Dice', 'Target', 'Duration']).optional(),
  method: z.enum(['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds']).optional(),
  dice_count: z.number().int().optional(),
  dice_value: z.number().int().optional(),
});

export const SkillBonusSchema = z.object({
  name: z.string(),
  value: z.number().int(),
  proficient: z.boolean().optional(),
});

export const SpellComponentsSchema = z.object({
  verbal: z.boolean().optional(),
  somatic: z.boolean().optional(),
  material: z.boolean().optional(),
  material_description: z.string().optional(),
  cost_gp: z.number().int().optional(),
  consumed: z.boolean().optional(),
});

export const SpellDataSchema = z.object({
  level: z.number().int().optional(),
  school: z
    .enum([
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
    ])
    .optional(),
  casting_config: z.lazy(() => CastingConfigSchema).optional(),
  range_config: z.lazy(() => RangeConfigSchema).optional(),
  duration_config: z.lazy(() => DurationConfigSchema).optional(),
  damage_instances: z.array(z.lazy(() => DamageInstanceSchema)).optional(),
  condition_instances: z.array(z.lazy(() => ConditionInstanceSchema)).optional(),
});

export const SpellbookSchema = z.object({
  knownSpells: z.unknown().optional(),
  preparedSpells: z.unknown().optional(),
  spellcastingAbility: z.enum(['intelligence', 'wisdom', 'charisma']).optional(),
  spellSaveDc: z.number().int().optional(),
  spellAttackBonus: z.number().int().optional(),
});

export const StatsSchema = z.object({
  strength: z.number().int().optional(),
  dexterity: z.number().int().optional(),
  constitution: z.number().int().optional(),
  intelligence: z.number().int().optional(),
  wisdom: z.number().int().optional(),
  charisma: z.number().int().optional(),
  walkSpeed: z.number().int().optional(),
  flySpeed: z.number().int().optional(),
  swimSpeed: z.number().int().optional(),
  climbSpeed: z.number().int().optional(),
  burrowSpeed: z.number().int().optional(),
  hover: z.boolean().optional(),
  saves: z.unknown().optional(),
  skills: z.unknown().optional(),
  passivePerception: z.number().int().optional(),
  darkvision: z.number().int().optional(),
  blindsight: z.number().int().optional(),
  truesight: z.number().int().optional(),
  tremorsense: z.number().int().optional(),
  languages: z.unknown().optional(),
});

export type Action = z.infer<typeof ActionSchema>;
export type Appearance = z.infer<typeof AppearanceSchema>;
export type AreaEffect = z.infer<typeof AreaEffectSchema>;
export type CastingConfig = z.infer<typeof CastingConfigSchema>;
export type CharacterClass = z.infer<typeof CharacterClassSchema>;
export type ClassProgression = z.infer<typeof ClassProgressionSchema>;
export type CompilationState = z.infer<typeof CompilationStateSchema>;
export type ComputedAction = z.infer<typeof ComputedActionSchema>;
export type ConditionInstance = z.infer<typeof ConditionInstanceSchema>;
export type DamageDice = z.infer<typeof DamageDiceSchema>;
export type DamageInstance = z.infer<typeof DamageInstanceSchema>;
export type DamageModifier = z.infer<typeof DamageModifierSchema>;
export type DmStyle = z.infer<typeof DmStyleSchema>;
export type DurationConfig = z.infer<typeof DurationConfigSchema>;
export type EquipmentData = z.infer<typeof EquipmentDataSchema>;
export type Feature = z.infer<typeof FeatureSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type MechanicsConfig = z.infer<typeof MechanicsConfigSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type RangeConfig = z.infer<typeof RangeConfigSchema>;
export type ResourcePool = z.infer<typeof ResourcePoolSchema>;
export type SaveBonus = z.infer<typeof SaveBonusSchema>;
export type SaveDc = z.infer<typeof SaveDcSchema>;
export type ScalingConfig = z.infer<typeof ScalingConfigSchema>;
export type SkillBonus = z.infer<typeof SkillBonusSchema>;
export type SpellComponents = z.infer<typeof SpellComponentsSchema>;
export type SpellData = z.infer<typeof SpellDataSchema>;
export type Spellbook = z.infer<typeof SpellbookSchema>;
export type Stats = z.infer<typeof StatsSchema>;
