import type { Schema, Struct } from '@strapi/strapi';

export interface GameAction extends Struct.ComponentSchema {
  collectionName: 'components_game_actions';
  info: {
    description: 'Structured action (attack, spell, utility)';
    displayName: 'Action';
    icon: 'fist-raised';
  };
  attributes: {
    action_definition: Schema.Attribute.Relation<'oneToOne', 'api::action.action'>;
    area: Schema.Attribute.Component<'game.area-effect', false>;
    damage: Schema.Attribute.Component<'game.damage-instance', true>;
    description: Schema.Attribute.Text;
    duration: Schema.Attribute.Enumeration<
      [
        'instantaneous',
        'concentration',
        'one_minute',
        'ten_minutes',
        'one_hour',
        'eight_hours',
        'twenty_four_hours',
        'until_dispelled',
        'special',
      ]
    > &
      Schema.Attribute.DefaultTo<'instantaneous'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    reach: Schema.Attribute.Integer;
    save: Schema.Attribute.Component<'game.save-dc', false>;
    spell_definition: Schema.Attribute.Relation<'oneToOne', 'api::spell.spell'>;
    toHit: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<['melee', 'ranged', 'spell', 'utility']> & Schema.Attribute.DefaultTo<'melee'>;
  };
}

export interface GameAppearance extends Struct.ComponentSchema {
  collectionName: 'components_game_appearances';
  info: {
    description: 'Physical appearance details';
    displayName: 'Appearance';
    icon: 'user';
  };
  attributes: {
    age: Schema.Attribute.Integer;
    description: Schema.Attribute.Text;
    eyes: Schema.Attribute.String;
    hair: Schema.Attribute.String;
    height: Schema.Attribute.Decimal;
    skin: Schema.Attribute.String;
    texture: Schema.Attribute.JSON & Schema.Attribute.CustomField<'plugin::map-explorer.texture-grid'>;
    weight: Schema.Attribute.Decimal;
  };
}

export interface GameAreaEffect extends Struct.ComponentSchema {
  collectionName: 'components_game_area_effects';
  info: {
    description: 'Area of effect definition';
    displayName: 'Area Effect';
    icon: 'expand';
  };
  attributes: {
    shape: Schema.Attribute.Enumeration<['line', 'cone', 'cube', 'sphere', 'circle', 'cylinder']> &
      Schema.Attribute.Required;
    size: Schema.Attribute.Integer & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface GameCastingConfig extends Struct.ComponentSchema {
  collectionName: 'components_game_casting_configs';
  info: {
    description: 'Rules for casting time and components';
    displayName: 'Casting Config';
    icon: 'hand-sparkles';
  };
  attributes: {
    components: Schema.Attribute.Component<'game.spell-components', false>;
    is_concentration: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    is_ritual: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    reaction_trigger: Schema.Attribute.Text;
    time_unit: Schema.Attribute.Enumeration<['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day', 'Round']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Action'>;
    time_value: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<1>;
  };
}

export interface GameCharacterClass extends Struct.ComponentSchema {
  collectionName: 'components_game_character_classes';
  info: {
    description: 'Links a character to a class and level';
    displayName: 'CharacterClass';
  };
  attributes: {
    class: Schema.Attribute.Relation<'oneToOne', 'api::class.class'>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    subclass: Schema.Attribute.Relation<'oneToOne', 'api::subclass.subclass'>;
  };
}

export interface GameClassProgression extends Struct.ComponentSchema {
  collectionName: 'components_game_class_progressions';
  info: {
    description: 'Features and resources gained at a specific level';
    displayName: 'Class Progression';
  };
  attributes: {
    class_specifics: Schema.Attribute.JSON;
    features: Schema.Attribute.Relation<'oneToMany', 'api::feature.feature'>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 1;
        },
        number
      >;
    spell_slots: Schema.Attribute.JSON;
  };
}

export interface GameCompilationState extends Struct.ComponentSchema {
  collectionName: 'components_game_compilation_states';
  info: {
    description: 'Tracks the verification status of this Entity Blueprint.';
    displayName: 'Compilation State';
  };
  attributes: {
    hash: Schema.Attribute.String & Schema.Attribute.Private;
    last_run: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<['Pending', 'Valid', 'Invalid', 'Warning']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Pending'>;
    summary: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface GameComputedAction extends Struct.ComponentSchema {
  collectionName: 'components_game_computed_actions';
  info: {
    description: 'A fully resolved action ready for the engine';
    displayName: 'Computed Action';
    icon: 'fist-raised';
  };
  attributes: {
    damageBonus: Schema.Attribute.Integer;
    damageDice: Schema.Attribute.String;
    damageType: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    range: Schema.Attribute.Integer;
    resourceCost: Schema.Attribute.JSON;
    saveAbility: Schema.Attribute.String;
    saveDc: Schema.Attribute.Integer;
    toHit: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<['melee', 'ranged', 'spell', 'utility']>;
  };
}

export interface GameConditionInstance extends Struct.ComponentSchema {
  collectionName: 'components_game_condition_instances';
  info: {
    description: 'Applying status effects';
    displayName: 'Condition Instance';
    icon: 'dizzy';
  };
  attributes: {
    chance: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    condition: Schema.Attribute.Enumeration<
      [
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
      ]
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.String;
    duration_rounds: Schema.Attribute.Integer;
  };
}

export interface GameDamageDice extends Struct.ComponentSchema {
  collectionName: 'components_game_damage_dice';
  info: {
    description: 'A single damage roll component (e.g. 2d6 + 3 slashing)';
    displayName: 'Damage Dice';
    icon: 'dice';
  };
  attributes: {
    bonus: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    dice: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.String;
  };
}

export interface GameDamageInstance extends Struct.ComponentSchema {
  collectionName: 'components_game_damage_instances';
  info: {
    description: 'Damage or Healing application';
    displayName: 'Damage Instance';
    icon: 'skull-crossbones';
  };
  attributes: {
    damage_type: Schema.Attribute.Enumeration<
      [
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
      ]
    >;
    dice_count: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    dice_value: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    effect_type: Schema.Attribute.Enumeration<['Damage', 'Healing', 'TempHP']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Damage'>;
    flat_bonus: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    timing: Schema.Attribute.Enumeration<['Instant', 'Start of Turn', 'End of Turn', 'One Time Trigger']> &
      Schema.Attribute.DefaultTo<'Instant'>;
  };
}

export interface GameDamageModifier extends Struct.ComponentSchema {
  collectionName: 'components_game_damage_modifiers';
  info: {
    description: 'Resistance, Immunity, or Vulnerability';
    displayName: 'Damage Modifier';
    icon: 'heart-broken';
  };
  attributes: {
    damageType: Schema.Attribute.Enumeration<
      [
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
      ]
    > &
      Schema.Attribute.Required;
    modifier: Schema.Attribute.Enumeration<['resistance', 'immunity', 'vulnerability']> & Schema.Attribute.Required;
  };
}

export interface GameDmStyle extends Struct.ComponentSchema {
  collectionName: 'components_game_dm_styles';
  info: {
    displayName: 'DM Style';
    icon: 'dungeon';
  };
  attributes: {
    customDirectives: Schema.Attribute.Text;
    detail: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    engagement: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    narrative: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    specialMode: Schema.Attribute.String;
    verbosity: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
  };
}

export interface GameDurationConfig extends Struct.ComponentSchema {
  collectionName: 'components_game_duration_configs';
  info: {
    description: 'Duration and Concentration rules';
    displayName: 'Duration Config';
    icon: 'hourglass-start';
  };
  attributes: {
    concentration: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    type: Schema.Attribute.Enumeration<
      ['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Instantaneous'>;
    unit: Schema.Attribute.Enumeration<['Rounds', 'Minutes', 'Hours', 'Days']>;
    value: Schema.Attribute.Integer;
  };
}

export interface GameEquipmentData extends Struct.ComponentSchema {
  collectionName: 'components_game_equipment_data';
  info: {
    description: 'Stats for weapons, armor, and gear';
    displayName: 'Equipment Data';
    icon: 'shield-alt';
  };
  attributes: {
    actions: Schema.Attribute.Relation<'oneToMany', 'api::action.action'>;
    armor_class_base: Schema.Attribute.Integer;
    armor_class_dex_bonus: Schema.Attribute.Boolean;
    damage_dice: Schema.Attribute.String;
    damage_type: Schema.Attribute.Relation<'oneToOne', 'api::damage-type.damage-type'>;
    properties: Schema.Attribute.Relation<'manyToMany', 'api::weapon-property.weapon-property'>;
    range_long: Schema.Attribute.Integer;
    range_normal: Schema.Attribute.Integer;
    stealth_disadvantage: Schema.Attribute.Boolean;
    str_minimum: Schema.Attribute.Integer;
  };
}

export interface GameFeature extends Struct.ComponentSchema {
  collectionName: 'components_game_features';
  info: {
    description: 'Trait or Special Ability';
    displayName: 'Feature';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    source: Schema.Attribute.Enumeration<['race', 'class', 'monster', 'feat', 'item', 'other']> &
      Schema.Attribute.DefaultTo<'monster'>;
    usage_max: Schema.Attribute.Integer;
    usage_per: Schema.Attribute.Enumeration<['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']>;
  };
}

export interface GameInventoryItem extends Struct.ComponentSchema {
  collectionName: 'components_game_inventory_items';
  info: {
    description: 'An item in an inventory or slot';
    displayName: 'Inventory Item';
  };
  attributes: {
    isEquipped: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    item: Schema.Attribute.Relation<'oneToOne', 'api::item.item'>;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    slot: Schema.Attribute.Enumeration<
      [
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
      ]
    > &
      Schema.Attribute.DefaultTo<'backpack'>;
  };
}

export interface GameMechanicsConfig extends Struct.ComponentSchema {
  collectionName: 'components_game_mechanics_configs';
  info: {
    description: 'Saving Throws and Attack Types';
    displayName: 'Mechanics Config';
    icon: 'cog';
  };
  attributes: {
    action_type: Schema.Attribute.Enumeration<
      [
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
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'None'>;
    save_effect: Schema.Attribute.Enumeration<['Negate', 'Half', 'None']>;
  };
}

export interface GamePlayer extends Struct.ComponentSchema {
  collectionName: 'components_game_players';
  info: {
    description: 'A player in a room';
    displayName: 'Player';
    icon: 'user';
  };
  attributes: {
    action: Schema.Attribute.String;
    character: Schema.Attribute.Relation<'oneToOne', 'api::entity.entity'>;
    characterSheet: Schema.Attribute.Relation<'oneToOne', 'api::entity-sheet.entity-sheet'>;
    isOnline: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    isReady: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    joinedAt: Schema.Attribute.DateTime;
    name: Schema.Attribute.String;
    user: Schema.Attribute.Relation<'oneToOne', 'plugin::users-permissions.user'>;
  };
}

export interface GamePosition extends Struct.ComponentSchema {
  collectionName: 'components_game_positions';
  info: {
    description: 'Grid coordinates';
    displayName: 'Position';
    icon: 'map';
  };
  attributes: {
    mapId: Schema.Attribute.String;
    x: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    y: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    z: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface GameRangeConfig extends Struct.ComponentSchema {
  collectionName: 'components_game_range_configs';
  info: {
    description: 'Distance and Area of Effect';
    displayName: 'Range Config';
    icon: 'ruler-combined';
  };
  attributes: {
    aoe_height: Schema.Attribute.Integer;
    aoe_shape: Schema.Attribute.Enumeration<['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']>;
    aoe_size: Schema.Attribute.Integer;
    distance: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Ranged (Feet)'>;
  };
}

export interface GameResourcePool extends Struct.ComponentSchema {
  collectionName: 'components_game_resource_pools';
  info: {
    description: 'Trackable resources (HP, Spell Slots, Ki Points)';
    displayName: 'Resource Pool';
    icon: 'battery-full';
  };
  attributes: {
    current: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<0>;
    max: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<1>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    reset_on: Schema.Attribute.Enumeration<['short_rest', 'long_rest', 'never', 'dawn']> &
      Schema.Attribute.DefaultTo<'long_rest'>;
  };
}

export interface GameSaveBonus extends Struct.ComponentSchema {
  collectionName: 'components_game_save_bonuses';
  info: {
    description: 'Calculated saving throw modifier';
    displayName: 'Save Bonus';
    icon: 'shield-alt';
  };
  attributes: {
    proficient: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    stat: Schema.Attribute.Enumeration<
      ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    > &
      Schema.Attribute.Required;
    value: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<0>;
  };
}

export interface GameSaveDc extends Struct.ComponentSchema {
  collectionName: 'components_game_save_dcs';
  info: {
    description: 'Saving throw difficulty class';
    displayName: 'Save DC';
    icon: 'shield-alt';
  };
  attributes: {
    dc: Schema.Attribute.Integer & Schema.Attribute.Required;
    stat: Schema.Attribute.Enumeration<['str', 'dex', 'con', 'int', 'wis', 'cha']> & Schema.Attribute.Required;
    success_type: Schema.Attribute.Enumeration<['none', 'half', 'other']> & Schema.Attribute.DefaultTo<'none'>;
  };
}

export interface GameScalingConfig extends Struct.ComponentSchema {
  collectionName: 'components_game_scaling_configs';
  info: {
    description: 'Rules for Higher Level Casting';
    displayName: 'Scaling Config';
    icon: 'sort-amount-up';
  };
  attributes: {
    dice_count: Schema.Attribute.Integer;
    dice_value: Schema.Attribute.Integer;
    method: Schema.Attribute.Enumeration<['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds']> &
      Schema.Attribute.DefaultTo<'Per Slot Level'>;
    scales: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    type: Schema.Attribute.Enumeration<['Dice', 'Target', 'Duration']> & Schema.Attribute.DefaultTo<'Dice'>;
  };
}

export interface GameSkillBonus extends Struct.ComponentSchema {
  collectionName: 'components_game_skill_bonuses';
  info: {
    description: 'Calculated skill modifier';
    displayName: 'Skill Bonus';
    icon: 'book';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    proficient: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    value: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<0>;
  };
}

export interface GameSpellComponents extends Struct.ComponentSchema {
  collectionName: 'components_game_spell_components';
  info: {
    description: 'V, S, M requirements';
    displayName: 'Spell Components';
    icon: 'puzzle-piece';
  };
  attributes: {
    consumed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    cost_gp: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    material: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    material_description: Schema.Attribute.String;
    somatic: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    verbal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface GameSpellData extends Struct.ComponentSchema {
  collectionName: 'components_game_spell_data';
  info: {
    description: 'Spellcasting logic attached to items';
    displayName: 'Spell Data';
    icon: 'magic';
  };
  attributes: {
    casting_config: Schema.Attribute.Component<'game.casting-config', false>;
    condition_instances: Schema.Attribute.Component<'game.condition-instance', true>;
    damage_instances: Schema.Attribute.Component<'game.damage-instance', true>;
    duration_config: Schema.Attribute.Component<'game.duration-config', false>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 9;
          min: 0;
        },
        number
      >;
    range_config: Schema.Attribute.Component<'game.range-config', false>;
    school: Schema.Attribute.Enumeration<
      ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
    >;
  };
}

export interface GameSpellbook extends Struct.ComponentSchema {
  collectionName: 'components_game_spellbooks';
  info: {
    displayName: 'Spellbook';
    icon: 'book';
  };
  attributes: {
    knownSpells: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    preparedSpells: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    spellAttackBonus: Schema.Attribute.Integer;
    spellcastingAbility: Schema.Attribute.Enumeration<['intelligence', 'wisdom', 'charisma']>;
    spellSaveDc: Schema.Attribute.Integer;
  };
}

export interface GameStats extends Struct.ComponentSchema {
  collectionName: 'components_game_stats';
  info: {
    description: '';
    displayName: 'Stats';
    icon: 'chart-bar';
  };
  attributes: {
    blindsight: Schema.Attribute.Integer;
    burrowSpeed: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    charisma: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    climbSpeed: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    constitution: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    darkvision: Schema.Attribute.Integer;
    dexterity: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    flySpeed: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    hover: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    intelligence: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    passivePerception: Schema.Attribute.Integer;
    saves: Schema.Attribute.JSON;
    skills: Schema.Attribute.JSON;
    strength: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    swimSpeed: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tremorsense: Schema.Attribute.Integer;
    truesight: Schema.Attribute.Integer;
    walkSpeed: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    wisdom: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
  };
}

export interface QueueConfig extends Struct.ComponentSchema {
  collectionName: 'components_queue_configs';
  info: {
    description: 'Configuration for a specific queue';
    displayName: 'Config';
    icon: 'cog';
  };
  attributes: {
    concurrency: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>;
    queueName: Schema.Attribute.Enumeration<
      [
        'embedding',
        'generate-text-remote',
        'generate-text-local',
        'maintenance',
        'genesis',
        'compile',
        'translate-entity',
      ]
    > &
      Schema.Attribute.Required;
    settings: Schema.Attribute.Component<'queue.settings', false>;
  };
}

export interface QueueSettings extends Struct.ComponentSchema {
  collectionName: 'components_queue_settings';
  info: {
    description: 'Advanced BullMQ settings';
    displayName: 'Settings';
    icon: 'sliders-h';
  };
  attributes: {
    removeOnComplete: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    removeOnFail: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    retryAttempts: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    retryDelay: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1000>;
    timeout: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface WorldNoiseConfig extends Struct.ComponentSchema {
  collectionName: 'components_world_noise_configs';
  info: {
    description: 'Procedural generation noise settings for biomes';
    displayName: 'Noise Config';
  };
  attributes: {
    height_offset: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    lacunarity: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>;
    octaves: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    persistence: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    scale: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<1>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'game.action': GameAction;
      'game.appearance': GameAppearance;
      'game.area-effect': GameAreaEffect;
      'game.casting-config': GameCastingConfig;
      'game.character-class': GameCharacterClass;
      'game.class-progression': GameClassProgression;
      'game.compilation-state': GameCompilationState;
      'game.computed-action': GameComputedAction;
      'game.condition-instance': GameConditionInstance;
      'game.damage-dice': GameDamageDice;
      'game.damage-instance': GameDamageInstance;
      'game.damage-modifier': GameDamageModifier;
      'game.dm-style': GameDmStyle;
      'game.duration-config': GameDurationConfig;
      'game.equipment-data': GameEquipmentData;
      'game.feature': GameFeature;
      'game.inventory-item': GameInventoryItem;
      'game.mechanics-config': GameMechanicsConfig;
      'game.player': GamePlayer;
      'game.position': GamePosition;
      'game.range-config': GameRangeConfig;
      'game.resource-pool': GameResourcePool;
      'game.save-bonus': GameSaveBonus;
      'game.save-dc': GameSaveDc;
      'game.scaling-config': GameScalingConfig;
      'game.skill-bonus': GameSkillBonus;
      'game.spell-components': GameSpellComponents;
      'game.spell-data': GameSpellData;
      'game.spellbook': GameSpellbook;
      'game.stats': GameStats;
      'queue.config': QueueConfig;
      'queue.settings': QueueSettings;
      'world.noise-config': WorldNoiseConfig;
    }
  }
}
