import { z } from 'zod';

export const GameStatsSchema = z
  .object({
    strength: z.number().optional().default(10),
    dexterity: z.number().optional().default(10),
    constitution: z.number().optional().default(10),
    intelligence: z.number().optional().default(10),
    wisdom: z.number().optional().default(10),
    charisma: z.number().optional().default(10),
    walkSpeed: z.number().optional().default(0),
    flySpeed: z.number().optional().default(0),
    swimSpeed: z.number().optional().default(0),
    climbSpeed: z.number().optional().default(0),
    burrowSpeed: z.number().optional().default(0),
    hover: z.boolean().default(false),
    saves: z.any().optional(),
    skills: z.any().optional(),
    passivePerception: z.number().optional(),
    darkvision: z.number().optional(),
    blindsight: z.number().optional(),
    truesight: z.number().optional(),
    tremorsense: z.number().optional(),
    languages: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const GameSpellbookSchema = z
  .object({
    knownSpells: z.union([z.string(), z.number()]).array().optional(),
    preparedSpells: z.union([z.string(), z.number()]).array().optional(),
    spellcastingAbility: z.enum(['intelligence', 'wisdom', 'charisma']).optional(),
    spellSaveDc: z.number().optional(),
    spellAttackBonus: z.number().optional(),
  })
  .strict();

export const GameSpellDataSchema = z
  .object({
    level: z.number().optional(),
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
    casting_config: z.lazy(() => GameCastingConfigSchema).optional(),
    range_config: z.lazy(() => GameRangeConfigSchema).optional(),
    duration_config: z.lazy(() => GameDurationConfigSchema).optional(),
    damage_instances: z.array(z.lazy(() => GameDamageInstanceSchema)).optional(),
    condition_instances: z.array(z.lazy(() => GameConditionInstanceSchema)).optional(),
  })
  .strict();

export const GameSpellComponentsSchema = z
  .object({
    verbal: z.boolean().default(false),
    somatic: z.boolean().default(false),
    material: z.boolean().default(false),
    material_description: z.string().optional(),
    cost_gp: z.number().optional().default(0),
    consumed: z.boolean().default(false),
  })
  .strict();

export const GameSkillBonusSchema = z
  .object({
    name: z.string(),
    value: z.number().default(0),
    proficient: z.boolean().default(false),
  })
  .strict();

export const GameScalingConfigSchema = z
  .object({
    scales: z.boolean().default(false),
    type: z.enum(['Dice', 'Target', 'Duration']).optional().default('Dice'),
    method: z
      .enum(['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds'])
      .optional()
      .default('Per Slot Level'),
    dice_count: z.number().optional(),
    dice_value: z.number().optional(),
  })
  .strict();

export const GameSaveDcSchema = z
  .object({
    dc: z.number(),
    stat: z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']),
    success_type: z.enum(['none', 'half', 'other']).optional().default('none'),
  })
  .strict();

export const GameSaveBonusSchema = z
  .object({
    stat: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']),
    value: z.number().default(0),
    proficient: z.boolean().default(false),
  })
  .strict();

export const GameResourcePoolSchema = z
  .object({
    name: z.string(),
    current: z.number().default(0),
    max: z.number().default(1),
    reset_on: z.enum(['short_rest', 'long_rest', 'never', 'dawn']).optional().default('long_rest'),
  })
  .strict();

export const GameRangeConfigSchema = z
  .object({
    type: z.enum(['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']).default('Ranged (Feet)'),
    distance: z.number().optional(),
    aoe_shape: z.enum(['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']).optional(),
    aoe_size: z.number().optional(),
    aoe_height: z.number().optional(),
  })
  .strict();

export const GamePositionSchema = z
  .object({
    x: z.number().optional().default(0),
    y: z.number().optional().default(0),
    z: z.number().optional().default(0),
    mapId: z.string().optional(),
  })
  .strict();

export const GamePlayerSchema = z
  .object({
    user: z.union([z.string(), z.number()]).optional(),
    character: z.union([z.string(), z.number()]).optional(),
    characterSheet: z.union([z.string(), z.number()]).optional(),
    isReady: z.boolean().default(false),
    isOnline: z.boolean().default(true),
    name: z.string().optional(),
    joinedAt: z.any().optional(),
    action: z.string().optional(),
  })
  .strict();

export const GameMechanicsConfigSchema = z
  .object({
    action_type: z
      .enum([
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
      ])
      .default('None'),
    save_effect: z.enum(['Negate', 'Half', 'None']).optional(),
  })
  .strict();

export const GameInventoryItemSchema = z
  .object({
    item: z.union([z.string(), z.number()]).optional(),
    quantity: z.number().optional().default(1),
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
      .optional()
      .default('backpack'),
    isEquipped: z.boolean().default(false),
  })
  .strict();

export const GameFeatureSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    source: z.enum(['race', 'class', 'monster', 'feat', 'item', 'other']).optional().default('monster'),
    usage_max: z.number().optional(),
    usage_per: z.enum(['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']).optional(),
  })
  .strict();

export const GameEquipmentDataSchema = z
  .object({
    damage_dice: z.string().optional(),
    damage_type: z.union([z.string(), z.number()]).optional(),
    range_normal: z.number().optional(),
    range_long: z.number().optional(),
    properties: z.union([z.string(), z.number()]).array().optional(),
    armor_class_base: z.number().optional(),
    armor_class_dex_bonus: z.boolean(),
    str_minimum: z.number().optional(),
    stealth_disadvantage: z.boolean(),
    actions: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const GameDurationConfigSchema = z
  .object({
    type: z
      .enum(['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special'])
      .default('Instantaneous'),
    value: z.number().optional(),
    unit: z.enum(['Rounds', 'Minutes', 'Hours', 'Days']).optional(),
    concentration: z.boolean().default(false),
  })
  .strict();

export const GameDmStyleSchema = z
  .object({
    verbosity: z.number().optional().default(1),
    detail: z.number().optional().default(1),
    engagement: z.number().optional().default(1),
    narrative: z.number().optional().default(1),
    specialMode: z.string().optional(),
    customDirectives: z.string().optional(),
  })
  .strict();

export const GameDamageModifierSchema = z
  .object({
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
  })
  .strict();

export const GameDamageInstanceSchema = z
  .object({
    effect_type: z.enum(['Damage', 'Healing', 'TempHP']).default('Damage'),
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
    dice_count: z.number().optional().default(1),
    dice_value: z.number().optional().default(6),
    flat_bonus: z.number().optional().default(0),
    timing: z.enum(['Instant', 'Start of Turn', 'End of Turn', 'One Time Trigger']).optional().default('Instant'),
  })
  .strict();

export const GameDamageDiceSchema = z
  .object({
    dice: z.string(),
    bonus: z.number().optional().default(0),
    type: z.string().optional(),
  })
  .strict();

export const GameConditionInstanceSchema = z
  .object({
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
    chance: z.number().optional().default(100),
    duration_rounds: z.number().optional(),
  })
  .strict();

export const GameComputedActionSchema = z
  .object({
    name: z.string(),
    type: z.enum(['melee', 'ranged', 'spell', 'utility']).optional(),
    toHit: z.number().optional(),
    damageDice: z.string().optional(),
    damageBonus: z.number().optional(),
    damageType: z.string().optional(),
    saveAbility: z.string().optional(),
    saveDc: z.number().optional(),
    range: z.number().optional(),
    description: z.string().optional(),
    resourceCost: z.any().optional(),
  })
  .strict();

export const GameClassProgressionSchema = z
  .object({
    level: z.number(),
    features: z.union([z.string(), z.number()]).array().optional(),
    spell_slots: z.any().optional(),
    class_specifics: z.any().optional(),
  })
  .strict();

export const GameCharacterClassSchema = z
  .object({
    class: z.union([z.string(), z.number()]).optional(),
    level: z.number().default(1),
    subclass: z.union([z.string(), z.number()]).optional(),
  })
  .strict();

export const GameCastingConfigSchema = z
  .object({
    time_value: z.number().default(1),
    time_unit: z.enum(['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day', 'Round']).default('Action'),
    reaction_trigger: z.string().optional(),
    is_ritual: z.boolean().default(false),
    is_concentration: z.boolean().default(false),
    components: z.lazy(() => GameSpellComponentsSchema).optional(),
  })
  .strict();

export const GameAreaEffectSchema = z
  .object({
    shape: z.enum(['line', 'cone', 'cube', 'sphere', 'circle', 'cylinder']),
    size: z.number(),
    width: z.number().optional(),
  })
  .strict();

export const GameAppearanceSchema = z
  .object({
    age: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    eyes: z.string().optional(),
    skin: z.string().optional(),
    hair: z.string().optional(),
    description: z.string().optional(),
  })
  .strict();

export const GameActionSchema = z
  .object({
    name: z.string(),
    type: z.enum(['melee', 'ranged', 'spell', 'utility']).optional().default('melee'),
    toHit: z.number().optional(),
    reach: z.number().optional(),
    damage: z.array(z.lazy(() => GameDamageInstanceSchema)).optional(),
    save: z.lazy(() => GameSaveDcSchema).optional(),
    area: z.lazy(() => GameAreaEffectSchema).optional(),
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
      .optional()
      .default('instantaneous'),
    description: z.string().optional(),
    action_definition: z.union([z.string(), z.number()]).optional(),
    spell_definition: z.union([z.string(), z.number()]).optional(),
  })
  .strict();

export const ApiActionActionSchema = z
  .object({
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['melee', 'ranged', 'spell', 'utility', 'ability']).optional().default('melee'),
    range_config: z.lazy(() => GameRangeConfigSchema).optional(),
    mechanics_config: z.lazy(() => GameMechanicsConfigSchema).optional(),
    damage_instances: z.array(z.lazy(() => GameDamageInstanceSchema)).optional(),
    condition_instances: z.array(z.lazy(() => GameConditionInstanceSchema)).optional(),
    save: z.lazy(() => GameSaveDcSchema).optional(),
    toHit: z.number().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiCharacterCharacterSchema = z
  .object({
    name: z.string(),
    embedding: z.any().optional(),
    level: z.number().default(1),
    portrait: z.any().optional(),
    upperBody: z.any().optional(),
    fullBody: z.any().optional(),
    race: z.union([z.string(), z.number()]).optional(),
    classes: z.array(z.lazy(() => GameCharacterClassSchema)).optional(),
    stats: z.lazy(() => GameStatsSchema).optional(),
    user: z.union([z.string(), z.number()]).optional(),
    appearance: z.any().optional(),
    backstory: z.string().optional(),
    inventory: z.array(z.lazy(() => GameInventoryItemSchema)).optional(),
    actions: z.union([z.string(), z.number()]).array().optional(),
    spells: z.union([z.string(), z.number()]).array().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiClassClassSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    embedding: z.any().optional(),
    description: z.string().optional(),
    hit_die: z.string().optional(),
    subclasses: z.union([z.string(), z.number()]).array().optional(),
    proficiencies: z.union([z.string(), z.number()]).array().optional(),
    features: z.array(z.lazy(() => GameFeatureSchema)).optional(),
    progression: z.array(z.lazy(() => GameClassProgressionSchema)).optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiDamageTypeDamageTypeSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    embedding: z.any().optional(),
    description: z.string().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiDmSettingDmSettingSchema = z
  .object({
    dmStyle: z.lazy(() => GameDmStyleSchema).optional(),
    dmSystemPrompt: z.string().optional(),
    difficulty: z.enum(['storyteller', 'easy', 'medium', 'challenging', 'gritty', 'deadly']).optional().default('easy'),
    adventureLength: z.enum(['flash', 'short', 'medium', 'long', 'epic', 'legendary']).optional().default('short'),
    theme: z.string().optional(),
    setting: z.string().optional(),
    tone: z.string().optional(),
    playerCount: z.number().optional().default(4),
    startingLevel: z.number().optional().default(1),
    attributePointBudget: z.number().optional().default(27),
    room: z.union([z.string(), z.number()]).optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiEntityEntitySchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    embeddingMetadata: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']).optional(),
    type: z.string().optional(),
    alignment: z.string().optional(),
    level: z.number().optional().default(1),
    ac: z.number().optional(),
    hp: z.number().optional(),
    hit_dice: z.string().optional(),
    stats: z.lazy(() => GameStatsSchema).optional(),
    languages: z.union([z.string(), z.number()]).array().optional(),
    challenge_rating: z.number().optional(),
    xp: z.number().optional(),
    image: z.any().optional(),
    features: z.union([z.string(), z.number()]).array().optional(),
    traits: z.union([z.string(), z.number()]).array().optional(),
    proficiencies: z.union([z.string(), z.number()]).array().optional(),
    inventory: z.array(z.lazy(() => GameInventoryItemSchema)).optional(),
    actions: z.union([z.string(), z.number()]).array().optional(),
    spells: z.union([z.string(), z.number()]).array().optional(),
    appearance: z.lazy(() => GameAppearanceSchema).optional(),
    background: z.string().optional(),
    race: z.union([z.string(), z.number()]).optional(),
    classes: z.array(z.lazy(() => GameCharacterClassSchema)).optional(),
    resources: z.array(z.lazy(() => GameResourcePoolSchema)).optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiEntitySheetEntitySheetSchema = z
  .object({
    name: z.string().optional(),
    type: z.enum(['player', 'monster', 'npc', 'loot']).optional().default('player'),
    entity: z.union([z.string(), z.number()]).optional(),
    owner: z.union([z.string(), z.number()]).optional(),
    character: z.union([z.string(), z.number()]).optional(),
    room: z.union([z.string(), z.number()]).optional(),
    currentHp: z.number().optional(),
    maxHp: z.number().optional(),
    ac: z.number().optional().default(10),
    level: z.number().optional().default(1),
    experience: z.number().optional().default(0),
    stats: z.lazy(() => GameStatsSchema).optional(),
    race: z.union([z.string(), z.number()]).optional(),
    class: z.union([z.string(), z.number()]).optional(),
    appearance: z.lazy(() => GameAppearanceSchema).optional(),
    backstory: z.string().optional(),
    inventory: z.array(z.lazy(() => GameInventoryItemSchema)).optional(),
    position: z.lazy(() => GamePositionSchema).optional(),
    actions: z.union([z.string(), z.number()]).array().optional(),
    spellbook: z.lazy(() => GameSpellbookSchema).optional(),
    proficiencies: z.union([z.string(), z.number()]).array().optional(),
    languages: z.union([z.string(), z.number()]).array().optional(),
    traits: z.union([z.string(), z.number()]).array().optional(),
    features: z.union([z.string(), z.number()]).array().optional(),
    conditions: z.array(z.lazy(() => GameConditionInstanceSchema)).optional(),
    resources: z.array(z.lazy(() => GameResourcePoolSchema)).optional(),
    active_effects: z.any().optional(),
    tempHp: z.number().optional().default(0),
    initiativeBonus: z.number().optional().default(0),
    passivePerception: z.number().optional().default(10),
    computedSkills: z.array(z.lazy(() => GameSkillBonusSchema)).optional(),
    computedSaves: z.array(z.lazy(() => GameSaveBonusSchema)).optional(),
    defenses: z.array(z.lazy(() => GameDamageModifierSchema)).optional(),
    computedActions: z.array(z.lazy(() => GameComputedActionSchema)).optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiEquipmentCategoryEquipmentCategorySchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiFeatureFeatureSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    level: z.number().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiGameEventGameEventSchema = z
  .object({
    type: z.enum([
      'ATTACK',
      'ATTACK_RESULT',
      'SPELL_CAST',
      'MOVE',
      'ENTITY_MOVED',
      'SKILL_CHECK',
      'SKILL_CHECK_RESULT',
      'INTERACT',
      'OBJECT_INTERACTION',
      'LONG_REST',
      'LONG_REST_COMPLETED',
      'SHORT_REST',
      'DEATH_SAVE',
      'ENTITY_DEATH',
      'INITIATIVE',
      'TURN_START',
      'TURN_END',
      'TERRAIN_MODIFIED',
      'SPAWN_ENTITY',
      'ENTROPY_CHANGE',
      'ITEM_DROP',
      'ITEM_PICKUP',
    ]),
    actor: z.union([z.string(), z.number()]).optional(),
    room: z.union([z.string(), z.number()]).optional(),
    payload: z.any(),
    timestamp: z.number(),
    turn_number: z.number().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiItemItemSchema = z
  .object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    type: z
      .enum(['weapon', 'armor', 'consumable', 'tool', 'loot', 'spell_scroll', 'feature', 'container'])
      .default('loot'),
    rarity: z.enum(['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact']).optional().default('common'),
    value: z.number().optional().default(0),
    weight: z.number().optional().default(0),
    image: z.any().optional(),
    equipment_data: z.lazy(() => GameEquipmentDataSchema).optional(),
    spell_data: z.lazy(() => GameSpellDataSchema).optional(),
    custom_data: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiKnowledgeSnippetKnowledgeSnippetSchema = z
  .object({
    title: z.string(),
    content: z.string(),
    source: z.union([z.string(), z.number()]).optional(),
    embedding: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiKnowledgeSourceKnowledgeSourceSchema = z
  .object({
    name: z.string(),
    content: z.string(),
    tags: z.any().optional(),
    origin: z.enum(['manual', 'entity']).default('manual'),
    snippets: z.union([z.string(), z.number()]).array().optional(),
    embedding: z.any().optional(),
    embeddingMetadata: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiLanguageLanguageSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    is_rare: z.boolean().default(false),
    note: z.string().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiMagicSchoolMagicSchoolSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiMessageMessageSchema = z
  .object({
    content: z.string(),
    senderName: z.string().optional(),
    senderType: z.enum(['dm', 'player', 'system']).optional().default('system'),
    room: z.union([z.string(), z.number()]).optional(),
    turn: z.union([z.string(), z.number()]).optional(),
    recipient: z.union([z.string(), z.number()]).optional(),
    timestamp: z.number().optional(),
    images: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiProficiencyProficiencySchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    embedding: z.any().optional(),
    type: z
      .enum([
        'Armor',
        'Weapons',
        'Tools',
        "Artisan's Tools",
        'Gaming Sets',
        'Musical Instruments',
        'Vehicles',
        'Other',
        'Saving Throws',
        'Skills',
      ])
      .optional(),
    classes: z.union([z.string(), z.number()]).array().optional(),
    races: z.union([z.string(), z.number()]).array().optional(),
    traits: z.union([z.string(), z.number()]).array().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiPromptPromptSchema = z
  .object({
    key: z.string(),
    text: z.string().optional(),
    category: z.enum(['system', 'user', 'gameplay']).optional().default('system'),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiRaceRaceSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    speed: z.any().optional(),
    size: z.enum(['Tiny', 'Small', 'Medium', 'Large']).optional(),
    traits: z.union([z.string(), z.number()]).array().optional(),
    proficiencies: z.union([z.string(), z.number()]).array().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiRoomRoomSchema = z
  .object({
    roomId: z.string().optional(),
    owner: z.union([z.string(), z.number()]).optional(),
    phase: z
      .enum(['lobby', 'character_creation', 'world_generation', 'gameplay', 'combat', 'ending'])
      .optional()
      .default('lobby'),
    players: z.array(z.lazy(() => GamePlayerSchema)).optional(),
    turnData: z.any().optional(),
    exploredTiles: z.any().optional(),
    exploredChunks: z.any().optional(),
    entropyState: z.any().optional(),
    isActive: z.boolean().default(true),
    isProcessing: z.boolean().default(false),
    code: z.string().optional(),
    entity_sheets: z.union([z.string(), z.number()]).array().optional(),
    turns: z.union([z.string(), z.number()]).array().optional(),
    messages: z.union([z.string(), z.number()]).array().optional(),
    events: z.union([z.string(), z.number()]).array().optional(),
    timeFrames: z.union([z.string(), z.number()]).array().optional(),
    currentTimeFrame: z.union([z.string(), z.number()]).optional(),
    world: z.union([z.string(), z.number()]).optional(),
    dmSettings: z.union([z.string(), z.number()]).optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiRuleSetRuleSetSchema = z
  .object({
    xp_table: z.any(),
    proficiency_table: z.any(),
    full_caster_slots: z.any().optional(),
    ability_caps: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiSpellSpellSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    level: z.number().optional(),
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
    casting_config: z.lazy(() => GameCastingConfigSchema).optional(),
    range_config: z.lazy(() => GameRangeConfigSchema).optional(),
    duration_config: z.lazy(() => GameDurationConfigSchema).optional(),
    mechanics_config: z.lazy(() => GameMechanicsConfigSchema).optional(),
    damage_instances: z.array(z.lazy(() => GameDamageInstanceSchema)).optional(),
    condition_instances: z.array(z.lazy(() => GameConditionInstanceSchema)).optional(),
    scaling_config: z.lazy(() => GameScalingConfigSchema).optional(),
    description: z.string().optional(),
    image: z.any().optional(),
    embedding: z.any().optional(),
    embeddingMetadata: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiSubclassSubclassSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    subclass_flavor: z.string().optional(),
    class: z.union([z.string(), z.number()]).optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiTimeFrameTimeFrameSchema = z
  .object({
    turnNumber: z.number(),
    timestamp: z.any(),
    room: z.union([z.string(), z.number()]).optional(),
    gameState: z.any(),
    entropySnapshot: z.any().optional(),
    events: z.union([z.string(), z.number()]).array().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiTraitTraitSchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    races: z.union([z.string(), z.number()]).array().optional(),
    proficiencies: z.union([z.string(), z.number()]).array().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiTurnTurnSchema = z
  .object({
    turnNumber: z.number().default(0),
    room: z.union([z.string(), z.number()]).optional(),
    messages: z.union([z.string(), z.number()]).array().optional(),
    narrative: z.string().optional(),
    summary: z.string().optional(),
    type: z.enum(['group', 'combat', 'exploration']).optional().default('group'),
    status: z.enum(['waiting', 'processing', 'complete']).optional().default('waiting'),
    actions: z.any().optional(),
    metadata: z.any().optional(),
    characterSnapshots: z.any().optional(),
    contextImage: z.union([z.string(), z.number()]).optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiTurnLockTurnLockSchema = z
  .object({
    room: z.union([z.string(), z.number()]).optional(),
    locked_at: z.any(),
    expires_at: z.any(),
    holder_id: z.string(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiVoxelChangeVoxelChangeSchema = z
  .object({
    chunkX: z.number(),
    chunkY: z.number(),
    voxelX: z.number(),
    voxelY: z.number(),
    voxelZ: z.number(),
    newType: z.string(),
    previousType: z.string().optional(),
    reason: z.string().optional(),
    metadata: z.any().optional(),
    timestamp: z.number(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiWeaponPropertyWeaponPropertySchema = z
  .object({
    slug: z.string(),
    embedding: z.any().optional(),
    name: z.string(),
    description: z.string().optional(),
    image: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();

export const ApiWorldWorldSchema = z
  .object({
    room: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional().default('New World'),
    description: z.string().optional(),
    history: z.string().optional(),
    worldBackground: z.string().optional(),
    seed: z.string().optional(),
    language: z.string().optional().default('en-US'),
    chunkSize: z.number().optional().default(32),
    detail: z.number().optional().default(4),
    fogRadius: z.number().optional().default(10),
    globalScale: z.number().optional(),
    seaLevel: z.number().optional(),
    elevationScale: z.number().optional(),
    roughness: z.number().optional(),
    moistureScale: z.number().optional(),
    temperatureOffset: z.number().optional(),
    roadDensity: z.number().optional(),
    structureChance: z.number().optional(),
    structureSpacing: z.number().optional(),
    structureSizeAvg: z.number().optional(),
    worldSize: z.enum(['intimate', 'small', 'medium', 'large', 'vast', 'epic']).optional().default('small'),
    worldType: z.string().optional().default('terra'),
    adventureLength: z.enum(['flash', 'short', 'medium', 'long', 'epic', 'legendary']).optional().default('short'),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    publishedAt: z.any().optional(),
    createdBy: z.union([z.string(), z.number()]).optional(),
    updatedBy: z.union([z.string(), z.number()]).optional(),
    locale: z.string().optional(),
    localizations: z.union([z.string(), z.number()]).array().optional(),
  })
  .strict();
