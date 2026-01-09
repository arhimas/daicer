import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::api-token-permission'>;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token-permission'> & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> & Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    deviceId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime & Schema.Attribute.Required & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> & Schema.Attribute.Private;
    origin: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private & Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    userId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token-permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token-permission'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.Private & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.Private & Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> & Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiActionAction extends Struct.CollectionTypeSchema {
  collectionName: 'actions';
  info: {
    description: 'Reusable Action Definitions (Rich Structure - Spell Parity)';
    displayName: 'Action';
    pluralName: 'actions';
    singularName: 'action';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    condition_instances: Schema.Attribute.Component<'game.condition-instance', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    damage_instances: Schema.Attribute.Component<'game.damage-instance', true>;
    description: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::action.action'> & Schema.Attribute.Private;
    mechanics_config: Schema.Attribute.Component<'game.mechanics-config', false>;
    name: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    range_config: Schema.Attribute.Component<'game.range-config', false>;
    save: Schema.Attribute.Component<'game.save-dc', false>;
    slug: Schema.Attribute.UID<'name'>;
    toHit: Schema.Attribute.Integer;
    type: Schema.Attribute.Enumeration<['melee', 'ranged', 'spell', 'utility', 'ability']> &
      Schema.Attribute.DefaultTo<'melee'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiCharacterCharacter extends Struct.CollectionTypeSchema {
  collectionName: 'characters';
  info: {
    description: 'Blueprint for a character';
    displayName: 'Character';
    pluralName: 'characters';
    singularName: 'character';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actions: Schema.Attribute.Relation<'oneToMany', 'api::action.action'>;
    appearance: Schema.Attribute.JSON;
    backstory: Schema.Attribute.Text;
    classes: Schema.Attribute.Component<'game.character-class', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    fullBody: Schema.Attribute.Media<'images'>;
    inventory: Schema.Attribute.Component<'game.inventory-item', true>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::character.character'> & Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    portrait: Schema.Attribute.Media<'images'>;
    publishedAt: Schema.Attribute.DateTime;
    race: Schema.Attribute.Relation<'manyToOne', 'api::race.race'>;
    spells: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    stats: Schema.Attribute.Component<'game.stats', false>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    upperBody: Schema.Attribute.Media<'images'>;
    user: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.user'>;
  };
}

export interface ApiClassClass extends Struct.CollectionTypeSchema {
  collectionName: 'classes';
  info: {
    description: 'D&D 5e Character Classes';
    displayName: 'Class';
    pluralName: 'classes';
    singularName: 'class';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    features: Schema.Attribute.Component<'game.feature', true>;
    hit_die: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::class.class'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    proficiencies: Schema.Attribute.Relation<'manyToMany', 'api::proficiency.proficiency'>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    subclasses: Schema.Attribute.Relation<'oneToMany', 'api::subclass.subclass'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiDamageTypeDamageType extends Struct.CollectionTypeSchema {
  collectionName: 'damage_types';
  info: {
    description: 'Types of damage in the game';
    displayName: 'Damage Type';
    pluralName: 'damage-types';
    singularName: 'damage-type';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::damage-type.damage-type'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiDmSettingDmSetting extends Struct.CollectionTypeSchema {
  collectionName: 'dm_settings';
  info: {
    description: 'Narrative and Game Style settings for the DM AI';
    displayName: 'DM Setting';
    pluralName: 'dm-settings';
    singularName: 'dm-setting';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    adventureLength: Schema.Attribute.Enumeration<['flash', 'short', 'medium', 'long', 'epic', 'legendary']> &
      Schema.Attribute.DefaultTo<'short'>;
    attributePointBudget: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<27>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    difficulty: Schema.Attribute.Enumeration<['storyteller', 'easy', 'medium', 'challenging', 'gritty', 'deadly']> &
      Schema.Attribute.DefaultTo<'easy'>;
    dmStyle: Schema.Attribute.Component<'game.dm-style', false>;
    dmSystemPrompt: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::dm-setting.dm-setting'> & Schema.Attribute.Private;
    playerCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.Relation<'oneToOne', 'api::room.room'>;
    setting: Schema.Attribute.String;
    startingLevel: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    theme: Schema.Attribute.String;
    tone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiEntitySheetEntitySheet extends Struct.CollectionTypeSchema {
  collectionName: 'character_sheets';
  info: {
    description: 'Instance of an entity in a game room';
    displayName: 'Entity Sheet';
    pluralName: 'entity-sheets';
    singularName: 'entity-sheet';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    ac: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    actions: Schema.Attribute.Relation<'manyToMany', 'api::action.action'>;
    appearance: Schema.Attribute.JSON;
    backstory: Schema.Attribute.Text;
    character: Schema.Attribute.Relation<'manyToOne', 'api::character.character'>;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    currentHp: Schema.Attribute.Integer;
    experience: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    features: Schema.Attribute.Relation<'manyToMany', 'api::feature.feature'>;
    inventory: Schema.Attribute.Component<'game.inventory-item', true>;
    languages: Schema.Attribute.Relation<'manyToMany', 'api::language.language'>;
    level: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::entity-sheet.entity-sheet'> & Schema.Attribute.Private;
    maxHp: Schema.Attribute.Integer;
    monster: Schema.Attribute.Relation<'manyToOne', 'api::monster.monster'>;
    name: Schema.Attribute.String;
    owner: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.user'>;
    position: Schema.Attribute.Component<'game.position', false>;
    proficiencies: Schema.Attribute.Relation<'manyToMany', 'api::proficiency.proficiency'>;
    publishedAt: Schema.Attribute.DateTime;
    race: Schema.Attribute.Relation<'manyToOne', 'api::race.race'>;
    room: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    spellbook: Schema.Attribute.Component<'game.spellbook', false>;
    stats: Schema.Attribute.Component<'game.stats', false>;
    traits: Schema.Attribute.Relation<'manyToMany', 'api::trait.trait'>;
    type: Schema.Attribute.Enumeration<['player', 'monster', 'npc']> & Schema.Attribute.DefaultTo<'player'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiEquipmentCategoryEquipmentCategory extends Struct.CollectionTypeSchema {
  collectionName: 'equipment_categories';
  info: {
    description: 'Categories for equipment items';
    displayName: 'Equipment Category';
    pluralName: 'equipment-categories';
    singularName: 'equipment-category';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::equipment-category.equipment-category'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiEquipmentEquipment extends Struct.CollectionTypeSchema {
  collectionName: 'equipments';
  info: {
    description: 'Weapons, armor, and adventuring gear';
    displayName: 'Equipment';
    pluralName: 'equipments';
    singularName: 'equipment';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<'oneToMany', 'api::action.action'>;
    armor_class_base: Schema.Attribute.Integer;
    armor_class_dex_bonus: Schema.Attribute.Boolean;
    cost_quantity: Schema.Attribute.Integer;
    cost_unit: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    damage_dice: Schema.Attribute.String;
    damage_type: Schema.Attribute.Relation<'oneToOne', 'api::damage-type.damage-type'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    embeddingMetadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    equipment_category: Schema.Attribute.Relation<'manyToOne', 'api::equipment-category.equipment-category'>;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::equipment.equipment'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    properties: Schema.Attribute.Relation<'manyToMany', 'api::weapon-property.weapon-property'>;
    publishedAt: Schema.Attribute.DateTime;
    range_long: Schema.Attribute.Integer;
    range_normal: Schema.Attribute.Integer;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    spells: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    stealth_disadvantage: Schema.Attribute.Boolean;
    str_minimum: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    versatile_damage: Schema.Attribute.String;
    weight: Schema.Attribute.Float;
  };
}

export interface ApiFeatureFeature extends Struct.CollectionTypeSchema {
  collectionName: 'features';
  info: {
    description: 'D&D 5e Class Features';
    displayName: 'Feature';
    pluralName: 'features';
    singularName: 'feature';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    level: Schema.Attribute.Integer;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::feature.feature'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiGameEventGameEvent extends Struct.CollectionTypeSchema {
  collectionName: 'game_events';
  info: {
    description: 'Immutable log of game actions for Time Machine functionality';
    displayName: 'Game Event';
    pluralName: 'game-events';
    singularName: 'game-event';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actorId: Schema.Attribute.String;
    causalityId: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    delta: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::game-event.game-event'> & Schema.Attribute.Private;
    meta: Schema.Attribute.JSON;
    payload: Schema.Attribute.JSON & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    seed: Schema.Attribute.Integer;
    sequenceId: Schema.Attribute.BigInteger;
    timeFrames: Schema.Attribute.Relation<'manyToMany', 'api::time-frame.time-frame'>;
    timestamp: Schema.Attribute.BigInteger & Schema.Attribute.Required;
    turnNumber: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    type: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiKnowledgeSnippetKnowledgeSnippet extends Struct.CollectionTypeSchema {
  collectionName: 'knowledge_snippets';
  info: {
    description: 'A chunk of knowledge derived from a source.';
    displayName: 'Knowledge Snippet';
    pluralName: 'knowledge-snippets';
    singularName: 'knowledge-snippet';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::knowledge-snippet.knowledge-snippet'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    source: Schema.Attribute.Relation<'manyToOne', 'api::knowledge-source.knowledge-source'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiKnowledgeSourceKnowledgeSource extends Struct.CollectionTypeSchema {
  collectionName: 'knowledge_sources';
  info: {
    description: 'A source of knowledge, usually a markdown file.';
    displayName: 'Knowledge Source';
    pluralName: 'knowledge-sources';
    singularName: 'knowledge-source';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    embeddingMetadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::knowledge-source.knowledge-source'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Unique;
    origin: Schema.Attribute.Enumeration<['manual', 'entity']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'manual'>;
    publishedAt: Schema.Attribute.DateTime;
    snippets: Schema.Attribute.Relation<'oneToMany', 'api::knowledge-snippet.knowledge-snippet'>;
    tags: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiLanguageLanguage extends Struct.CollectionTypeSchema {
  collectionName: 'languages';
  info: {
    description: 'Languages spoken in the world';
    displayName: 'Language';
    pluralName: 'languages';
    singularName: 'language';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    is_rare: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    note: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiMagicItemMagicItem extends Struct.CollectionTypeSchema {
  collectionName: 'magic_items';
  info: {
    description: 'Magical items and artifacts (Structured)';
    displayName: 'Magic Item';
    pluralName: 'magic-items';
    singularName: 'magic-item';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    active_abilities: Schema.Attribute.Component<'game.action', true>;
    attunement_condition: Schema.Attribute.String;
    attunement_required: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    base_item: Schema.Attribute.Relation<'oneToOne', 'api::equipment.equipment'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    embeddingMetadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    equipment_category: Schema.Attribute.Relation<'manyToOne', 'api::equipment-category.equipment-category'>;
    has_charges: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'>;
    image_url: Schema.Attribute.String;
    is_variant: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::magic-item.magic-item'>;
    max_charges: Schema.Attribute.Integer;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    rarity: Schema.Attribute.Enumeration<
      ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies']
    >;
    recharge_formula: Schema.Attribute.String;
    recharge_trigger: Schema.Attribute.Enumeration<['Dawn', 'Dusk', 'Short Rest', 'Long Rest', 'Special']>;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiMagicSchoolMagicSchool extends Struct.CollectionTypeSchema {
  collectionName: 'magic_schools';
  info: {
    description: 'Schools of magic';
    displayName: 'Magic School';
    pluralName: 'magic-schools';
    singularName: 'magic-school';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::magic-school.magic-school'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiMessageMessage extends Struct.CollectionTypeSchema {
  collectionName: 'messages';
  info: {
    description: 'Individual communication unit';
    displayName: 'Message';
    pluralName: 'messages';
    singularName: 'message';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    images: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::message.message'> & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    recipient: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.user'>;
    room: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    senderName: Schema.Attribute.String;
    senderType: Schema.Attribute.Enumeration<['dm', 'player', 'system']> & Schema.Attribute.DefaultTo<'system'>;
    timestamp: Schema.Attribute.BigInteger;
    turn: Schema.Attribute.Relation<'manyToOne', 'api::turn.turn'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiMonsterMonster extends Struct.CollectionTypeSchema {
  collectionName: 'monsters';
  info: {
    description: 'D&D 5e Monsters';
    displayName: 'Monster';
    pluralName: 'monsters';
    singularName: 'monster';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ac: Schema.Attribute.Integer;
    actions: Schema.Attribute.Relation<'oneToMany', 'api::action.action'>;
    alignment: Schema.Attribute.String;
    challenge_rating: Schema.Attribute.Decimal;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    embeddingMetadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    features: Schema.Attribute.Relation<'manyToMany', 'api::feature.feature'>;
    hit_dice: Schema.Attribute.String;
    hp: Schema.Attribute.Integer;
    image: Schema.Attribute.Media<'images'>;
    inventory: Schema.Attribute.Component<'game.inventory-item', true>;
    languages: Schema.Attribute.Relation<'manyToMany', 'api::language.language'>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::monster.monster'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    proficiencies: Schema.Attribute.Relation<'manyToMany', 'api::proficiency.proficiency'>;
    publishedAt: Schema.Attribute.DateTime;
    size: Schema.Attribute.Enumeration<['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']>;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    spells: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    stats: Schema.Attribute.Component<'game.stats', false>;
    traits: Schema.Attribute.Relation<'manyToMany', 'api::trait.trait'>;
    type: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    xp: Schema.Attribute.Integer;
  };
}

export interface ApiProficiencyProficiency extends Struct.CollectionTypeSchema {
  collectionName: 'proficiencies';
  info: {
    description: 'Character proficiencies';
    displayName: 'Proficiency';
    pluralName: 'proficiencies';
    singularName: 'proficiency';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    classes: Schema.Attribute.Relation<'manyToMany', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::proficiency.proficiency'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    races: Schema.Attribute.Relation<'manyToMany', 'api::race.race'>;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    traits: Schema.Attribute.Relation<'manyToMany', 'api::trait.trait'>;
    type: Schema.Attribute.Enumeration<
      [
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
      ]
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiPromptPrompt extends Struct.CollectionTypeSchema {
  collectionName: 'prompts';
  info: {
    description: 'AI Prompts for i18n';
    displayName: 'Prompt';
    pluralName: 'prompts';
    singularName: 'prompt';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    category: Schema.Attribute.Enumeration<['system', 'user', 'gameplay']> & Schema.Attribute.DefaultTo<'system'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    key: Schema.Attribute.UID & Schema.Attribute.Required & Schema.Attribute.Unique;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::prompt.prompt'>;
    publishedAt: Schema.Attribute.DateTime;
    text: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiRaceRace extends Struct.CollectionTypeSchema {
  collectionName: 'races';
  info: {
    description: 'D&D 5e Races';
    displayName: 'Race';
    pluralName: 'races';
    singularName: 'race';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::race.race'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    proficiencies: Schema.Attribute.Relation<'manyToMany', 'api::proficiency.proficiency'>;
    publishedAt: Schema.Attribute.DateTime;
    size: Schema.Attribute.Enumeration<['Tiny', 'Small', 'Medium', 'Large']>;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    speed: Schema.Attribute.JSON;
    traits: Schema.Attribute.Relation<'manyToMany', 'api::trait.trait'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiRoomRoom extends Struct.CollectionTypeSchema {
  collectionName: 'rooms';
  info: {
    description: 'Game room state';
    displayName: 'Room';
    pluralName: 'rooms';
    singularName: 'room';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    currentTimeFrame: Schema.Attribute.Relation<'oneToOne', 'api::time-frame.time-frame'>;
    dmSettings: Schema.Attribute.Relation<'oneToOne', 'api::dm-setting.dm-setting'>;
    entity_sheets: Schema.Attribute.Relation<'oneToMany', 'api::entity-sheet.entity-sheet'>;
    entropyState: Schema.Attribute.JSON;
    events: Schema.Attribute.Relation<'oneToMany', 'api::game-event.game-event'>;
    exploredTiles: Schema.Attribute.JSON;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::room.room'> & Schema.Attribute.Private;
    messages: Schema.Attribute.Relation<'oneToMany', 'api::message.message'>;
    owner: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.user'>;
    phase: Schema.Attribute.Enumeration<
      ['lobby', 'character_creation', 'world_generation', 'gameplay', 'combat', 'ending']
    > &
      Schema.Attribute.DefaultTo<'lobby'>;
    players: Schema.Attribute.Component<'game.player', true>;
    publishedAt: Schema.Attribute.DateTime;
    roomId: Schema.Attribute.UID & Schema.Attribute.Unique;
    timeFrames: Schema.Attribute.Relation<'oneToMany', 'api::time-frame.time-frame'>;
    turnData: Schema.Attribute.JSON;
    turns: Schema.Attribute.Relation<'oneToMany', 'api::turn.turn'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    world: Schema.Attribute.Relation<'oneToOne', 'api::world.world'>;
  };
}

export interface ApiSpellSpell extends Struct.CollectionTypeSchema {
  collectionName: 'spells';
  info: {
    description: 'D&D 5e Spells (Structured)';
    displayName: 'Spell';
    pluralName: 'spells';
    singularName: 'spell';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    casting_config: Schema.Attribute.Component<'game.casting-config', false>;
    condition_instances: Schema.Attribute.Component<'game.condition-instance', true>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    damage_instances: Schema.Attribute.Component<'game.damage-instance', true>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    duration_config: Schema.Attribute.Component<'game.duration-config', false>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    embeddingMetadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 9;
          min: 0;
        },
        number
      >;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::spell.spell'>;
    mechanics_config: Schema.Attribute.Component<'game.mechanics-config', false>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    range_config: Schema.Attribute.Component<'game.range-config', false>;
    scaling_config: Schema.Attribute.Component<'game.scaling-config', false>;
    school: Schema.Attribute.Enumeration<
      ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
    >;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiSubclassSubclass extends Struct.CollectionTypeSchema {
  collectionName: 'subclasses';
  info: {
    description: 'D&D 5e Class Subclasses';
    displayName: 'Subclass';
    pluralName: 'subclasses';
    singularName: 'subclass';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::subclass.subclass'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    subclass_flavor: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiTimeFrameTimeFrame extends Struct.CollectionTypeSchema {
  collectionName: 'time_frames';
  info: {
    description: 'Snapshot of game state at a specific point in time';
    displayName: 'Time Frame';
    pluralName: 'time-frames';
    singularName: 'time-frame';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    entropySnapshot: Schema.Attribute.JSON;
    events: Schema.Attribute.Relation<'manyToMany', 'api::game-event.game-event'>;
    gameState: Schema.Attribute.JSON & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::time-frame.time-frame'> & Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    timestamp: Schema.Attribute.DateTime & Schema.Attribute.Required;
    turnNumber: Schema.Attribute.Integer & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiTraitTrait extends Struct.CollectionTypeSchema {
  collectionName: 'traits';
  info: {
    description: 'D&D 5e Racial Traits';
    displayName: 'Trait';
    pluralName: 'traits';
    singularName: 'trait';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::trait.trait'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    proficiencies: Schema.Attribute.Relation<'manyToMany', 'api::proficiency.proficiency'>;
    publishedAt: Schema.Attribute.DateTime;
    races: Schema.Attribute.Relation<'manyToMany', 'api::race.race'>;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiTurnTurn extends Struct.CollectionTypeSchema {
  collectionName: 'turns';
  info: {
    description: 'A discrete cycle of gameplay history';
    displayName: 'Turn';
    pluralName: 'turns';
    singularName: 'turn';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actions: Schema.Attribute.JSON;
    characterSnapshots: Schema.Attribute.JSON;
    contextImage: Schema.Attribute.Relation<'oneToOne', 'plugin::upload.file'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::turn.turn'> & Schema.Attribute.Private;
    messages: Schema.Attribute.Relation<'oneToMany', 'api::message.message'>;
    metadata: Schema.Attribute.JSON;
    narrative: Schema.Attribute.RichText;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.Relation<'manyToOne', 'api::room.room'>;
    status: Schema.Attribute.Enumeration<['waiting', 'processing', 'complete']> & Schema.Attribute.DefaultTo<'waiting'>;
    turnNumber: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.DefaultTo<0>;
    type: Schema.Attribute.Enumeration<['group', 'combat', 'exploration']> & Schema.Attribute.DefaultTo<'group'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiWeaponPropertyWeaponProperty extends Struct.CollectionTypeSchema {
  collectionName: 'weapon_properties';
  info: {
    description: 'Properties affecting weapon usage';
    displayName: 'Weapon Property';
    pluralName: 'weapon-properties';
    singularName: 'weapon-property';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    embedding: Schema.Attribute.JSON & Schema.Attribute.Private;
    image: Schema.Attribute.Media<'images'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::weapon-property.weapon-property'>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface ApiWorldWorld extends Struct.CollectionTypeSchema {
  collectionName: 'worlds';
  info: {
    description: 'World configuration and generated lore';
    displayName: 'World';
    pluralName: 'worlds';
    singularName: 'world';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    adventureLength: Schema.Attribute.Enumeration<['flash', 'short', 'medium', 'long', 'epic', 'legendary']> &
      Schema.Attribute.DefaultTo<'short'>;
    chunkSize: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<32>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.RichText;
    detail: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    elevationScale: Schema.Attribute.Float;
    fogRadius: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    globalScale: Schema.Attribute.Float;
    history: Schema.Attribute.RichText;
    language: Schema.Attribute.String & Schema.Attribute.DefaultTo<'en-US'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::world.world'> & Schema.Attribute.Private;
    moistureScale: Schema.Attribute.Float;
    name: Schema.Attribute.String & Schema.Attribute.DefaultTo<'New World'>;
    publishedAt: Schema.Attribute.DateTime;
    roadDensity: Schema.Attribute.Float;
    room: Schema.Attribute.Relation<'oneToOne', 'api::room.room'>;
    roughness: Schema.Attribute.Float;
    seaLevel: Schema.Attribute.Float;
    seed: Schema.Attribute.String;
    structureChance: Schema.Attribute.Float;
    structureSizeAvg: Schema.Attribute.Integer;
    structureSpacing: Schema.Attribute.Integer;
    temperatureOffset: Schema.Attribute.Float;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    worldBackground: Schema.Attribute.RichText;
    worldSize: Schema.Attribute.Enumeration<['intimate', 'small', 'medium', 'large', 'vast', 'epic']> &
      Schema.Attribute.DefaultTo<'small'>;
    worldType: Schema.Attribute.String & Schema.Attribute.DefaultTo<'terra'>;
  };
}

export interface PluginContentReleasesRelease extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release-action'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<['ready', 'blocked', 'failed', 'done', 'empty']> & Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release-action'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<'manyToOne', 'plugin::content-releases.release'>;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::i18n.locale'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON & Schema.Attribute.Required & Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<'oneToOne', 'plugin::review-workflows.workflow-stage'>;
    stages: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow-stage'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow-stage'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<'manyToOne', 'plugin::review-workflows.workflow'>;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> & Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'> & Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::users-permissions.permission'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.role'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::users-permissions.role'> & Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'plugin::users-permissions.permission'>;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'oneToMany', 'plugin::users-permissions.user'>;
  };
}

export interface PluginUsersPermissionsUser extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    characters: Schema.Attribute.Relation<'oneToMany', 'api::character.character'>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::users-permissions.user'> & Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<'manyToOne', 'plugin::users-permissions.role'>;
    rooms: Schema.Attribute.Relation<'oneToMany', 'api::room.room'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::action.action': ApiActionAction;
      'api::character.character': ApiCharacterCharacter;
      'api::class.class': ApiClassClass;
      'api::damage-type.damage-type': ApiDamageTypeDamageType;
      'api::dm-setting.dm-setting': ApiDmSettingDmSetting;
      'api::entity-sheet.entity-sheet': ApiEntitySheetEntitySheet;
      'api::equipment-category.equipment-category': ApiEquipmentCategoryEquipmentCategory;
      'api::equipment.equipment': ApiEquipmentEquipment;
      'api::feature.feature': ApiFeatureFeature;
      'api::game-event.game-event': ApiGameEventGameEvent;
      'api::knowledge-snippet.knowledge-snippet': ApiKnowledgeSnippetKnowledgeSnippet;
      'api::knowledge-source.knowledge-source': ApiKnowledgeSourceKnowledgeSource;
      'api::language.language': ApiLanguageLanguage;
      'api::magic-item.magic-item': ApiMagicItemMagicItem;
      'api::magic-school.magic-school': ApiMagicSchoolMagicSchool;
      'api::message.message': ApiMessageMessage;
      'api::monster.monster': ApiMonsterMonster;
      'api::proficiency.proficiency': ApiProficiencyProficiency;
      'api::prompt.prompt': ApiPromptPrompt;
      'api::race.race': ApiRaceRace;
      'api::room.room': ApiRoomRoom;
      'api::spell.spell': ApiSpellSpell;
      'api::subclass.subclass': ApiSubclassSubclass;
      'api::time-frame.time-frame': ApiTimeFrameTimeFrame;
      'api::trait.trait': ApiTraitTrait;
      'api::turn.turn': ApiTurnTurn;
      'api::weapon-property.weapon-property': ApiWeaponPropertyWeaponProperty;
      'api::world.world': ApiWorldWorld;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
