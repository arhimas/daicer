/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  Long: { input: any; output: any; }
};

export type Ability = {
  __typename?: 'Ability';
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  skills?: Maybe<Array<Maybe<Skill>>>;
};

export type Action = {
  __typename?: 'Action';
  condition_instances?: Maybe<Array<Maybe<ComponentGameConditionInstance>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  damage_instances?: Maybe<Array<Maybe<ComponentGameDamageInstance>>>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  mechanics_config?: Maybe<ComponentGameMechanicsConfig>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  range_config?: Maybe<ComponentGameRangeConfig>;
  save?: Maybe<ComponentGameSaveDc>;
  slug?: Maybe<Scalars['String']['output']>;
  toHit?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Enum_Action_Type>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ActionCondition_InstancesArgs = {
  filters?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ActionDamage_InstancesArgs = {
  filters?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ActionEntityResponseCollection = {
  __typename?: 'ActionEntityResponseCollection';
  nodes: Array<Action>;
  pageInfo: Pagination;
};

export type ActionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ActionFiltersInput>>>;
  condition_instances?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  damage_instances?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  mechanics_config?: InputMaybe<ComponentGameMechanicsConfigFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ActionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ActionFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  range_config?: InputMaybe<ComponentGameRangeConfigFiltersInput>;
  save?: InputMaybe<ComponentGameSaveDcFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  toHit?: InputMaybe<IntFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ActionInput = {
  condition_instances?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceInput>>>;
  damage_instances?: InputMaybe<Array<InputMaybe<ComponentGameDamageInstanceInput>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  mechanics_config?: InputMaybe<ComponentGameMechanicsConfigInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  range_config?: InputMaybe<ComponentGameRangeConfigInput>;
  save?: InputMaybe<ComponentGameSaveDcInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
  toHit?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Enum_Action_Type>;
};

export type ActionRelationResponseCollection = {
  __typename?: 'ActionRelationResponseCollection';
  nodes: Array<Action>;
};

export type AgentLog = {
  __typename?: 'AgentLog';
  actorId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  payload?: Maybe<Scalars['JSON']['output']>;
  sequenceId?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type AgentToolDefinition = {
  __typename?: 'AgentToolDefinition';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parameters?: Maybe<Scalars['JSON']['output']>;
};

export type Alignment = {
  __typename?: 'Alignment';
  abbreviation?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Background = {
  __typename?: 'Background';
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  skillProficiencies?: Maybe<Array<Maybe<Skill>>>;
};

export type BooleanFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  contains?: InputMaybe<Scalars['Boolean']['input']>;
  containsi?: InputMaybe<Scalars['Boolean']['input']>;
  endsWith?: InputMaybe<Scalars['Boolean']['input']>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  eqi?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  nei?: InputMaybe<Scalars['Boolean']['input']>;
  not?: InputMaybe<BooleanFilterInput>;
  notContains?: InputMaybe<Scalars['Boolean']['input']>;
  notContainsi?: InputMaybe<Scalars['Boolean']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  startsWith?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Character = {
  __typename?: 'Character';
  actions: Array<Maybe<Action>>;
  actions_connection?: Maybe<ActionRelationResponseCollection>;
  appearance?: Maybe<Scalars['JSON']['output']>;
  backstory?: Maybe<Scalars['String']['output']>;
  classes?: Maybe<Array<Maybe<ComponentGameCharacterClass>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  fullBody?: Maybe<UploadFile>;
  inventory?: Maybe<Array<Maybe<ComponentGameInventoryItem>>>;
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  portrait?: Maybe<UploadFile>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  race?: Maybe<Race>;
  spells: Array<Maybe<Spell>>;
  spells_connection?: Maybe<SpellRelationResponseCollection>;
  stats?: Maybe<ComponentGameStats>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  upperBody?: Maybe<UploadFile>;
  user?: Maybe<UsersPermissionsUser>;
};


export type CharacterActionsArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CharacterActions_ConnectionArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CharacterClassesArgs = {
  filters?: InputMaybe<ComponentGameCharacterClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CharacterInventoryArgs = {
  filters?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CharacterSpellsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CharacterSpells_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CharacterEntityResponseCollection = {
  __typename?: 'CharacterEntityResponseCollection';
  nodes: Array<Character>;
  pageInfo: Pagination;
};

export type CharacterFiltersInput = {
  actions?: InputMaybe<ActionFiltersInput>;
  and?: InputMaybe<Array<InputMaybe<CharacterFiltersInput>>>;
  appearance?: InputMaybe<JsonFilterInput>;
  backstory?: InputMaybe<StringFilterInput>;
  classes?: InputMaybe<ComponentGameCharacterClassFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  inventory?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<CharacterFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<CharacterFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  race?: InputMaybe<RaceFiltersInput>;
  spells?: InputMaybe<SpellFiltersInput>;
  stats?: InputMaybe<ComponentGameStatsFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  user?: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type CharacterInput = {
  actions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  appearance?: InputMaybe<Scalars['JSON']['input']>;
  backstory?: InputMaybe<Scalars['String']['input']>;
  classes?: InputMaybe<Array<InputMaybe<ComponentGameCharacterClassInput>>>;
  fullBody?: InputMaybe<Scalars['ID']['input']>;
  inventory?: InputMaybe<Array<InputMaybe<ComponentGameInventoryItemInput>>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  portrait?: InputMaybe<Scalars['ID']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  race?: InputMaybe<Scalars['ID']['input']>;
  spells?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  stats?: InputMaybe<ComponentGameStatsInput>;
  upperBody?: InputMaybe<Scalars['ID']['input']>;
  user?: InputMaybe<Scalars['ID']['input']>;
};

export type CharacterRelationResponseCollection = {
  __typename?: 'CharacterRelationResponseCollection';
  nodes: Array<Character>;
};

export type ChunkRequestInput = {
  x: Scalars['Int']['input'];
  y: Scalars['Int']['input'];
};

export type Class = {
  __typename?: 'Class';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  features?: Maybe<Array<Maybe<ComponentGameFeature>>>;
  hit_die?: Maybe<Scalars['String']['output']>;
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Class>>;
  localizations_connection?: Maybe<ClassRelationResponseCollection>;
  name: Scalars['String']['output'];
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyRelationResponseCollection>;
  progression?: Maybe<Array<Maybe<ComponentGameClassProgression>>>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  subclasses: Array<Maybe<Subclass>>;
  subclasses_connection?: Maybe<SubclassRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ClassFeaturesArgs = {
  filters?: InputMaybe<ComponentGameFeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassLocalizationsArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassLocalizations_ConnectionArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassProgressionArgs = {
  filters?: InputMaybe<ComponentGameClassProgressionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassSubclassesArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ClassSubclasses_ConnectionArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ClassEntityResponseCollection = {
  __typename?: 'ClassEntityResponseCollection';
  nodes: Array<Class>;
  pageInfo: Pagination;
};

export type ClassFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ClassFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  features?: InputMaybe<ComponentGameFeatureFiltersInput>;
  hit_die?: InputMaybe<StringFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<ClassFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ClassFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ClassFiltersInput>>>;
  proficiencies?: InputMaybe<ProficiencyFiltersInput>;
  progression?: InputMaybe<ComponentGameClassProgressionFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  subclasses?: InputMaybe<SubclassFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ClassInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<ComponentGameFeatureInput>>>;
  hit_die?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proficiencies?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  progression?: InputMaybe<Array<InputMaybe<ComponentGameClassProgressionInput>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  subclasses?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ClassRelationResponseCollection = {
  __typename?: 'ClassRelationResponseCollection';
  nodes: Array<Class>;
};

export type ComponentGameAction = {
  __typename?: 'ComponentGameAction';
  action_definition?: Maybe<Action>;
  area?: Maybe<ComponentGameAreaEffect>;
  damage?: Maybe<Array<Maybe<ComponentGameDamageInstance>>>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Enum_Componentgameaction_Duration>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  reach?: Maybe<Scalars['Int']['output']>;
  save?: Maybe<ComponentGameSaveDc>;
  spell_definition?: Maybe<Spell>;
  toHit?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Enum_Componentgameaction_Type>;
};


export type ComponentGameActionDamageArgs = {
  filters?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameAppearance = {
  __typename?: 'ComponentGameAppearance';
  age?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  eyes?: Maybe<Scalars['String']['output']>;
  hair?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  skin?: Maybe<Scalars['String']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type ComponentGameAppearanceFiltersInput = {
  age?: InputMaybe<IntFilterInput>;
  and?: InputMaybe<Array<InputMaybe<ComponentGameAppearanceFiltersInput>>>;
  description?: InputMaybe<StringFilterInput>;
  eyes?: InputMaybe<StringFilterInput>;
  hair?: InputMaybe<StringFilterInput>;
  height?: InputMaybe<FloatFilterInput>;
  not?: InputMaybe<ComponentGameAppearanceFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameAppearanceFiltersInput>>>;
  skin?: InputMaybe<StringFilterInput>;
  weight?: InputMaybe<FloatFilterInput>;
};

export type ComponentGameAppearanceInput = {
  age?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eyes?: InputMaybe<Scalars['String']['input']>;
  hair?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  skin?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type ComponentGameAreaEffect = {
  __typename?: 'ComponentGameAreaEffect';
  id: Scalars['ID']['output'];
  shape: Enum_Componentgameareaeffect_Shape;
  size: Scalars['Int']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type ComponentGameCastingConfig = {
  __typename?: 'ComponentGameCastingConfig';
  components?: Maybe<ComponentGameSpellComponents>;
  id: Scalars['ID']['output'];
  is_concentration?: Maybe<Scalars['Boolean']['output']>;
  is_ritual?: Maybe<Scalars['Boolean']['output']>;
  reaction_trigger?: Maybe<Scalars['String']['output']>;
  time_unit: Enum_Componentgamecastingconfig_Time_Unit;
  time_value: Scalars['Int']['output'];
};

export type ComponentGameCastingConfigFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameCastingConfigFiltersInput>>>;
  components?: InputMaybe<ComponentGameSpellComponentsFiltersInput>;
  is_concentration?: InputMaybe<BooleanFilterInput>;
  is_ritual?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentGameCastingConfigFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameCastingConfigFiltersInput>>>;
  reaction_trigger?: InputMaybe<StringFilterInput>;
  time_unit?: InputMaybe<StringFilterInput>;
  time_value?: InputMaybe<IntFilterInput>;
};

export type ComponentGameCastingConfigInput = {
  components?: InputMaybe<ComponentGameSpellComponentsInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
  is_concentration?: InputMaybe<Scalars['Boolean']['input']>;
  is_ritual?: InputMaybe<Scalars['Boolean']['input']>;
  reaction_trigger?: InputMaybe<Scalars['String']['input']>;
  time_unit?: InputMaybe<Enum_Componentgamecastingconfig_Time_Unit>;
  time_value?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameCharacterClass = {
  __typename?: 'ComponentGameCharacterClass';
  class?: Maybe<Class>;
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  subclass?: Maybe<Subclass>;
};

export type ComponentGameCharacterClassFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameCharacterClassFiltersInput>>>;
  class?: InputMaybe<ClassFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameCharacterClassFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameCharacterClassFiltersInput>>>;
  subclass?: InputMaybe<SubclassFiltersInput>;
};

export type ComponentGameCharacterClassInput = {
  class?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  subclass?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentGameClassProgression = {
  __typename?: 'ComponentGameClassProgression';
  class_specifics?: Maybe<Scalars['JSON']['output']>;
  features: Array<Maybe<Feature>>;
  features_connection?: Maybe<FeatureRelationResponseCollection>;
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  spell_slots?: Maybe<Scalars['JSON']['output']>;
};


export type ComponentGameClassProgressionFeaturesArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameClassProgressionFeatures_ConnectionArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameClassProgressionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameClassProgressionFiltersInput>>>;
  class_specifics?: InputMaybe<JsonFilterInput>;
  features?: InputMaybe<FeatureFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameClassProgressionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameClassProgressionFiltersInput>>>;
  spell_slots?: InputMaybe<JsonFilterInput>;
};

export type ComponentGameClassProgressionInput = {
  class_specifics?: InputMaybe<Scalars['JSON']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  spell_slots?: InputMaybe<Scalars['JSON']['input']>;
};

export type ComponentGameComputedAction = {
  __typename?: 'ComponentGameComputedAction';
  damageBonus?: Maybe<Scalars['Int']['output']>;
  damageDice?: Maybe<Scalars['String']['output']>;
  damageType?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  range?: Maybe<Scalars['Int']['output']>;
  resourceCost?: Maybe<Scalars['JSON']['output']>;
  saveAbility?: Maybe<Scalars['String']['output']>;
  saveDc?: Maybe<Scalars['Int']['output']>;
  toHit?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Enum_Componentgamecomputedaction_Type>;
};

export type ComponentGameComputedActionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameComputedActionFiltersInput>>>;
  damageBonus?: InputMaybe<IntFilterInput>;
  damageDice?: InputMaybe<StringFilterInput>;
  damageType?: InputMaybe<StringFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameComputedActionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameComputedActionFiltersInput>>>;
  range?: InputMaybe<IntFilterInput>;
  resourceCost?: InputMaybe<JsonFilterInput>;
  saveAbility?: InputMaybe<StringFilterInput>;
  saveDc?: InputMaybe<IntFilterInput>;
  toHit?: InputMaybe<IntFilterInput>;
  type?: InputMaybe<StringFilterInput>;
};

export type ComponentGameComputedActionInput = {
  damageBonus?: InputMaybe<Scalars['Int']['input']>;
  damageDice?: InputMaybe<Scalars['String']['input']>;
  damageType?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  range?: InputMaybe<Scalars['Int']['input']>;
  resourceCost?: InputMaybe<Scalars['JSON']['input']>;
  saveAbility?: InputMaybe<Scalars['String']['input']>;
  saveDc?: InputMaybe<Scalars['Int']['input']>;
  toHit?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Enum_Componentgamecomputedaction_Type>;
};

export type ComponentGameConditionInstance = {
  __typename?: 'ComponentGameConditionInstance';
  chance?: Maybe<Scalars['Int']['output']>;
  condition: Enum_Componentgameconditioninstance_Condition;
  description?: Maybe<Scalars['String']['output']>;
  duration_rounds?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
};

export type ComponentGameConditionInstanceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceFiltersInput>>>;
  chance?: InputMaybe<IntFilterInput>;
  condition?: InputMaybe<StringFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  duration_rounds?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceFiltersInput>>>;
};

export type ComponentGameConditionInstanceInput = {
  chance?: InputMaybe<Scalars['Int']['input']>;
  condition?: InputMaybe<Enum_Componentgameconditioninstance_Condition>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration_rounds?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentGameDamageDice = {
  __typename?: 'ComponentGameDamageDice';
  bonus?: Maybe<Scalars['Int']['output']>;
  dice: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ComponentGameDamageInstance = {
  __typename?: 'ComponentGameDamageInstance';
  damage_type?: Maybe<Enum_Componentgamedamageinstance_Damage_Type>;
  dice_count?: Maybe<Scalars['Int']['output']>;
  dice_value?: Maybe<Scalars['Int']['output']>;
  effect_type: Enum_Componentgamedamageinstance_Effect_Type;
  flat_bonus?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  timing?: Maybe<Enum_Componentgamedamageinstance_Timing>;
};

export type ComponentGameDamageInstanceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameDamageInstanceFiltersInput>>>;
  damage_type?: InputMaybe<StringFilterInput>;
  dice_count?: InputMaybe<IntFilterInput>;
  dice_value?: InputMaybe<IntFilterInput>;
  effect_type?: InputMaybe<StringFilterInput>;
  flat_bonus?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameDamageInstanceFiltersInput>>>;
  timing?: InputMaybe<StringFilterInput>;
};

export type ComponentGameDamageInstanceInput = {
  damage_type?: InputMaybe<Enum_Componentgamedamageinstance_Damage_Type>;
  dice_count?: InputMaybe<Scalars['Int']['input']>;
  dice_value?: InputMaybe<Scalars['Int']['input']>;
  effect_type?: InputMaybe<Enum_Componentgamedamageinstance_Effect_Type>;
  flat_bonus?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  timing?: InputMaybe<Enum_Componentgamedamageinstance_Timing>;
};

export type ComponentGameDamageModifier = {
  __typename?: 'ComponentGameDamageModifier';
  damageType: Enum_Componentgamedamagemodifier_Damagetype;
  id: Scalars['ID']['output'];
  modifier: Enum_Componentgamedamagemodifier_Modifier;
};

export type ComponentGameDamageModifierFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameDamageModifierFiltersInput>>>;
  damageType?: InputMaybe<StringFilterInput>;
  modifier?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameDamageModifierFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameDamageModifierFiltersInput>>>;
};

export type ComponentGameDamageModifierInput = {
  damageType?: InputMaybe<Enum_Componentgamedamagemodifier_Damagetype>;
  id?: InputMaybe<Scalars['ID']['input']>;
  modifier?: InputMaybe<Enum_Componentgamedamagemodifier_Modifier>;
};

export type ComponentGameDmStyle = {
  __typename?: 'ComponentGameDmStyle';
  customDirectives?: Maybe<Scalars['String']['output']>;
  detail?: Maybe<Scalars['Int']['output']>;
  engagement?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  narrative?: Maybe<Scalars['Int']['output']>;
  specialMode?: Maybe<Scalars['String']['output']>;
  verbosity?: Maybe<Scalars['Int']['output']>;
};

export type ComponentGameDmStyleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameDmStyleFiltersInput>>>;
  customDirectives?: InputMaybe<StringFilterInput>;
  detail?: InputMaybe<IntFilterInput>;
  engagement?: InputMaybe<IntFilterInput>;
  narrative?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameDmStyleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameDmStyleFiltersInput>>>;
  specialMode?: InputMaybe<StringFilterInput>;
  verbosity?: InputMaybe<IntFilterInput>;
};

export type ComponentGameDmStyleInput = {
  customDirectives?: InputMaybe<Scalars['String']['input']>;
  detail?: InputMaybe<Scalars['Int']['input']>;
  engagement?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  narrative?: InputMaybe<Scalars['Int']['input']>;
  specialMode?: InputMaybe<Scalars['String']['input']>;
  verbosity?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameDurationConfig = {
  __typename?: 'ComponentGameDurationConfig';
  concentration?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  type: Enum_Componentgamedurationconfig_Type;
  unit?: Maybe<Enum_Componentgamedurationconfig_Unit>;
  value?: Maybe<Scalars['Int']['output']>;
};

export type ComponentGameDurationConfigFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameDurationConfigFiltersInput>>>;
  concentration?: InputMaybe<BooleanFilterInput>;
  not?: InputMaybe<ComponentGameDurationConfigFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameDurationConfigFiltersInput>>>;
  type?: InputMaybe<StringFilterInput>;
  unit?: InputMaybe<StringFilterInput>;
  value?: InputMaybe<IntFilterInput>;
};

export type ComponentGameDurationConfigInput = {
  concentration?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Enum_Componentgamedurationconfig_Type>;
  unit?: InputMaybe<Enum_Componentgamedurationconfig_Unit>;
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameEquipmentData = {
  __typename?: 'ComponentGameEquipmentData';
  actions: Array<Maybe<Action>>;
  actions_connection?: Maybe<ActionRelationResponseCollection>;
  armor_class_base?: Maybe<Scalars['Int']['output']>;
  armor_class_dex_bonus?: Maybe<Scalars['Boolean']['output']>;
  damage_dice?: Maybe<Scalars['String']['output']>;
  damage_type?: Maybe<DamageType>;
  id: Scalars['ID']['output'];
  properties: Array<Maybe<WeaponProperty>>;
  properties_connection?: Maybe<WeaponPropertyRelationResponseCollection>;
  range_long?: Maybe<Scalars['Int']['output']>;
  range_normal?: Maybe<Scalars['Int']['output']>;
  stealth_disadvantage?: Maybe<Scalars['Boolean']['output']>;
  str_minimum?: Maybe<Scalars['Int']['output']>;
};


export type ComponentGameEquipmentDataActionsArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameEquipmentDataActions_ConnectionArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameEquipmentDataPropertiesArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameEquipmentDataProperties_ConnectionArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameEquipmentDataFiltersInput = {
  actions?: InputMaybe<ActionFiltersInput>;
  and?: InputMaybe<Array<InputMaybe<ComponentGameEquipmentDataFiltersInput>>>;
  armor_class_base?: InputMaybe<IntFilterInput>;
  armor_class_dex_bonus?: InputMaybe<BooleanFilterInput>;
  damage_dice?: InputMaybe<StringFilterInput>;
  damage_type?: InputMaybe<DamageTypeFiltersInput>;
  not?: InputMaybe<ComponentGameEquipmentDataFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameEquipmentDataFiltersInput>>>;
  properties?: InputMaybe<WeaponPropertyFiltersInput>;
  range_long?: InputMaybe<IntFilterInput>;
  range_normal?: InputMaybe<IntFilterInput>;
  stealth_disadvantage?: InputMaybe<BooleanFilterInput>;
  str_minimum?: InputMaybe<IntFilterInput>;
};

export type ComponentGameEquipmentDataInput = {
  actions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  armor_class_base?: InputMaybe<Scalars['Int']['input']>;
  armor_class_dex_bonus?: InputMaybe<Scalars['Boolean']['input']>;
  damage_dice?: InputMaybe<Scalars['String']['input']>;
  damage_type?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  properties?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  range_long?: InputMaybe<Scalars['Int']['input']>;
  range_normal?: InputMaybe<Scalars['Int']['input']>;
  stealth_disadvantage?: InputMaybe<Scalars['Boolean']['input']>;
  str_minimum?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameFeature = {
  __typename?: 'ComponentGameFeature';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  source?: Maybe<Enum_Componentgamefeature_Source>;
  usage_max?: Maybe<Scalars['Int']['output']>;
  usage_per?: Maybe<Enum_Componentgamefeature_Usage_Per>;
};

export type ComponentGameFeatureFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameFeatureFiltersInput>>>;
  description?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameFeatureFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameFeatureFiltersInput>>>;
  source?: InputMaybe<StringFilterInput>;
  usage_max?: InputMaybe<IntFilterInput>;
  usage_per?: InputMaybe<StringFilterInput>;
};

export type ComponentGameFeatureInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Enum_Componentgamefeature_Source>;
  usage_max?: InputMaybe<Scalars['Int']['input']>;
  usage_per?: InputMaybe<Enum_Componentgamefeature_Usage_Per>;
};

export type ComponentGameInventoryItem = {
  __typename?: 'ComponentGameInventoryItem';
  id: Scalars['ID']['output'];
  isEquipped?: Maybe<Scalars['Boolean']['output']>;
  item?: Maybe<Item>;
  quantity?: Maybe<Scalars['Int']['output']>;
  slot?: Maybe<Enum_Componentgameinventoryitem_Slot>;
};

export type ComponentGameInventoryItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameInventoryItemFiltersInput>>>;
  isEquipped?: InputMaybe<BooleanFilterInput>;
  item?: InputMaybe<ItemFiltersInput>;
  not?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameInventoryItemFiltersInput>>>;
  quantity?: InputMaybe<IntFilterInput>;
  slot?: InputMaybe<StringFilterInput>;
};

export type ComponentGameInventoryItemInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  isEquipped?: InputMaybe<Scalars['Boolean']['input']>;
  item?: InputMaybe<Scalars['ID']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  slot?: InputMaybe<Enum_Componentgameinventoryitem_Slot>;
};

export type ComponentGameMechanicsConfig = {
  __typename?: 'ComponentGameMechanicsConfig';
  action_type: Enum_Componentgamemechanicsconfig_Action_Type;
  id: Scalars['ID']['output'];
  save_effect?: Maybe<Enum_Componentgamemechanicsconfig_Save_Effect>;
};

export type ComponentGameMechanicsConfigFiltersInput = {
  action_type?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<ComponentGameMechanicsConfigFiltersInput>>>;
  not?: InputMaybe<ComponentGameMechanicsConfigFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameMechanicsConfigFiltersInput>>>;
  save_effect?: InputMaybe<StringFilterInput>;
};

export type ComponentGameMechanicsConfigInput = {
  action_type?: InputMaybe<Enum_Componentgamemechanicsconfig_Action_Type>;
  id?: InputMaybe<Scalars['ID']['input']>;
  save_effect?: InputMaybe<Enum_Componentgamemechanicsconfig_Save_Effect>;
};

export type ComponentGamePlayer = {
  __typename?: 'ComponentGamePlayer';
  action?: Maybe<Scalars['String']['output']>;
  character?: Maybe<Character>;
  characterSheet?: Maybe<EntitySheet>;
  id: Scalars['ID']['output'];
  isOnline?: Maybe<Scalars['Boolean']['output']>;
  isReady?: Maybe<Scalars['Boolean']['output']>;
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UsersPermissionsUser>;
};

export type ComponentGamePlayerFiltersInput = {
  action?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<ComponentGamePlayerFiltersInput>>>;
  character?: InputMaybe<CharacterFiltersInput>;
  characterSheet?: InputMaybe<EntitySheetFiltersInput>;
  isOnline?: InputMaybe<BooleanFilterInput>;
  isReady?: InputMaybe<BooleanFilterInput>;
  joinedAt?: InputMaybe<DateTimeFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGamePlayerFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGamePlayerFiltersInput>>>;
  user?: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type ComponentGamePlayerInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  character?: InputMaybe<Scalars['ID']['input']>;
  characterSheet?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isOnline?: InputMaybe<Scalars['Boolean']['input']>;
  isReady?: InputMaybe<Scalars['Boolean']['input']>;
  joinedAt?: InputMaybe<Scalars['DateTime']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentGamePosition = {
  __typename?: 'ComponentGamePosition';
  id: Scalars['ID']['output'];
  mapId?: Maybe<Scalars['String']['output']>;
  x?: Maybe<Scalars['Int']['output']>;
  y?: Maybe<Scalars['Int']['output']>;
  z?: Maybe<Scalars['Int']['output']>;
};

export type ComponentGamePositionFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGamePositionFiltersInput>>>;
  mapId?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGamePositionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGamePositionFiltersInput>>>;
  x?: InputMaybe<IntFilterInput>;
  y?: InputMaybe<IntFilterInput>;
  z?: InputMaybe<IntFilterInput>;
};

export type ComponentGamePositionInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  mapId?: InputMaybe<Scalars['String']['input']>;
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
  z?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameRangeConfig = {
  __typename?: 'ComponentGameRangeConfig';
  aoe_height?: Maybe<Scalars['Int']['output']>;
  aoe_shape?: Maybe<Enum_Componentgamerangeconfig_Aoe_Shape>;
  aoe_size?: Maybe<Scalars['Int']['output']>;
  distance?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  type: Enum_Componentgamerangeconfig_Type;
};

export type ComponentGameRangeConfigFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameRangeConfigFiltersInput>>>;
  aoe_height?: InputMaybe<IntFilterInput>;
  aoe_shape?: InputMaybe<StringFilterInput>;
  aoe_size?: InputMaybe<IntFilterInput>;
  distance?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameRangeConfigFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameRangeConfigFiltersInput>>>;
  type?: InputMaybe<StringFilterInput>;
};

export type ComponentGameRangeConfigInput = {
  aoe_height?: InputMaybe<Scalars['Int']['input']>;
  aoe_shape?: InputMaybe<Enum_Componentgamerangeconfig_Aoe_Shape>;
  aoe_size?: InputMaybe<Scalars['Int']['input']>;
  distance?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Enum_Componentgamerangeconfig_Type>;
};

export type ComponentGameResourcePool = {
  __typename?: 'ComponentGameResourcePool';
  current: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  max: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  reset_on?: Maybe<Enum_Componentgameresourcepool_Reset_On>;
};

export type ComponentGameResourcePoolFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameResourcePoolFiltersInput>>>;
  current?: InputMaybe<IntFilterInput>;
  max?: InputMaybe<IntFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameResourcePoolFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameResourcePoolFiltersInput>>>;
  reset_on?: InputMaybe<StringFilterInput>;
};

export type ComponentGameResourcePoolInput = {
  current?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  max?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  reset_on?: InputMaybe<Enum_Componentgameresourcepool_Reset_On>;
};

export type ComponentGameSaveBonus = {
  __typename?: 'ComponentGameSaveBonus';
  id: Scalars['ID']['output'];
  proficient?: Maybe<Scalars['Boolean']['output']>;
  stat: Enum_Componentgamesavebonus_Stat;
  value: Scalars['Int']['output'];
};

export type ComponentGameSaveBonusFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSaveBonusFiltersInput>>>;
  not?: InputMaybe<ComponentGameSaveBonusFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSaveBonusFiltersInput>>>;
  proficient?: InputMaybe<BooleanFilterInput>;
  stat?: InputMaybe<StringFilterInput>;
  value?: InputMaybe<IntFilterInput>;
};

export type ComponentGameSaveBonusInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  proficient?: InputMaybe<Scalars['Boolean']['input']>;
  stat?: InputMaybe<Enum_Componentgamesavebonus_Stat>;
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameSaveDc = {
  __typename?: 'ComponentGameSaveDc';
  dc: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  stat: Enum_Componentgamesavedc_Stat;
  success_type?: Maybe<Enum_Componentgamesavedc_Success_Type>;
};

export type ComponentGameSaveDcFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSaveDcFiltersInput>>>;
  dc?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameSaveDcFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSaveDcFiltersInput>>>;
  stat?: InputMaybe<StringFilterInput>;
  success_type?: InputMaybe<StringFilterInput>;
};

export type ComponentGameSaveDcInput = {
  dc?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  stat?: InputMaybe<Enum_Componentgamesavedc_Stat>;
  success_type?: InputMaybe<Enum_Componentgamesavedc_Success_Type>;
};

export type ComponentGameScalingConfig = {
  __typename?: 'ComponentGameScalingConfig';
  dice_count?: Maybe<Scalars['Int']['output']>;
  dice_value?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  method?: Maybe<Enum_Componentgamescalingconfig_Method>;
  scales?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Enum_Componentgamescalingconfig_Type>;
};

export type ComponentGameScalingConfigFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameScalingConfigFiltersInput>>>;
  dice_count?: InputMaybe<IntFilterInput>;
  dice_value?: InputMaybe<IntFilterInput>;
  method?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameScalingConfigFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameScalingConfigFiltersInput>>>;
  scales?: InputMaybe<BooleanFilterInput>;
  type?: InputMaybe<StringFilterInput>;
};

export type ComponentGameScalingConfigInput = {
  dice_count?: InputMaybe<Scalars['Int']['input']>;
  dice_value?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  method?: InputMaybe<Enum_Componentgamescalingconfig_Method>;
  scales?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Enum_Componentgamescalingconfig_Type>;
};

export type ComponentGameSkillBonus = {
  __typename?: 'ComponentGameSkillBonus';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  proficient?: Maybe<Scalars['Boolean']['output']>;
  value: Scalars['Int']['output'];
};

export type ComponentGameSkillBonusFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSkillBonusFiltersInput>>>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameSkillBonusFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSkillBonusFiltersInput>>>;
  proficient?: InputMaybe<BooleanFilterInput>;
  value?: InputMaybe<IntFilterInput>;
};

export type ComponentGameSkillBonusInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proficient?: InputMaybe<Scalars['Boolean']['input']>;
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type ComponentGameSpellComponents = {
  __typename?: 'ComponentGameSpellComponents';
  consumed?: Maybe<Scalars['Boolean']['output']>;
  cost_gp?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  material?: Maybe<Scalars['Boolean']['output']>;
  material_description?: Maybe<Scalars['String']['output']>;
  somatic?: Maybe<Scalars['Boolean']['output']>;
  verbal?: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentGameSpellComponentsFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSpellComponentsFiltersInput>>>;
  consumed?: InputMaybe<BooleanFilterInput>;
  cost_gp?: InputMaybe<IntFilterInput>;
  material?: InputMaybe<BooleanFilterInput>;
  material_description?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ComponentGameSpellComponentsFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSpellComponentsFiltersInput>>>;
  somatic?: InputMaybe<BooleanFilterInput>;
  verbal?: InputMaybe<BooleanFilterInput>;
};

export type ComponentGameSpellComponentsInput = {
  consumed?: InputMaybe<Scalars['Boolean']['input']>;
  cost_gp?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  material?: InputMaybe<Scalars['Boolean']['input']>;
  material_description?: InputMaybe<Scalars['String']['input']>;
  somatic?: InputMaybe<Scalars['Boolean']['input']>;
  verbal?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ComponentGameSpellData = {
  __typename?: 'ComponentGameSpellData';
  casting_config?: Maybe<ComponentGameCastingConfig>;
  condition_instances?: Maybe<Array<Maybe<ComponentGameConditionInstance>>>;
  damage_instances?: Maybe<Array<Maybe<ComponentGameDamageInstance>>>;
  duration_config?: Maybe<ComponentGameDurationConfig>;
  id: Scalars['ID']['output'];
  level?: Maybe<Scalars['Int']['output']>;
  range_config?: Maybe<ComponentGameRangeConfig>;
  school?: Maybe<Enum_Componentgamespelldata_School>;
};


export type ComponentGameSpellDataCondition_InstancesArgs = {
  filters?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameSpellDataDamage_InstancesArgs = {
  filters?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameSpellDataFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSpellDataFiltersInput>>>;
  casting_config?: InputMaybe<ComponentGameCastingConfigFiltersInput>;
  condition_instances?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  damage_instances?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  duration_config?: InputMaybe<ComponentGameDurationConfigFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  not?: InputMaybe<ComponentGameSpellDataFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSpellDataFiltersInput>>>;
  range_config?: InputMaybe<ComponentGameRangeConfigFiltersInput>;
  school?: InputMaybe<StringFilterInput>;
};

export type ComponentGameSpellDataInput = {
  casting_config?: InputMaybe<ComponentGameCastingConfigInput>;
  condition_instances?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceInput>>>;
  damage_instances?: InputMaybe<Array<InputMaybe<ComponentGameDamageInstanceInput>>>;
  duration_config?: InputMaybe<ComponentGameDurationConfigInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  range_config?: InputMaybe<ComponentGameRangeConfigInput>;
  school?: InputMaybe<Enum_Componentgamespelldata_School>;
};

export type ComponentGameSpellbook = {
  __typename?: 'ComponentGameSpellbook';
  id: Scalars['ID']['output'];
  knownSpells: Array<Maybe<Spell>>;
  knownSpells_connection?: Maybe<SpellRelationResponseCollection>;
  preparedSpells: Array<Maybe<Spell>>;
  preparedSpells_connection?: Maybe<SpellRelationResponseCollection>;
  spellAttackBonus?: Maybe<Scalars['Int']['output']>;
  spellSaveDc?: Maybe<Scalars['Int']['output']>;
  spellcastingAbility?: Maybe<Enum_Componentgamespellbook_Spellcastingability>;
};


export type ComponentGameSpellbookKnownSpellsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameSpellbookKnownSpells_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameSpellbookPreparedSpellsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameSpellbookPreparedSpells_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameSpellbookFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameSpellbookFiltersInput>>>;
  knownSpells?: InputMaybe<SpellFiltersInput>;
  not?: InputMaybe<ComponentGameSpellbookFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameSpellbookFiltersInput>>>;
  preparedSpells?: InputMaybe<SpellFiltersInput>;
  spellAttackBonus?: InputMaybe<IntFilterInput>;
  spellSaveDc?: InputMaybe<IntFilterInput>;
  spellcastingAbility?: InputMaybe<StringFilterInput>;
};

export type ComponentGameSpellbookInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  knownSpells?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  preparedSpells?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  spellAttackBonus?: InputMaybe<Scalars['Int']['input']>;
  spellSaveDc?: InputMaybe<Scalars['Int']['input']>;
  spellcastingAbility?: InputMaybe<Enum_Componentgamespellbook_Spellcastingability>;
};

export type ComponentGameStats = {
  __typename?: 'ComponentGameStats';
  blindsight?: Maybe<Scalars['Int']['output']>;
  burrowSpeed?: Maybe<Scalars['Int']['output']>;
  charisma?: Maybe<Scalars['Int']['output']>;
  climbSpeed?: Maybe<Scalars['Int']['output']>;
  constitution?: Maybe<Scalars['Int']['output']>;
  darkvision?: Maybe<Scalars['Int']['output']>;
  dexterity?: Maybe<Scalars['Int']['output']>;
  flySpeed?: Maybe<Scalars['Int']['output']>;
  hover?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  intelligence?: Maybe<Scalars['Int']['output']>;
  languages: Array<Maybe<Language>>;
  languages_connection?: Maybe<LanguageRelationResponseCollection>;
  passivePerception?: Maybe<Scalars['Int']['output']>;
  saves?: Maybe<Scalars['JSON']['output']>;
  skills?: Maybe<Scalars['JSON']['output']>;
  strength?: Maybe<Scalars['Int']['output']>;
  swimSpeed?: Maybe<Scalars['Int']['output']>;
  tremorsense?: Maybe<Scalars['Int']['output']>;
  truesight?: Maybe<Scalars['Int']['output']>;
  walkSpeed?: Maybe<Scalars['Int']['output']>;
  wisdom?: Maybe<Scalars['Int']['output']>;
};


export type ComponentGameStatsLanguagesArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ComponentGameStatsLanguages_ConnectionArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ComponentGameStatsFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ComponentGameStatsFiltersInput>>>;
  blindsight?: InputMaybe<IntFilterInput>;
  burrowSpeed?: InputMaybe<IntFilterInput>;
  charisma?: InputMaybe<IntFilterInput>;
  climbSpeed?: InputMaybe<IntFilterInput>;
  constitution?: InputMaybe<IntFilterInput>;
  darkvision?: InputMaybe<IntFilterInput>;
  dexterity?: InputMaybe<IntFilterInput>;
  flySpeed?: InputMaybe<IntFilterInput>;
  hover?: InputMaybe<BooleanFilterInput>;
  intelligence?: InputMaybe<IntFilterInput>;
  languages?: InputMaybe<LanguageFiltersInput>;
  not?: InputMaybe<ComponentGameStatsFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ComponentGameStatsFiltersInput>>>;
  passivePerception?: InputMaybe<IntFilterInput>;
  saves?: InputMaybe<JsonFilterInput>;
  skills?: InputMaybe<JsonFilterInput>;
  strength?: InputMaybe<IntFilterInput>;
  swimSpeed?: InputMaybe<IntFilterInput>;
  tremorsense?: InputMaybe<IntFilterInput>;
  truesight?: InputMaybe<IntFilterInput>;
  walkSpeed?: InputMaybe<IntFilterInput>;
  wisdom?: InputMaybe<IntFilterInput>;
};

export type ComponentGameStatsInput = {
  blindsight?: InputMaybe<Scalars['Int']['input']>;
  burrowSpeed?: InputMaybe<Scalars['Int']['input']>;
  charisma?: InputMaybe<Scalars['Int']['input']>;
  climbSpeed?: InputMaybe<Scalars['Int']['input']>;
  constitution?: InputMaybe<Scalars['Int']['input']>;
  darkvision?: InputMaybe<Scalars['Int']['input']>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  flySpeed?: InputMaybe<Scalars['Int']['input']>;
  hover?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  languages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  passivePerception?: InputMaybe<Scalars['Int']['input']>;
  saves?: InputMaybe<Scalars['JSON']['input']>;
  skills?: InputMaybe<Scalars['JSON']['input']>;
  strength?: InputMaybe<Scalars['Int']['input']>;
  swimSpeed?: InputMaybe<Scalars['Int']['input']>;
  tremorsense?: InputMaybe<Scalars['Int']['input']>;
  truesight?: InputMaybe<Scalars['Int']['input']>;
  walkSpeed?: InputMaybe<Scalars['Int']['input']>;
  wisdom?: InputMaybe<Scalars['Int']['input']>;
};

export type DamageType = {
  __typename?: 'DamageType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<DamageType>>;
  localizations_connection?: Maybe<DamageTypeRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type DamageTypeLocalizationsArgs = {
  filters?: InputMaybe<DamageTypeFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type DamageTypeLocalizations_ConnectionArgs = {
  filters?: InputMaybe<DamageTypeFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type DamageTypeEntityResponseCollection = {
  __typename?: 'DamageTypeEntityResponseCollection';
  nodes: Array<DamageType>;
  pageInfo: Pagination;
};

export type DamageTypeFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<DamageTypeFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<DamageTypeFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<DamageTypeFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<DamageTypeFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type DamageTypeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type DamageTypeRelationResponseCollection = {
  __typename?: 'DamageTypeRelationResponseCollection';
  nodes: Array<DamageType>;
};

export type DateTimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  contains?: InputMaybe<Scalars['DateTime']['input']>;
  containsi?: InputMaybe<Scalars['DateTime']['input']>;
  endsWith?: InputMaybe<Scalars['DateTime']['input']>;
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  eqi?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  ne?: InputMaybe<Scalars['DateTime']['input']>;
  nei?: InputMaybe<Scalars['DateTime']['input']>;
  not?: InputMaybe<DateTimeFilterInput>;
  notContains?: InputMaybe<Scalars['DateTime']['input']>;
  notContainsi?: InputMaybe<Scalars['DateTime']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  startsWith?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  documentId: Scalars['ID']['output'];
};

export type DmSetting = {
  __typename?: 'DmSetting';
  adventureLength?: Maybe<Enum_Dmsetting_Adventurelength>;
  attributePointBudget?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  difficulty?: Maybe<Enum_Dmsetting_Difficulty>;
  dmStyle?: Maybe<ComponentGameDmStyle>;
  dmSystemPrompt?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  playerCount?: Maybe<Scalars['Int']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  room?: Maybe<Room>;
  setting?: Maybe<Scalars['String']['output']>;
  startingLevel?: Maybe<Scalars['Int']['output']>;
  theme?: Maybe<Scalars['String']['output']>;
  tone?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DmSettingEntityResponseCollection = {
  __typename?: 'DmSettingEntityResponseCollection';
  nodes: Array<DmSetting>;
  pageInfo: Pagination;
};

export type DmSettingFiltersInput = {
  adventureLength?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<DmSettingFiltersInput>>>;
  attributePointBudget?: InputMaybe<IntFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  difficulty?: InputMaybe<StringFilterInput>;
  dmStyle?: InputMaybe<ComponentGameDmStyleFiltersInput>;
  dmSystemPrompt?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  not?: InputMaybe<DmSettingFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<DmSettingFiltersInput>>>;
  playerCount?: InputMaybe<IntFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  setting?: InputMaybe<StringFilterInput>;
  startingLevel?: InputMaybe<IntFilterInput>;
  theme?: InputMaybe<StringFilterInput>;
  tone?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type DmSettingInput = {
  adventureLength?: InputMaybe<Enum_Dmsetting_Adventurelength>;
  attributePointBudget?: InputMaybe<Scalars['Int']['input']>;
  difficulty?: InputMaybe<Enum_Dmsetting_Difficulty>;
  dmStyle?: InputMaybe<ComponentGameDmStyleInput>;
  dmSystemPrompt?: InputMaybe<Scalars['String']['input']>;
  playerCount?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  setting?: InputMaybe<Scalars['String']['input']>;
  startingLevel?: InputMaybe<Scalars['Int']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
  tone?: InputMaybe<Scalars['String']['input']>;
};

export enum Enum_Action_Type {
  Ability = 'ability',
  Melee = 'melee',
  Ranged = 'ranged',
  Spell = 'spell',
  Utility = 'utility'
}

export enum Enum_Componentgameaction_Duration {
  Concentration = 'concentration',
  EightHours = 'eight_hours',
  Instantaneous = 'instantaneous',
  OneHour = 'one_hour',
  OneMinute = 'one_minute',
  Special = 'special',
  TenMinutes = 'ten_minutes',
  TwentyFourHours = 'twenty_four_hours',
  UntilDispelled = 'until_dispelled'
}

export enum Enum_Componentgameaction_Type {
  Melee = 'melee',
  Ranged = 'ranged',
  Spell = 'spell',
  Utility = 'utility'
}

export enum Enum_Componentgameareaeffect_Shape {
  Circle = 'circle',
  Cone = 'cone',
  Cube = 'cube',
  Cylinder = 'cylinder',
  Line = 'line',
  Sphere = 'sphere'
}

export enum Enum_Componentgamecastingconfig_Time_Unit {
  Action = 'Action',
  BonusAction = 'Bonus_Action',
  Day = 'Day',
  Hour = 'Hour',
  Minute = 'Minute',
  Reaction = 'Reaction',
  Round = 'Round'
}

export enum Enum_Componentgamecomputedaction_Type {
  Melee = 'melee',
  Ranged = 'ranged',
  Spell = 'spell',
  Utility = 'utility'
}

export enum Enum_Componentgameconditioninstance_Condition {
  Blinded = 'Blinded',
  Charmed = 'Charmed',
  Deafened = 'Deafened',
  Exhaustion = 'Exhaustion',
  Frightened = 'Frightened',
  Grappled = 'Grappled',
  Incapacitated = 'Incapacitated',
  Invisible = 'Invisible',
  Paralyzed = 'Paralyzed',
  Petrified = 'Petrified',
  Poisoned = 'Poisoned',
  Prone = 'Prone',
  Restrained = 'Restrained',
  Special = 'Special',
  Stunned = 'Stunned',
  Unconscious = 'Unconscious'
}

export enum Enum_Componentgamedamageinstance_Damage_Type {
  Acid = 'Acid',
  Bludgeoning = 'Bludgeoning',
  Cold = 'Cold',
  Fire = 'Fire',
  Force = 'Force',
  Lightning = 'Lightning',
  Necrotic = 'Necrotic',
  Piercing = 'Piercing',
  Poison = 'Poison',
  Psychic = 'Psychic',
  Radiant = 'Radiant',
  Slashing = 'Slashing',
  Thunder = 'Thunder'
}

export enum Enum_Componentgamedamageinstance_Effect_Type {
  Damage = 'Damage',
  Healing = 'Healing',
  TempHp = 'TempHP'
}

export enum Enum_Componentgamedamageinstance_Timing {
  EndOfTurn = 'End_of_Turn',
  Instant = 'Instant',
  OneTimeTrigger = 'One_Time_Trigger',
  StartOfTurn = 'Start_of_Turn'
}

export enum Enum_Componentgamedamagemodifier_Damagetype {
  Acid = 'acid',
  Bludgeoning = 'bludgeoning',
  Cold = 'cold',
  Fire = 'fire',
  Force = 'force',
  Lightning = 'lightning',
  Magical = 'magical',
  Necrotic = 'necrotic',
  Physical = 'physical',
  Piercing = 'piercing',
  Poison = 'poison',
  Psychic = 'psychic',
  Radiant = 'radiant',
  Slashing = 'slashing',
  Thunder = 'thunder'
}

export enum Enum_Componentgamedamagemodifier_Modifier {
  Immunity = 'immunity',
  Resistance = 'resistance',
  Vulnerability = 'vulnerability'
}

export enum Enum_Componentgamedurationconfig_Type {
  Concentration = 'Concentration',
  Instantaneous = 'Instantaneous',
  Special = 'Special',
  TimeLimited = 'Time_Limited',
  UntilDispelled = 'Until_Dispelled',
  UntilTriggered = 'Until_Triggered'
}

export enum Enum_Componentgamedurationconfig_Unit {
  Days = 'Days',
  Hours = 'Hours',
  Minutes = 'Minutes',
  Rounds = 'Rounds'
}

export enum Enum_Componentgamefeature_Source {
  Class = 'class',
  Feat = 'feat',
  Item = 'item',
  Monster = 'monster',
  Other = 'other',
  Race = 'race'
}

export enum Enum_Componentgamefeature_Usage_Per {
  Dawn = 'dawn',
  Day = 'day',
  Dusk = 'dusk',
  LongRest = 'long_rest',
  Other = 'other',
  ShortRest = 'short_rest'
}

export enum Enum_Componentgameinventoryitem_Slot {
  Accessory = 'accessory',
  Armor = 'armor',
  Backpack = 'backpack',
  Cloak = 'cloak',
  Feet = 'feet',
  Hands = 'hands',
  Head = 'head',
  MainHand = 'main_hand',
  Neck = 'neck',
  OffHand = 'off_hand',
  Ring_1 = 'ring_1',
  Ring_2 = 'ring_2'
}

export enum Enum_Componentgamemechanicsconfig_Action_Type {
  AutoHit = 'Auto_Hit',
  CharismaSave = 'Charisma_Save',
  ConstitutionSave = 'Constitution_Save',
  DexteritySave = 'Dexterity_Save',
  IntelligenceSave = 'Intelligence_Save',
  MeleeSpellAttack = 'Melee_Spell_Attack',
  None = 'None',
  RangedSpellAttack = 'Ranged_Spell_Attack',
  StrengthSave = 'Strength_Save',
  WisdomSave = 'Wisdom_Save'
}

export enum Enum_Componentgamemechanicsconfig_Save_Effect {
  Half = 'Half',
  Negate = 'Negate',
  None = 'None'
}

export enum Enum_Componentgamerangeconfig_Aoe_Shape {
  Cone = 'Cone',
  Cube = 'Cube',
  Cylinder = 'Cylinder',
  Hemisphere = 'Hemisphere',
  Line = 'Line',
  Sphere = 'Sphere'
}

export enum Enum_Componentgamerangeconfig_Type {
  RangedFeet = 'Ranged_Feet',
  RangedMiles = 'Ranged_Miles',
  Self = 'Self',
  Sight = 'Sight',
  Touch = 'Touch',
  Unlimited = 'Unlimited'
}

export enum Enum_Componentgameresourcepool_Reset_On {
  Dawn = 'dawn',
  LongRest = 'long_rest',
  Never = 'never',
  ShortRest = 'short_rest'
}

export enum Enum_Componentgamesavebonus_Stat {
  Charisma = 'charisma',
  Constitution = 'constitution',
  Dexterity = 'dexterity',
  Intelligence = 'intelligence',
  Strength = 'strength',
  Wisdom = 'wisdom'
}

export enum Enum_Componentgamesavedc_Stat {
  Cha = 'cha',
  Con = 'con',
  Dex = 'dex',
  Int = 'int',
  Str = 'str',
  Wis = 'wis'
}

export enum Enum_Componentgamesavedc_Success_Type {
  Half = 'half',
  None = 'none',
  Other = 'other'
}

export enum Enum_Componentgamescalingconfig_Method {
  Every_2SlotLevels = 'Every_2_Slot_Levels',
  PerSlotLevel = 'Per_Slot_Level',
  SpecificThresholds = 'Specific_Thresholds'
}

export enum Enum_Componentgamescalingconfig_Type {
  Dice = 'Dice',
  Duration = 'Duration',
  Target = 'Target'
}

export enum Enum_Componentgamespellbook_Spellcastingability {
  Charisma = 'charisma',
  Intelligence = 'intelligence',
  Wisdom = 'wisdom'
}

export enum Enum_Componentgamespelldata_School {
  Abjuration = 'Abjuration',
  Conjuration = 'Conjuration',
  Divination = 'Divination',
  Enchantment = 'Enchantment',
  Evocation = 'Evocation',
  Illusion = 'Illusion',
  Necromancy = 'Necromancy',
  Transmutation = 'Transmutation'
}

export enum Enum_Dmsetting_Adventurelength {
  Epic = 'epic',
  Flash = 'flash',
  Legendary = 'legendary',
  Long = 'long',
  Medium = 'medium',
  Short = 'short'
}

export enum Enum_Dmsetting_Difficulty {
  Challenging = 'challenging',
  Deadly = 'deadly',
  Easy = 'easy',
  Gritty = 'gritty',
  Medium = 'medium',
  Storyteller = 'storyteller'
}

export enum Enum_Entitysheet_Type {
  Loot = 'loot',
  Monster = 'monster',
  Npc = 'npc',
  Player = 'player'
}

export enum Enum_Entity_Size {
  Gargantuan = 'Gargantuan',
  Huge = 'Huge',
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small',
  Tiny = 'Tiny'
}

export enum Enum_Gameevent_Type {
  Attack = 'ATTACK',
  AttackResult = 'ATTACK_RESULT',
  DeathSave = 'DEATH_SAVE',
  EntityDeath = 'ENTITY_DEATH',
  EntityMoved = 'ENTITY_MOVED',
  EntropyChange = 'ENTROPY_CHANGE',
  Initiative = 'INITIATIVE',
  Interact = 'INTERACT',
  ItemDrop = 'ITEM_DROP',
  ItemPickup = 'ITEM_PICKUP',
  LongRest = 'LONG_REST',
  LongRestCompleted = 'LONG_REST_COMPLETED',
  Move = 'MOVE',
  ObjectInteraction = 'OBJECT_INTERACTION',
  ShortRest = 'SHORT_REST',
  SkillCheck = 'SKILL_CHECK',
  SkillCheckResult = 'SKILL_CHECK_RESULT',
  SpawnEntity = 'SPAWN_ENTITY',
  SpellCast = 'SPELL_CAST',
  TerrainModified = 'TERRAIN_MODIFIED',
  TurnEnd = 'TURN_END',
  TurnStart = 'TURN_START'
}

export enum Enum_Item_Rarity {
  Artifact = 'artifact',
  Common = 'common',
  Legendary = 'legendary',
  Rare = 'rare',
  Uncommon = 'uncommon',
  VeryRare = 'very_rare'
}

export enum Enum_Item_Type {
  Armor = 'armor',
  Consumable = 'consumable',
  Container = 'container',
  Feature = 'feature',
  Loot = 'loot',
  SpellScroll = 'spell_scroll',
  Tool = 'tool',
  Weapon = 'weapon'
}

export enum Enum_Knowledgesource_Origin {
  Entity = 'entity',
  Manual = 'manual'
}

export enum Enum_Message_Sendertype {
  Dm = 'dm',
  Player = 'player',
  System = 'system'
}

export enum Enum_Proficiency_Type {
  Armor = 'Armor',
  ArtisanSTools = 'Artisan_s_Tools',
  GamingSets = 'Gaming_Sets',
  MusicalInstruments = 'Musical_Instruments',
  Other = 'Other',
  SavingThrows = 'Saving_Throws',
  Skills = 'Skills',
  Tools = 'Tools',
  Vehicles = 'Vehicles',
  Weapons = 'Weapons'
}

export enum Enum_Prompt_Category {
  Gameplay = 'gameplay',
  System = 'system',
  User = 'user'
}

export enum Enum_Race_Size {
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small',
  Tiny = 'Tiny'
}

export enum Enum_Room_Phase {
  CharacterCreation = 'character_creation',
  Combat = 'combat',
  Ending = 'ending',
  Gameplay = 'gameplay',
  Lobby = 'lobby',
  WorldGeneration = 'world_generation'
}

export enum Enum_Spell_School {
  Abjuration = 'Abjuration',
  Conjuration = 'Conjuration',
  Divination = 'Divination',
  Enchantment = 'Enchantment',
  Evocation = 'Evocation',
  Illusion = 'Illusion',
  Necromancy = 'Necromancy',
  Transmutation = 'Transmutation'
}

export enum Enum_Turn_Status {
  Complete = 'complete',
  Processing = 'processing',
  Waiting = 'waiting'
}

export enum Enum_Turn_Type {
  Combat = 'combat',
  Exploration = 'exploration',
  Group = 'group'
}

export enum Enum_World_Adventurelength {
  Epic = 'epic',
  Flash = 'flash',
  Legendary = 'legendary',
  Long = 'long',
  Medium = 'medium',
  Short = 'short'
}

export enum Enum_World_Worldsize {
  Epic = 'epic',
  Intimate = 'intimate',
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  Vast = 'vast'
}

export type Entity = {
  __typename?: 'Entity';
  ac?: Maybe<Scalars['Int']['output']>;
  actions: Array<Maybe<Action>>;
  actions_connection?: Maybe<ActionRelationResponseCollection>;
  alignment?: Maybe<Scalars['String']['output']>;
  appearance?: Maybe<ComponentGameAppearance>;
  background?: Maybe<Scalars['String']['output']>;
  challenge_rating?: Maybe<Scalars['Float']['output']>;
  classes?: Maybe<Array<Maybe<ComponentGameCharacterClass>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  features: Array<Maybe<Feature>>;
  features_connection?: Maybe<FeatureRelationResponseCollection>;
  hit_dice?: Maybe<Scalars['String']['output']>;
  hp?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<UploadFile>;
  inventory?: Maybe<Array<Maybe<ComponentGameInventoryItem>>>;
  languages: Array<Maybe<Language>>;
  languages_connection?: Maybe<LanguageRelationResponseCollection>;
  level?: Maybe<Scalars['Int']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Entity>>;
  localizations_connection?: Maybe<EntityRelationResponseCollection>;
  name: Scalars['String']['output'];
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  race?: Maybe<Race>;
  resources?: Maybe<Array<Maybe<ComponentGameResourcePool>>>;
  size?: Maybe<Enum_Entity_Size>;
  slug: Scalars['String']['output'];
  spells: Array<Maybe<Spell>>;
  spells_connection?: Maybe<SpellRelationResponseCollection>;
  stats?: Maybe<ComponentGameStats>;
  traits: Array<Maybe<Trait>>;
  traits_connection?: Maybe<TraitRelationResponseCollection>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  xp?: Maybe<Scalars['Int']['output']>;
};


export type EntityActionsArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityActions_ConnectionArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityClassesArgs = {
  filters?: InputMaybe<ComponentGameCharacterClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityFeaturesArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityFeatures_ConnectionArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityInventoryArgs = {
  filters?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityLanguagesArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityLanguages_ConnectionArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityLocalizationsArgs = {
  filters?: InputMaybe<EntityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityLocalizations_ConnectionArgs = {
  filters?: InputMaybe<EntityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityResourcesArgs = {
  filters?: InputMaybe<ComponentGameResourcePoolFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySpellsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySpells_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityTraitsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntityTraits_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type EntityEntityResponseCollection = {
  __typename?: 'EntityEntityResponseCollection';
  nodes: Array<Entity>;
  pageInfo: Pagination;
};

export type EntityFiltersInput = {
  ac?: InputMaybe<IntFilterInput>;
  actions?: InputMaybe<ActionFiltersInput>;
  alignment?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<EntityFiltersInput>>>;
  appearance?: InputMaybe<ComponentGameAppearanceFiltersInput>;
  background?: InputMaybe<StringFilterInput>;
  challenge_rating?: InputMaybe<FloatFilterInput>;
  classes?: InputMaybe<ComponentGameCharacterClassFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  features?: InputMaybe<FeatureFiltersInput>;
  hit_dice?: InputMaybe<StringFilterInput>;
  hp?: InputMaybe<IntFilterInput>;
  inventory?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  languages?: InputMaybe<LanguageFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<EntityFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<EntityFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<EntityFiltersInput>>>;
  proficiencies?: InputMaybe<ProficiencyFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  race?: InputMaybe<RaceFiltersInput>;
  resources?: InputMaybe<ComponentGameResourcePoolFiltersInput>;
  size?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  spells?: InputMaybe<SpellFiltersInput>;
  stats?: InputMaybe<ComponentGameStatsFiltersInput>;
  traits?: InputMaybe<TraitFiltersInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  xp?: InputMaybe<IntFilterInput>;
};

export type EntityInput = {
  ac?: InputMaybe<Scalars['Int']['input']>;
  actions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  alignment?: InputMaybe<Scalars['String']['input']>;
  appearance?: InputMaybe<ComponentGameAppearanceInput>;
  background?: InputMaybe<Scalars['String']['input']>;
  challenge_rating?: InputMaybe<Scalars['Float']['input']>;
  classes?: InputMaybe<Array<InputMaybe<ComponentGameCharacterClassInput>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  hit_dice?: InputMaybe<Scalars['String']['input']>;
  hp?: InputMaybe<Scalars['Int']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  inventory?: InputMaybe<Array<InputMaybe<ComponentGameInventoryItemInput>>>;
  languages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proficiencies?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  race?: InputMaybe<Scalars['ID']['input']>;
  resources?: InputMaybe<Array<InputMaybe<ComponentGameResourcePoolInput>>>;
  size?: InputMaybe<Enum_Entity_Size>;
  slug?: InputMaybe<Scalars['String']['input']>;
  spells?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  stats?: InputMaybe<ComponentGameStatsInput>;
  traits?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  xp?: InputMaybe<Scalars['Int']['input']>;
};

export type EntityRelationResponseCollection = {
  __typename?: 'EntityRelationResponseCollection';
  nodes: Array<Entity>;
};

export type EntitySheet = {
  __typename?: 'EntitySheet';
  ac?: Maybe<Scalars['Int']['output']>;
  actions: Array<Maybe<Action>>;
  actions_connection?: Maybe<ActionRelationResponseCollection>;
  active_effects?: Maybe<Scalars['JSON']['output']>;
  appearance?: Maybe<ComponentGameAppearance>;
  availableActions?: Maybe<Array<Maybe<RuntimeAction>>>;
  backstory?: Maybe<Scalars['String']['output']>;
  character?: Maybe<Character>;
  class?: Maybe<Class>;
  computedActions?: Maybe<Array<Maybe<ComponentGameComputedAction>>>;
  computedSaves?: Maybe<Array<Maybe<ComponentGameSaveBonus>>>;
  computedSkills?: Maybe<Array<Maybe<ComponentGameSkillBonus>>>;
  conditions?: Maybe<Array<Maybe<ComponentGameConditionInstance>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currentHp?: Maybe<Scalars['Int']['output']>;
  defenses?: Maybe<Array<Maybe<ComponentGameDamageModifier>>>;
  documentId: Scalars['ID']['output'];
  entity?: Maybe<Entity>;
  experience?: Maybe<Scalars['Int']['output']>;
  features: Array<Maybe<Feature>>;
  features_connection?: Maybe<FeatureRelationResponseCollection>;
  initiativeBonus?: Maybe<Scalars['Int']['output']>;
  inventory?: Maybe<Array<Maybe<ComponentGameInventoryItem>>>;
  languages: Array<Maybe<Language>>;
  languages_connection?: Maybe<LanguageRelationResponseCollection>;
  level?: Maybe<Scalars['Int']['output']>;
  maxHp?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<UsersPermissionsUser>;
  passivePerception?: Maybe<Scalars['Int']['output']>;
  position?: Maybe<ComponentGamePosition>;
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  race?: Maybe<Race>;
  resources?: Maybe<Array<Maybe<ComponentGameResourcePool>>>;
  room?: Maybe<Room>;
  spellbook?: Maybe<ComponentGameSpellbook>;
  stats?: Maybe<ComponentGameStats>;
  tempHp?: Maybe<Scalars['Int']['output']>;
  traits: Array<Maybe<Trait>>;
  traits_connection?: Maybe<TraitRelationResponseCollection>;
  type?: Maybe<Enum_Entitysheet_Type>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type EntitySheetActionsArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetActions_ConnectionArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetComputedActionsArgs = {
  filters?: InputMaybe<ComponentGameComputedActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetComputedSavesArgs = {
  filters?: InputMaybe<ComponentGameSaveBonusFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetComputedSkillsArgs = {
  filters?: InputMaybe<ComponentGameSkillBonusFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetConditionsArgs = {
  filters?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetDefensesArgs = {
  filters?: InputMaybe<ComponentGameDamageModifierFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetFeaturesArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetFeatures_ConnectionArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetInventoryArgs = {
  filters?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetLanguagesArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetLanguages_ConnectionArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetResourcesArgs = {
  filters?: InputMaybe<ComponentGameResourcePoolFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetTraitsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EntitySheetTraits_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type EntitySheetEntityResponseCollection = {
  __typename?: 'EntitySheetEntityResponseCollection';
  nodes: Array<EntitySheet>;
  pageInfo: Pagination;
};

export type EntitySheetFiltersInput = {
  ac?: InputMaybe<IntFilterInput>;
  actions?: InputMaybe<ActionFiltersInput>;
  active_effects?: InputMaybe<JsonFilterInput>;
  and?: InputMaybe<Array<InputMaybe<EntitySheetFiltersInput>>>;
  appearance?: InputMaybe<ComponentGameAppearanceFiltersInput>;
  backstory?: InputMaybe<StringFilterInput>;
  character?: InputMaybe<CharacterFiltersInput>;
  class?: InputMaybe<ClassFiltersInput>;
  computedActions?: InputMaybe<ComponentGameComputedActionFiltersInput>;
  computedSaves?: InputMaybe<ComponentGameSaveBonusFiltersInput>;
  computedSkills?: InputMaybe<ComponentGameSkillBonusFiltersInput>;
  conditions?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  currentHp?: InputMaybe<IntFilterInput>;
  defenses?: InputMaybe<ComponentGameDamageModifierFiltersInput>;
  documentId?: InputMaybe<IdFilterInput>;
  entity?: InputMaybe<EntityFiltersInput>;
  experience?: InputMaybe<IntFilterInput>;
  features?: InputMaybe<FeatureFiltersInput>;
  initiativeBonus?: InputMaybe<IntFilterInput>;
  inventory?: InputMaybe<ComponentGameInventoryItemFiltersInput>;
  languages?: InputMaybe<LanguageFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  maxHp?: InputMaybe<IntFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<EntitySheetFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<EntitySheetFiltersInput>>>;
  owner?: InputMaybe<UsersPermissionsUserFiltersInput>;
  passivePerception?: InputMaybe<IntFilterInput>;
  position?: InputMaybe<ComponentGamePositionFiltersInput>;
  proficiencies?: InputMaybe<ProficiencyFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  race?: InputMaybe<RaceFiltersInput>;
  resources?: InputMaybe<ComponentGameResourcePoolFiltersInput>;
  room?: InputMaybe<RoomFiltersInput>;
  spellbook?: InputMaybe<ComponentGameSpellbookFiltersInput>;
  stats?: InputMaybe<ComponentGameStatsFiltersInput>;
  tempHp?: InputMaybe<IntFilterInput>;
  traits?: InputMaybe<TraitFiltersInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type EntitySheetInput = {
  ac?: InputMaybe<Scalars['Int']['input']>;
  actions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  active_effects?: InputMaybe<Scalars['JSON']['input']>;
  appearance?: InputMaybe<ComponentGameAppearanceInput>;
  backstory?: InputMaybe<Scalars['String']['input']>;
  character?: InputMaybe<Scalars['ID']['input']>;
  class?: InputMaybe<Scalars['ID']['input']>;
  computedActions?: InputMaybe<Array<InputMaybe<ComponentGameComputedActionInput>>>;
  computedSaves?: InputMaybe<Array<InputMaybe<ComponentGameSaveBonusInput>>>;
  computedSkills?: InputMaybe<Array<InputMaybe<ComponentGameSkillBonusInput>>>;
  conditions?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceInput>>>;
  currentHp?: InputMaybe<Scalars['Int']['input']>;
  defenses?: InputMaybe<Array<InputMaybe<ComponentGameDamageModifierInput>>>;
  entity?: InputMaybe<Scalars['ID']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  initiativeBonus?: InputMaybe<Scalars['Int']['input']>;
  inventory?: InputMaybe<Array<InputMaybe<ComponentGameInventoryItemInput>>>;
  languages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  maxHp?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner?: InputMaybe<Scalars['ID']['input']>;
  passivePerception?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<ComponentGamePositionInput>;
  proficiencies?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  race?: InputMaybe<Scalars['ID']['input']>;
  resources?: InputMaybe<Array<InputMaybe<ComponentGameResourcePoolInput>>>;
  room?: InputMaybe<Scalars['ID']['input']>;
  spellbook?: InputMaybe<ComponentGameSpellbookInput>;
  stats?: InputMaybe<ComponentGameStatsInput>;
  tempHp?: InputMaybe<Scalars['Int']['input']>;
  traits?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Enum_Entitysheet_Type>;
};

export type EntitySheetRelationResponseCollection = {
  __typename?: 'EntitySheetRelationResponseCollection';
  nodes: Array<EntitySheet>;
};

export type EquipmentCategory = {
  __typename?: 'EquipmentCategory';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<EquipmentCategory>>;
  localizations_connection?: Maybe<EquipmentCategoryRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type EquipmentCategoryLocalizationsArgs = {
  filters?: InputMaybe<EquipmentCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type EquipmentCategoryLocalizations_ConnectionArgs = {
  filters?: InputMaybe<EquipmentCategoryFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type EquipmentCategoryEntityResponseCollection = {
  __typename?: 'EquipmentCategoryEntityResponseCollection';
  nodes: Array<EquipmentCategory>;
  pageInfo: Pagination;
};

export type EquipmentCategoryFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<EquipmentCategoryFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<EquipmentCategoryFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<EquipmentCategoryFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<EquipmentCategoryFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type EquipmentCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type EquipmentCategoryRelationResponseCollection = {
  __typename?: 'EquipmentCategoryRelationResponseCollection';
  nodes: Array<EquipmentCategory>;
};

export type Feature = {
  __typename?: 'Feature';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  level?: Maybe<Scalars['Int']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Feature>>;
  localizations_connection?: Maybe<FeatureRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type FeatureLocalizationsArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type FeatureLocalizations_ConnectionArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type FeatureEntityResponseCollection = {
  __typename?: 'FeatureEntityResponseCollection';
  nodes: Array<Feature>;
  pageInfo: Pagination;
};

export type FeatureFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<FeatureFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  level?: InputMaybe<IntFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<FeatureFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<FeatureFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<FeatureFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type FeatureInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FeatureRelationResponseCollection = {
  __typename?: 'FeatureRelationResponseCollection';
  nodes: Array<Feature>;
};

export type FileInfoInput = {
  alternativeText?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type FloatFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  contains?: InputMaybe<Scalars['Float']['input']>;
  containsi?: InputMaybe<Scalars['Float']['input']>;
  endsWith?: InputMaybe<Scalars['Float']['input']>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  eqi?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  nei?: InputMaybe<Scalars['Float']['input']>;
  not?: InputMaybe<FloatFilterInput>;
  notContains?: InputMaybe<Scalars['Float']['input']>;
  notContainsi?: InputMaybe<Scalars['Float']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startsWith?: InputMaybe<Scalars['Float']['input']>;
};

export type GameCondition = {
  __typename?: 'GameCondition';
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GameEvent = {
  __typename?: 'GameEvent';
  actor?: Maybe<EntitySheet>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  payload: Scalars['JSON']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  room?: Maybe<Room>;
  timestamp: Scalars['Long']['output'];
  turn_number?: Maybe<Scalars['Int']['output']>;
  type: Enum_Gameevent_Type;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type GameEventEntityResponseCollection = {
  __typename?: 'GameEventEntityResponseCollection';
  nodes: Array<GameEvent>;
  pageInfo: Pagination;
};

export type GameEventFiltersInput = {
  actor?: InputMaybe<EntitySheetFiltersInput>;
  and?: InputMaybe<Array<InputMaybe<GameEventFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  not?: InputMaybe<GameEventFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<GameEventFiltersInput>>>;
  payload?: InputMaybe<JsonFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  timestamp?: InputMaybe<LongFilterInput>;
  turn_number?: InputMaybe<IntFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type GameEventInput = {
  actor?: InputMaybe<Scalars['ID']['input']>;
  payload?: InputMaybe<Scalars['JSON']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  timestamp?: InputMaybe<Scalars['Long']['input']>;
  turn_number?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Enum_Gameevent_Type>;
};

export type GameEventRelationResponseCollection = {
  __typename?: 'GameEventRelationResponseCollection';
  nodes: Array<GameEvent>;
};

export type GameView = {
  __typename?: 'GameView';
  activeTurn?: Maybe<Turn>;
  messages?: Maybe<Array<Maybe<Message>>>;
  myself?: Maybe<EntitySheet>;
  room?: Maybe<Room>;
  visibleEntities?: Maybe<Array<Maybe<EntitySheet>>>;
};

export type GenericMorph = Action | Character | Class | ComponentGameAction | ComponentGameAppearance | ComponentGameAreaEffect | ComponentGameCastingConfig | ComponentGameCharacterClass | ComponentGameClassProgression | ComponentGameComputedAction | ComponentGameConditionInstance | ComponentGameDamageDice | ComponentGameDamageInstance | ComponentGameDamageModifier | ComponentGameDmStyle | ComponentGameDurationConfig | ComponentGameEquipmentData | ComponentGameFeature | ComponentGameInventoryItem | ComponentGameMechanicsConfig | ComponentGamePlayer | ComponentGamePosition | ComponentGameRangeConfig | ComponentGameResourcePool | ComponentGameSaveBonus | ComponentGameSaveDc | ComponentGameScalingConfig | ComponentGameSkillBonus | ComponentGameSpellComponents | ComponentGameSpellData | ComponentGameSpellbook | ComponentGameStats | DamageType | DmSetting | Entity | EntitySheet | EquipmentCategory | Feature | GameEvent | I18NLocale | Item | KnowledgeSnippet | KnowledgeSource | Language | MagicSchool | Message | Proficiency | Prompt | Race | ReviewWorkflowsWorkflow | ReviewWorkflowsWorkflowStage | Room | RuleSet | Spell | Subclass | TimeFrame | Trait | Turn | TurnLock | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser | VoxelChange | WeaponProperty | World;

export type I18NLocale = {
  __typename?: 'I18NLocale';
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection';
  nodes: Array<I18NLocale>;
  pageInfo: Pagination;
};

export type I18NLocaleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<I18NLocaleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type IdFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contains?: InputMaybe<Scalars['ID']['input']>;
  containsi?: InputMaybe<Scalars['ID']['input']>;
  endsWith?: InputMaybe<Scalars['ID']['input']>;
  eq?: InputMaybe<Scalars['ID']['input']>;
  eqi?: InputMaybe<Scalars['ID']['input']>;
  gt?: InputMaybe<Scalars['ID']['input']>;
  gte?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lt?: InputMaybe<Scalars['ID']['input']>;
  lte?: InputMaybe<Scalars['ID']['input']>;
  ne?: InputMaybe<Scalars['ID']['input']>;
  nei?: InputMaybe<Scalars['ID']['input']>;
  not?: InputMaybe<IdFilterInput>;
  notContains?: InputMaybe<Scalars['ID']['input']>;
  notContainsi?: InputMaybe<Scalars['ID']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startsWith?: InputMaybe<Scalars['ID']['input']>;
};

export type IntFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contains?: InputMaybe<Scalars['Int']['input']>;
  containsi?: InputMaybe<Scalars['Int']['input']>;
  endsWith?: InputMaybe<Scalars['Int']['input']>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  eqi?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  nei?: InputMaybe<Scalars['Int']['input']>;
  not?: InputMaybe<IntFilterInput>;
  notContains?: InputMaybe<Scalars['Int']['input']>;
  notContainsi?: InputMaybe<Scalars['Int']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startsWith?: InputMaybe<Scalars['Int']['input']>;
};

export type Item = {
  __typename?: 'Item';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  custom_data?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  equipment_data?: Maybe<ComponentGameEquipmentData>;
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Item>>;
  localizations_connection?: Maybe<ItemRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  rarity?: Maybe<Enum_Item_Rarity>;
  slug: Scalars['String']['output'];
  spell_data?: Maybe<ComponentGameSpellData>;
  type: Enum_Item_Type;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  value?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};


export type ItemLocalizationsArgs = {
  filters?: InputMaybe<ItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ItemLocalizations_ConnectionArgs = {
  filters?: InputMaybe<ItemFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ItemEntityResponseCollection = {
  __typename?: 'ItemEntityResponseCollection';
  nodes: Array<Item>;
  pageInfo: Pagination;
};

export type ItemFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ItemFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  custom_data?: InputMaybe<JsonFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  equipment_data?: InputMaybe<ComponentGameEquipmentDataFiltersInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<ItemFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ItemFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ItemFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  rarity?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  spell_data?: InputMaybe<ComponentGameSpellDataFiltersInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  value?: InputMaybe<IntFilterInput>;
  weight?: InputMaybe<FloatFilterInput>;
};

export type ItemInput = {
  custom_data?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  equipment_data?: InputMaybe<ComponentGameEquipmentDataInput>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  rarity?: InputMaybe<Enum_Item_Rarity>;
  slug?: InputMaybe<Scalars['String']['input']>;
  spell_data?: InputMaybe<ComponentGameSpellDataInput>;
  type?: InputMaybe<Enum_Item_Type>;
  value?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type ItemRelationResponseCollection = {
  __typename?: 'ItemRelationResponseCollection';
  nodes: Array<Item>;
};

export type JsonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  contains?: InputMaybe<Scalars['JSON']['input']>;
  containsi?: InputMaybe<Scalars['JSON']['input']>;
  endsWith?: InputMaybe<Scalars['JSON']['input']>;
  eq?: InputMaybe<Scalars['JSON']['input']>;
  eqi?: InputMaybe<Scalars['JSON']['input']>;
  gt?: InputMaybe<Scalars['JSON']['input']>;
  gte?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  lt?: InputMaybe<Scalars['JSON']['input']>;
  lte?: InputMaybe<Scalars['JSON']['input']>;
  ne?: InputMaybe<Scalars['JSON']['input']>;
  nei?: InputMaybe<Scalars['JSON']['input']>;
  not?: InputMaybe<JsonFilterInput>;
  notContains?: InputMaybe<Scalars['JSON']['input']>;
  notContainsi?: InputMaybe<Scalars['JSON']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  startsWith?: InputMaybe<Scalars['JSON']['input']>;
};

export type KnowledgeSnippet = {
  __typename?: 'KnowledgeSnippet';
  content: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  source?: Maybe<KnowledgeSource>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type KnowledgeSnippetEntityResponseCollection = {
  __typename?: 'KnowledgeSnippetEntityResponseCollection';
  nodes: Array<KnowledgeSnippet>;
  pageInfo: Pagination;
};

export type KnowledgeSnippetFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<KnowledgeSnippetFiltersInput>>>;
  content?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  not?: InputMaybe<KnowledgeSnippetFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<KnowledgeSnippetFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  source?: InputMaybe<KnowledgeSourceFiltersInput>;
  title?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type KnowledgeSnippetInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  source?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type KnowledgeSnippetRelationResponseCollection = {
  __typename?: 'KnowledgeSnippetRelationResponseCollection';
  nodes: Array<KnowledgeSnippet>;
};

export type KnowledgeSource = {
  __typename?: 'KnowledgeSource';
  content: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  origin: Enum_Knowledgesource_Origin;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  snippets: Array<Maybe<KnowledgeSnippet>>;
  snippets_connection?: Maybe<KnowledgeSnippetRelationResponseCollection>;
  tags?: Maybe<Scalars['JSON']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type KnowledgeSourceSnippetsArgs = {
  filters?: InputMaybe<KnowledgeSnippetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type KnowledgeSourceSnippets_ConnectionArgs = {
  filters?: InputMaybe<KnowledgeSnippetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type KnowledgeSourceEntityResponseCollection = {
  __typename?: 'KnowledgeSourceEntityResponseCollection';
  nodes: Array<KnowledgeSource>;
  pageInfo: Pagination;
};

export type KnowledgeSourceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<KnowledgeSourceFiltersInput>>>;
  content?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<KnowledgeSourceFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<KnowledgeSourceFiltersInput>>>;
  origin?: InputMaybe<StringFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  snippets?: InputMaybe<KnowledgeSnippetFiltersInput>;
  tags?: InputMaybe<JsonFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type KnowledgeSourceInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  origin?: InputMaybe<Enum_Knowledgesource_Origin>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  snippets?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  tags?: InputMaybe<Scalars['JSON']['input']>;
};

export type Language = {
  __typename?: 'Language';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  is_rare?: Maybe<Scalars['Boolean']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Language>>;
  localizations_connection?: Maybe<LanguageRelationResponseCollection>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type LanguageLocalizationsArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type LanguageLocalizations_ConnectionArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LanguageEntityResponseCollection = {
  __typename?: 'LanguageEntityResponseCollection';
  nodes: Array<Language>;
  pageInfo: Pagination;
};

export type LanguageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<LanguageFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  is_rare?: InputMaybe<BooleanFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<LanguageFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<LanguageFiltersInput>;
  note?: InputMaybe<StringFilterInput>;
  or?: InputMaybe<Array<InputMaybe<LanguageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type LanguageInput = {
  image?: InputMaybe<Scalars['ID']['input']>;
  is_rare?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type LanguageRelationResponseCollection = {
  __typename?: 'LanguageRelationResponseCollection';
  nodes: Array<Language>;
};

export type LongFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  contains?: InputMaybe<Scalars['Long']['input']>;
  containsi?: InputMaybe<Scalars['Long']['input']>;
  endsWith?: InputMaybe<Scalars['Long']['input']>;
  eq?: InputMaybe<Scalars['Long']['input']>;
  eqi?: InputMaybe<Scalars['Long']['input']>;
  gt?: InputMaybe<Scalars['Long']['input']>;
  gte?: InputMaybe<Scalars['Long']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  lt?: InputMaybe<Scalars['Long']['input']>;
  lte?: InputMaybe<Scalars['Long']['input']>;
  ne?: InputMaybe<Scalars['Long']['input']>;
  nei?: InputMaybe<Scalars['Long']['input']>;
  not?: InputMaybe<LongFilterInput>;
  notContains?: InputMaybe<Scalars['Long']['input']>;
  notContainsi?: InputMaybe<Scalars['Long']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  startsWith?: InputMaybe<Scalars['Long']['input']>;
};

export type MagicSchool = {
  __typename?: 'MagicSchool';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<MagicSchool>>;
  localizations_connection?: Maybe<MagicSchoolRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type MagicSchoolLocalizationsArgs = {
  filters?: InputMaybe<MagicSchoolFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MagicSchoolLocalizations_ConnectionArgs = {
  filters?: InputMaybe<MagicSchoolFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type MagicSchoolEntityResponseCollection = {
  __typename?: 'MagicSchoolEntityResponseCollection';
  nodes: Array<MagicSchool>;
  pageInfo: Pagination;
};

export type MagicSchoolFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MagicSchoolFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<MagicSchoolFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<MagicSchoolFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<MagicSchoolFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type MagicSchoolInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type MagicSchoolRelationResponseCollection = {
  __typename?: 'MagicSchoolRelationResponseCollection';
  nodes: Array<MagicSchool>;
};

export type Message = {
  __typename?: 'Message';
  content: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  images?: Maybe<Scalars['JSON']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  recipient?: Maybe<UsersPermissionsUser>;
  room?: Maybe<Room>;
  senderName?: Maybe<Scalars['String']['output']>;
  senderType?: Maybe<Enum_Message_Sendertype>;
  timestamp?: Maybe<Scalars['Long']['output']>;
  turn?: Maybe<Turn>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type MessageEntityResponseCollection = {
  __typename?: 'MessageEntityResponseCollection';
  nodes: Array<Message>;
  pageInfo: Pagination;
};

export type MessageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<MessageFiltersInput>>>;
  content?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  images?: InputMaybe<JsonFilterInput>;
  not?: InputMaybe<MessageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<MessageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  recipient?: InputMaybe<UsersPermissionsUserFiltersInput>;
  room?: InputMaybe<RoomFiltersInput>;
  senderName?: InputMaybe<StringFilterInput>;
  senderType?: InputMaybe<StringFilterInput>;
  timestamp?: InputMaybe<LongFilterInput>;
  turn?: InputMaybe<TurnFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type MessageInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Scalars['JSON']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  recipient?: InputMaybe<Scalars['ID']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  senderName?: InputMaybe<Scalars['String']['input']>;
  senderType?: InputMaybe<Enum_Message_Sendertype>;
  timestamp?: InputMaybe<Scalars['Long']['input']>;
  turn?: InputMaybe<Scalars['ID']['input']>;
};

export type MessageRelationResponseCollection = {
  __typename?: 'MessageRelationResponseCollection';
  nodes: Array<Message>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCharacter?: Maybe<Scalars['JSON']['output']>;
  castSpell?: Maybe<Scalars['JSON']['output']>;
  /** Change user password. Confirm with the current password. */
  changePassword?: Maybe<UsersPermissionsLoginPayload>;
  createAction?: Maybe<Action>;
  createCharacter?: Maybe<Character>;
  createClass?: Maybe<Class>;
  createDamageType?: Maybe<DamageType>;
  createDmSetting?: Maybe<DmSetting>;
  createEntity?: Maybe<Entity>;
  createEntitySheet?: Maybe<EntitySheet>;
  createEquipmentCategory?: Maybe<EquipmentCategory>;
  createFeature?: Maybe<Feature>;
  createGameEvent?: Maybe<GameEvent>;
  createItem?: Maybe<Item>;
  createKnowledgeSnippet?: Maybe<KnowledgeSnippet>;
  createKnowledgeSource?: Maybe<KnowledgeSource>;
  createLanguage?: Maybe<Language>;
  createMagicSchool?: Maybe<MagicSchool>;
  createMessage?: Maybe<Message>;
  createProficiency?: Maybe<Proficiency>;
  createPrompt?: Maybe<Prompt>;
  createRace?: Maybe<Race>;
  createReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  createReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  createRoom?: Maybe<Room>;
  createSpell?: Maybe<Spell>;
  createSubclass?: Maybe<Subclass>;
  createTimeFrame?: Maybe<TimeFrame>;
  createTrait?: Maybe<Trait>;
  createTurn?: Maybe<Turn>;
  createTurnLock?: Maybe<TurnLock>;
  /** Create a new role */
  createUsersPermissionsRole?: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  createVoxelChange?: Maybe<VoxelChange>;
  createWeaponProperty?: Maybe<WeaponProperty>;
  createWorld?: Maybe<World>;
  deleteAction?: Maybe<DeleteMutationResponse>;
  deleteCharacter?: Maybe<DeleteMutationResponse>;
  deleteClass?: Maybe<DeleteMutationResponse>;
  deleteDamageType?: Maybe<DeleteMutationResponse>;
  deleteDmSetting?: Maybe<DeleteMutationResponse>;
  deleteEntity?: Maybe<DeleteMutationResponse>;
  deleteEntitySheet?: Maybe<DeleteMutationResponse>;
  deleteEquipmentCategory?: Maybe<DeleteMutationResponse>;
  deleteFeature?: Maybe<DeleteMutationResponse>;
  deleteGameEvent?: Maybe<DeleteMutationResponse>;
  deleteItem?: Maybe<DeleteMutationResponse>;
  deleteKnowledgeSnippet?: Maybe<DeleteMutationResponse>;
  deleteKnowledgeSource?: Maybe<DeleteMutationResponse>;
  deleteLanguage?: Maybe<DeleteMutationResponse>;
  deleteMagicSchool?: Maybe<DeleteMutationResponse>;
  deleteMessage?: Maybe<DeleteMutationResponse>;
  deleteProficiency?: Maybe<DeleteMutationResponse>;
  deletePrompt?: Maybe<DeleteMutationResponse>;
  deleteRace?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflow?: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflowStage?: Maybe<DeleteMutationResponse>;
  deleteRoom?: Maybe<DeleteMutationResponse>;
  deleteRuleSet?: Maybe<DeleteMutationResponse>;
  deleteSpell?: Maybe<DeleteMutationResponse>;
  deleteSubclass?: Maybe<DeleteMutationResponse>;
  deleteTimeFrame?: Maybe<DeleteMutationResponse>;
  deleteTrait?: Maybe<DeleteMutationResponse>;
  deleteTurn?: Maybe<DeleteMutationResponse>;
  deleteTurnLock?: Maybe<DeleteMutationResponse>;
  deleteUploadFile?: Maybe<UploadFile>;
  /** Delete an existing role */
  deleteUsersPermissionsRole?: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteVoxelChange?: Maybe<DeleteMutationResponse>;
  deleteWeaponProperty?: Maybe<DeleteMutationResponse>;
  deleteWorld?: Maybe<DeleteMutationResponse>;
  dropItem?: Maybe<Scalars['JSON']['output']>;
  /** Confirm an email users email address */
  emailConfirmation?: Maybe<UsersPermissionsLoginPayload>;
  executeTool?: Maybe<Scalars['JSON']['output']>;
  /** Request a reset password token */
  forgotPassword?: Maybe<UsersPermissionsPasswordPayload>;
  generateAvatarFullBody?: Maybe<Scalars['JSON']['output']>;
  generateAvatarPortrait?: Maybe<Scalars['JSON']['output']>;
  generateAvatarUpperBody?: Maybe<Scalars['JSON']['output']>;
  generateTerrain?: Maybe<Scalars['Boolean']['output']>;
  generateTerrainChunk?: Maybe<Scalars['JSON']['output']>;
  generateWorld?: Maybe<Scalars['JSON']['output']>;
  getAvailableActions?: Maybe<Scalars['JSON']['output']>;
  getEntropy?: Maybe<Scalars['JSON']['output']>;
  getLocationContext?: Maybe<Scalars['JSON']['output']>;
  getMapImage?: Maybe<Scalars['JSON']['output']>;
  getTime?: Maybe<Scalars['JSON']['output']>;
  getWeather?: Maybe<Scalars['JSON']['output']>;
  inspectMap?: Maybe<Scalars['JSON']['output']>;
  interactObject?: Maybe<Scalars['JSON']['output']>;
  joinRoom?: Maybe<Room>;
  listEntities?: Maybe<Scalars['JSON']['output']>;
  login: UsersPermissionsLoginPayload;
  longRest?: Maybe<Scalars['JSON']['output']>;
  modifyTerrain?: Maybe<Scalars['JSON']['output']>;
  moveEntity?: Maybe<Scalars['JSON']['output']>;
  performAction?: Maybe<Scalars['JSON']['output']>;
  performAttack?: Maybe<Scalars['JSON']['output']>;
  performAttackLegacy?: Maybe<Scalars['JSON']['output']>;
  pickupItem?: Maybe<Scalars['JSON']['output']>;
  processTurn?: Maybe<Scalars['JSON']['output']>;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword?: Maybe<UsersPermissionsLoginPayload>;
  retrieveKnowledge?: Maybe<Scalars['JSON']['output']>;
  searchClasses?: Maybe<Scalars['JSON']['output']>;
  searchMonsters?: Maybe<Scalars['JSON']['output']>;
  searchRaces?: Maybe<Scalars['JSON']['output']>;
  searchSpells?: Maybe<Scalars['JSON']['output']>;
  setEntropy?: Maybe<Scalars['JSON']['output']>;
  setTime?: Maybe<Scalars['JSON']['output']>;
  setWeather?: Maybe<Scalars['JSON']['output']>;
  spawnCreature?: Maybe<Scalars['JSON']['output']>;
  spawnEntity?: Maybe<Scalars['JSON']['output']>;
  startGame?: Maybe<Scalars['JSON']['output']>;
  submitAction?: Maybe<Scalars['JSON']['output']>;
  submitAgentAnswer?: Maybe<Scalars['JSON']['output']>;
  throwItem?: Maybe<Scalars['JSON']['output']>;
  updateAction?: Maybe<Action>;
  updateCharacter?: Maybe<Character>;
  updateClass?: Maybe<Class>;
  updateDamageType?: Maybe<DamageType>;
  updateDmSetting?: Maybe<DmSetting>;
  updateEntity?: Maybe<Entity>;
  updateEntitySheet?: Maybe<EntitySheet>;
  updateEquipmentCategory?: Maybe<EquipmentCategory>;
  updateFeature?: Maybe<Feature>;
  updateGameEvent?: Maybe<GameEvent>;
  updateItem?: Maybe<Item>;
  updateKnowledgeSnippet?: Maybe<KnowledgeSnippet>;
  updateKnowledgeSource?: Maybe<KnowledgeSource>;
  updateLanguage?: Maybe<Language>;
  updateMagicSchool?: Maybe<MagicSchool>;
  updateMessage?: Maybe<Message>;
  updateProficiency?: Maybe<Proficiency>;
  updatePrompt?: Maybe<Prompt>;
  updateRace?: Maybe<Race>;
  updateReviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  updateReviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  updateRoom?: Maybe<Room>;
  updateRuleSet?: Maybe<RuleSet>;
  updateSpell?: Maybe<Spell>;
  updateSubclass?: Maybe<Subclass>;
  updateTimeFrame?: Maybe<TimeFrame>;
  updateTrait?: Maybe<Trait>;
  updateTurn?: Maybe<Turn>;
  updateTurnLock?: Maybe<TurnLock>;
  updateUploadFile: UploadFile;
  /** Update an existing role */
  updateUsersPermissionsRole?: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  updateVoxelChange?: Maybe<VoxelChange>;
  updateWeaponProperty?: Maybe<WeaponProperty>;
  updateWorld?: Maybe<World>;
};


export type MutationAddCharacterArgs = {
  character?: InputMaybe<Scalars['JSON']['input']>;
  roomId: Scalars['ID']['input'];
};


export type MutationCastSpellArgs = {
  input: ToolCastSpellInput;
  roomId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationCreateActionArgs = {
  data: ActionInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCharacterArgs = {
  data: CharacterInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateClassArgs = {
  data: ClassInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateDamageTypeArgs = {
  data: DamageTypeInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateDmSettingArgs = {
  data: DmSettingInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateEntityArgs = {
  data: EntityInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateEntitySheetArgs = {
  data: EntitySheetInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateEquipmentCategoryArgs = {
  data: EquipmentCategoryInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateFeatureArgs = {
  data: FeatureInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateGameEventArgs = {
  data: GameEventInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateItemArgs = {
  data: ItemInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateKnowledgeSnippetArgs = {
  data: KnowledgeSnippetInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateKnowledgeSourceArgs = {
  data: KnowledgeSourceInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateLanguageArgs = {
  data: LanguageInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateMagicSchoolArgs = {
  data: MagicSchoolInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateMessageArgs = {
  data: MessageInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateProficiencyArgs = {
  data: ProficiencyInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreatePromptArgs = {
  data: PromptInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRaceArgs = {
  data: RaceInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRoomArgs = {
  data?: InputMaybe<Scalars['JSON']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateSpellArgs = {
  data: SpellInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateSubclassArgs = {
  data: SubclassInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateTimeFrameArgs = {
  data: TimeFrameInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateTraitArgs = {
  data: TraitInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateTurnArgs = {
  data: TurnInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateTurnLockArgs = {
  data: TurnLockInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};


export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};


export type MutationCreateVoxelChangeArgs = {
  data: VoxelChangeInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateWeaponPropertyArgs = {
  data: WeaponPropertyInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateWorldArgs = {
  data: WorldInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationDeleteActionArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteCharacterArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteClassArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteDamageTypeArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteDmSettingArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteEntityArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteEntitySheetArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentCategoryArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteFeatureArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteGameEventArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteItemArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteKnowledgeSnippetArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteKnowledgeSourceArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteLanguageArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteMagicSchoolArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteMessageArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteProficiencyArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeletePromptArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteRaceArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteRoomArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteRuleSetArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteSpellArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteSubclassArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteTimeFrameArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteTraitArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteTurnArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteTurnLockArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteVoxelChangeArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteWeaponPropertyArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteWorldArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDropItemArgs = {
  input: ToolDropItemInput;
  roomId: Scalars['String']['input'];
};


export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']['input'];
};


export type MutationExecuteToolArgs = {
  command: Scalars['String']['input'];
  roomId: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationGenerateAvatarFullBodyArgs = {
  payload: Scalars['JSON']['input'];
  portrait: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
  upperBody: Scalars['JSON']['input'];
};


export type MutationGenerateAvatarPortraitArgs = {
  payload: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGenerateAvatarUpperBodyArgs = {
  payload: Scalars['JSON']['input'];
  portrait: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGenerateTerrainArgs = {
  roomId: Scalars['ID']['input'];
};


export type MutationGenerateTerrainChunkArgs = {
  chunkSize?: InputMaybe<Scalars['Int']['input']>;
  chunkX: Scalars['Int']['input'];
  chunkY: Scalars['Int']['input'];
  roomId: Scalars['ID']['input'];
};


export type MutationGenerateWorldArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['ID']['input'];
};


export type MutationGetAvailableActionsArgs = {
  input: ToolGetAvailableActionsInput;
  roomId: Scalars['String']['input'];
};


export type MutationGetEntropyArgs = {
  input: ToolGetEntropyInput;
  roomId: Scalars['String']['input'];
};


export type MutationGetLocationContextArgs = {
  input: ToolGetLocationContextInput;
  roomId: Scalars['String']['input'];
};


export type MutationGetMapImageArgs = {
  input: ToolGetMapImageInput;
  roomId: Scalars['String']['input'];
};


export type MutationGetTimeArgs = {
  input: ToolGetTimeInput;
  roomId: Scalars['String']['input'];
};


export type MutationGetWeatherArgs = {
  input: ToolGetWeatherInput;
  roomId: Scalars['String']['input'];
};


export type MutationInspectMapArgs = {
  input: ToolInspectMapInput;
  roomId: Scalars['String']['input'];
};


export type MutationInteractObjectArgs = {
  input: ToolInteractObjectInput;
  roomId: Scalars['String']['input'];
};


export type MutationJoinRoomArgs = {
  code: Scalars['String']['input'];
};


export type MutationListEntitiesArgs = {
  input: ToolListEntitiesInput;
  roomId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput;
};


export type MutationLongRestArgs = {
  input: ToolLongRestInput;
  roomId: Scalars['String']['input'];
};


export type MutationModifyTerrainArgs = {
  input: ToolModifyTerrainInput;
  roomId: Scalars['String']['input'];
};


export type MutationMoveEntityArgs = {
  input: ToolMoveEntityInput;
  roomId: Scalars['String']['input'];
};


export type MutationPerformActionArgs = {
  input: ToolPerformActionInput;
  roomId: Scalars['String']['input'];
};


export type MutationPerformAttackArgs = {
  input: ToolPerformAttackInput;
  roomId: Scalars['String']['input'];
};


export type MutationPerformAttackLegacyArgs = {
  input: ToolPerformAttackLegacyInput;
  roomId: Scalars['String']['input'];
};


export type MutationPickupItemArgs = {
  input: ToolPickupItemInput;
  roomId: Scalars['String']['input'];
};


export type MutationProcessTurnArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  messages?: InputMaybe<Scalars['JSON']['input']>;
  roomId: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput;
};


export type MutationResetPasswordArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationRetrieveKnowledgeArgs = {
  input: ToolRetrieveKnowledgeInput;
  roomId: Scalars['String']['input'];
};


export type MutationSearchClassesArgs = {
  input: ToolSearchClassesInput;
  roomId: Scalars['String']['input'];
};


export type MutationSearchMonstersArgs = {
  input: ToolSearchMonstersInput;
  roomId: Scalars['String']['input'];
};


export type MutationSearchRacesArgs = {
  input: ToolSearchRacesInput;
  roomId: Scalars['String']['input'];
};


export type MutationSearchSpellsArgs = {
  input: ToolSearchSpellsInput;
  roomId: Scalars['String']['input'];
};


export type MutationSetEntropyArgs = {
  input: ToolSetEntropyInput;
  roomId: Scalars['String']['input'];
};


export type MutationSetTimeArgs = {
  input: ToolSetTimeInput;
  roomId: Scalars['String']['input'];
};


export type MutationSetWeatherArgs = {
  input: ToolSetWeatherInput;
  roomId: Scalars['String']['input'];
};


export type MutationSpawnCreatureArgs = {
  creature?: InputMaybe<Scalars['JSON']['input']>;
  roomId: Scalars['ID']['input'];
};


export type MutationSpawnEntityArgs = {
  input: ToolSpawnEntityInput;
  roomId: Scalars['String']['input'];
};


export type MutationStartGameArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['ID']['input'];
  streamId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSubmitActionArgs = {
  action: Scalars['String']['input'];
  mode?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['ID']['input'];
};


export type MutationSubmitAgentAnswerArgs = {
  answer: Scalars['String']['input'];
  questionId: Scalars['ID']['input'];
};


export type MutationThrowItemArgs = {
  input: ToolThrowItemInput;
  roomId: Scalars['String']['input'];
};


export type MutationUpdateActionArgs = {
  data: ActionInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCharacterArgs = {
  data: CharacterInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateClassArgs = {
  data: ClassInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateDamageTypeArgs = {
  data: DamageTypeInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateDmSettingArgs = {
  data: DmSettingInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateEntityArgs = {
  data: EntityInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateEntitySheetArgs = {
  data: EntitySheetInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateEquipmentCategoryArgs = {
  data: EquipmentCategoryInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateFeatureArgs = {
  data: FeatureInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateGameEventArgs = {
  data: GameEventInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateItemArgs = {
  data: ItemInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateKnowledgeSnippetArgs = {
  data: KnowledgeSnippetInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateKnowledgeSourceArgs = {
  data: KnowledgeSourceInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateLanguageArgs = {
  data: LanguageInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateMagicSchoolArgs = {
  data: MagicSchoolInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateMessageArgs = {
  data: MessageInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateProficiencyArgs = {
  data: ProficiencyInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdatePromptArgs = {
  data: PromptInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRaceArgs = {
  data: RaceInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRoomArgs = {
  data: RoomInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRuleSetArgs = {
  data: RuleSetInput;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSpellArgs = {
  data: SpellInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSubclassArgs = {
  data: SubclassInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateTimeFrameArgs = {
  data: TimeFrameInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateTraitArgs = {
  data: TraitInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateTurnArgs = {
  data: TurnInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateTurnLockArgs = {
  data: TurnLockInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateUploadFileArgs = {
  id: Scalars['ID']['input'];
  info?: InputMaybe<FileInfoInput>;
};


export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateVoxelChangeArgs = {
  data: VoxelChangeInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateWeaponPropertyArgs = {
  data: WeaponPropertyInput;
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateWorldArgs = {
  data: WorldInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};

export type Pagination = {
  __typename?: 'Pagination';
  page: Scalars['Int']['output'];
  pageCount: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationArg = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type Proficiency = {
  __typename?: 'Proficiency';
  classes: Array<Maybe<Class>>;
  classes_connection?: Maybe<ClassRelationResponseCollection>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Proficiency>>;
  localizations_connection?: Maybe<ProficiencyRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  races: Array<Maybe<Race>>;
  races_connection?: Maybe<RaceRelationResponseCollection>;
  slug: Scalars['String']['output'];
  traits: Array<Maybe<Trait>>;
  traits_connection?: Maybe<TraitRelationResponseCollection>;
  type?: Maybe<Enum_Proficiency_Type>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ProficiencyClassesArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyClasses_ConnectionArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyLocalizationsArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyLocalizations_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyRacesArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyRaces_ConnectionArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyTraitsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProficiencyTraits_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ProficiencyEntityResponseCollection = {
  __typename?: 'ProficiencyEntityResponseCollection';
  nodes: Array<Proficiency>;
  pageInfo: Pagination;
};

export type ProficiencyFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ProficiencyFiltersInput>>>;
  classes?: InputMaybe<ClassFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<ProficiencyFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ProficiencyFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ProficiencyFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  races?: InputMaybe<RaceFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  traits?: InputMaybe<TraitFiltersInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ProficiencyInput = {
  classes?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  races?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  traits?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  type?: InputMaybe<Enum_Proficiency_Type>;
};

export type ProficiencyRelationResponseCollection = {
  __typename?: 'ProficiencyRelationResponseCollection';
  nodes: Array<Proficiency>;
};

export type Prompt = {
  __typename?: 'Prompt';
  category?: Maybe<Enum_Prompt_Category>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Prompt>>;
  localizations_connection?: Maybe<PromptRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type PromptLocalizationsArgs = {
  filters?: InputMaybe<PromptFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type PromptLocalizations_ConnectionArgs = {
  filters?: InputMaybe<PromptFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PromptEntityResponseCollection = {
  __typename?: 'PromptEntityResponseCollection';
  nodes: Array<Prompt>;
  pageInfo: Pagination;
};

export type PromptFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<PromptFiltersInput>>>;
  category?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  key?: InputMaybe<StringFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<PromptFiltersInput>;
  not?: InputMaybe<PromptFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<PromptFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  text?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type PromptInput = {
  category?: InputMaybe<Enum_Prompt_Category>;
  key?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type PromptRelationResponseCollection = {
  __typename?: 'PromptRelationResponseCollection';
  nodes: Array<Prompt>;
};

export enum PublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Query = {
  __typename?: 'Query';
  abilities?: Maybe<Array<Maybe<Ability>>>;
  action?: Maybe<Action>;
  actions: Array<Maybe<Action>>;
  actions_connection?: Maybe<ActionEntityResponseCollection>;
  alignments?: Maybe<Array<Maybe<Alignment>>>;
  backgrounds?: Maybe<Array<Maybe<Background>>>;
  character?: Maybe<Character>;
  characters: Array<Maybe<Character>>;
  characters_connection?: Maybe<CharacterEntityResponseCollection>;
  class?: Maybe<Class>;
  classes: Array<Maybe<Class>>;
  classes_connection?: Maybe<ClassEntityResponseCollection>;
  conditions?: Maybe<Array<Maybe<GameCondition>>>;
  damageType?: Maybe<DamageType>;
  damageTypes: Array<Maybe<DamageType>>;
  damageTypes_connection?: Maybe<DamageTypeEntityResponseCollection>;
  dmSetting?: Maybe<DmSetting>;
  dmSettings: Array<Maybe<DmSetting>>;
  dmSettings_connection?: Maybe<DmSettingEntityResponseCollection>;
  entities: Array<Maybe<Entity>>;
  entities_connection?: Maybe<EntityEntityResponseCollection>;
  entity?: Maybe<Entity>;
  entitySheet?: Maybe<EntitySheet>;
  entitySheets: Array<Maybe<EntitySheet>>;
  entitySheets_connection?: Maybe<EntitySheetEntityResponseCollection>;
  equipmentCategories: Array<Maybe<EquipmentCategory>>;
  equipmentCategories_connection?: Maybe<EquipmentCategoryEntityResponseCollection>;
  equipmentCategory?: Maybe<EquipmentCategory>;
  feature?: Maybe<Feature>;
  features: Array<Maybe<Feature>>;
  features_connection?: Maybe<FeatureEntityResponseCollection>;
  gameEvent?: Maybe<GameEvent>;
  gameEvents: Array<Maybe<GameEvent>>;
  gameEvents_connection?: Maybe<GameEventEntityResponseCollection>;
  gameView?: Maybe<GameView>;
  getAgentLogs?: Maybe<Array<Maybe<AgentLog>>>;
  getAgentTools: Array<Maybe<AgentToolDefinition>>;
  getTimeFrame?: Maybe<Scalars['JSON']['output']>;
  getWorldTime?: Maybe<WorldTime>;
  i18NLocale?: Maybe<I18NLocale>;
  i18NLocales: Array<Maybe<I18NLocale>>;
  i18NLocales_connection?: Maybe<I18NLocaleEntityResponseCollection>;
  item?: Maybe<Item>;
  items: Array<Maybe<Item>>;
  items_connection?: Maybe<ItemEntityResponseCollection>;
  knowledgeSnippet?: Maybe<KnowledgeSnippet>;
  knowledgeSnippets: Array<Maybe<KnowledgeSnippet>>;
  knowledgeSnippets_connection?: Maybe<KnowledgeSnippetEntityResponseCollection>;
  knowledgeSource?: Maybe<KnowledgeSource>;
  knowledgeSources: Array<Maybe<KnowledgeSource>>;
  knowledgeSources_connection?: Maybe<KnowledgeSourceEntityResponseCollection>;
  language?: Maybe<Language>;
  languages: Array<Maybe<Language>>;
  languages_connection?: Maybe<LanguageEntityResponseCollection>;
  magicSchool?: Maybe<MagicSchool>;
  magicSchools: Array<Maybe<MagicSchool>>;
  magicSchools_connection?: Maybe<MagicSchoolEntityResponseCollection>;
  me?: Maybe<UsersPermissionsMe>;
  message?: Maybe<Message>;
  messages: Array<Maybe<Message>>;
  messages_connection?: Maybe<MessageEntityResponseCollection>;
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyEntityResponseCollection>;
  proficiency?: Maybe<Proficiency>;
  prompt?: Maybe<Prompt>;
  prompts: Array<Maybe<Prompt>>;
  prompts_connection?: Maybe<PromptEntityResponseCollection>;
  race?: Maybe<Race>;
  races: Array<Maybe<Race>>;
  races_connection?: Maybe<RaceEntityResponseCollection>;
  reviewWorkflowsWorkflow?: Maybe<ReviewWorkflowsWorkflow>;
  reviewWorkflowsWorkflowStage?: Maybe<ReviewWorkflowsWorkflowStage>;
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  reviewWorkflowsWorkflowStages_connection?: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>;
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>;
  reviewWorkflowsWorkflows_connection?: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>;
  room?: Maybe<Room>;
  rooms: Array<Maybe<Room>>;
  rooms_connection?: Maybe<RoomEntityResponseCollection>;
  ruleSet?: Maybe<RuleSet>;
  searchEntities: Array<Maybe<SearchResult>>;
  semanticSearch?: Maybe<Scalars['JSON']['output']>;
  skills?: Maybe<Array<Maybe<Skill>>>;
  spell?: Maybe<Spell>;
  spells: Array<Maybe<Spell>>;
  spells_connection?: Maybe<SpellEntityResponseCollection>;
  subclass?: Maybe<Subclass>;
  subclasses: Array<Maybe<Subclass>>;
  subclasses_connection?: Maybe<SubclassEntityResponseCollection>;
  timeFrame?: Maybe<TimeFrame>;
  timeFrames: Array<Maybe<TimeFrame>>;
  timeFrames_connection?: Maybe<TimeFrameEntityResponseCollection>;
  trait?: Maybe<Trait>;
  traits: Array<Maybe<Trait>>;
  traits_connection?: Maybe<TraitEntityResponseCollection>;
  turn?: Maybe<Turn>;
  turnLock?: Maybe<TurnLock>;
  turnLocks: Array<Maybe<TurnLock>>;
  turnLocks_connection?: Maybe<TurnLockEntityResponseCollection>;
  turns: Array<Maybe<Turn>>;
  turns_connection?: Maybe<TurnEntityResponseCollection>;
  uploadFile?: Maybe<UploadFile>;
  uploadFiles: Array<Maybe<UploadFile>>;
  uploadFiles_connection?: Maybe<UploadFileEntityResponseCollection>;
  usersPermissionsRole?: Maybe<UsersPermissionsRole>;
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>;
  usersPermissionsRoles_connection?: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser?: Maybe<UsersPermissionsUser>;
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>;
  usersPermissionsUsers_connection?: Maybe<UsersPermissionsUserEntityResponseCollection>;
  voxelChange?: Maybe<VoxelChange>;
  voxelChanges: Array<Maybe<VoxelChange>>;
  voxelChanges_connection?: Maybe<VoxelChangeEntityResponseCollection>;
  voxelPreview: Array<Maybe<VoxelChunk>>;
  weaponProperties: Array<Maybe<WeaponProperty>>;
  weaponProperties_connection?: Maybe<WeaponPropertyEntityResponseCollection>;
  weaponProperty?: Maybe<WeaponProperty>;
  world?: Maybe<World>;
  worlds: Array<Maybe<World>>;
  worlds_connection?: Maybe<WorldEntityResponseCollection>;
};


export type QueryActionArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryActionsArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryActions_ConnectionArgs = {
  filters?: InputMaybe<ActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCharacterArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCharactersArgs = {
  filters?: InputMaybe<CharacterFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCharacters_ConnectionArgs = {
  filters?: InputMaybe<CharacterFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryClassArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryClassesArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryClasses_ConnectionArgs = {
  filters?: InputMaybe<ClassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDamageTypeArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDamageTypesArgs = {
  filters?: InputMaybe<DamageTypeFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDamageTypes_ConnectionArgs = {
  filters?: InputMaybe<DamageTypeFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDmSettingArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDmSettingsArgs = {
  filters?: InputMaybe<DmSettingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryDmSettings_ConnectionArgs = {
  filters?: InputMaybe<DmSettingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntitiesArgs = {
  filters?: InputMaybe<EntityFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntities_ConnectionArgs = {
  filters?: InputMaybe<EntityFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntityArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntitySheetArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntitySheetsArgs = {
  filters?: InputMaybe<EntitySheetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEntitySheets_ConnectionArgs = {
  filters?: InputMaybe<EntitySheetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEquipmentCategoriesArgs = {
  filters?: InputMaybe<EquipmentCategoryFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEquipmentCategories_ConnectionArgs = {
  filters?: InputMaybe<EquipmentCategoryFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryEquipmentCategoryArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFeatureArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFeaturesArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryFeatures_ConnectionArgs = {
  filters?: InputMaybe<FeatureFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGameEventArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGameEventsArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGameEvents_ConnectionArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryGameViewArgs = {
  roomId: Scalars['ID']['input'];
};


export type QueryGetAgentLogsArgs = {
  roomId: Scalars['ID']['input'];
};


export type QueryGetTimeFrameArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetWorldTimeArgs = {
  roomId: Scalars['ID']['input'];
};


export type QueryI18NLocaleArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocalesArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocales_ConnectionArgs = {
  filters?: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryItemArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryItemsArgs = {
  filters?: InputMaybe<ItemFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryItems_ConnectionArgs = {
  filters?: InputMaybe<ItemFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSnippetArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSnippetsArgs = {
  filters?: InputMaybe<KnowledgeSnippetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSnippets_ConnectionArgs = {
  filters?: InputMaybe<KnowledgeSnippetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSourceArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSourcesArgs = {
  filters?: InputMaybe<KnowledgeSourceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryKnowledgeSources_ConnectionArgs = {
  filters?: InputMaybe<KnowledgeSourceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLanguageArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLanguagesArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryLanguages_ConnectionArgs = {
  filters?: InputMaybe<LanguageFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMagicSchoolArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMagicSchoolsArgs = {
  filters?: InputMaybe<MagicSchoolFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMagicSchools_ConnectionArgs = {
  filters?: InputMaybe<MagicSchoolFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMessageArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMessagesArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryMessages_ConnectionArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryProficiencyArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPromptArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPromptsArgs = {
  filters?: InputMaybe<PromptFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPrompts_ConnectionArgs = {
  filters?: InputMaybe<PromptFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRaceArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRacesArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRaces_ConnectionArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowsArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflows_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRoomArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRoomsArgs = {
  filters?: InputMaybe<RoomFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRooms_ConnectionArgs = {
  filters?: InputMaybe<RoomFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRuleSetArgs = {
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySearchEntitiesArgs = {
  query: Scalars['String']['input'];
};


export type QuerySemanticSearchArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  targets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QuerySpellArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySpellsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySpells_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubclassArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubclassesArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubclasses_ConnectionArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTimeFrameArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTimeFramesArgs = {
  filters?: InputMaybe<TimeFrameFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTimeFrames_ConnectionArgs = {
  filters?: InputMaybe<TimeFrameFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTraitArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTraitsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTraits_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurnArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurnLockArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurnLocksArgs = {
  filters?: InputMaybe<TurnLockFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurnLocks_ConnectionArgs = {
  filters?: InputMaybe<TurnLockFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurnsArgs = {
  filters?: InputMaybe<TurnFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryTurns_ConnectionArgs = {
  filters?: InputMaybe<TurnFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFileArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFilesArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFiles_ConnectionArgs = {
  filters?: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoleArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRolesArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoles_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUserArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryVoxelChangeArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryVoxelChangesArgs = {
  filters?: InputMaybe<VoxelChangeFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryVoxelChanges_ConnectionArgs = {
  filters?: InputMaybe<VoxelChangeFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryVoxelPreviewArgs = {
  chunks: Array<InputMaybe<ChunkRequestInput>>;
  config: WorldConfigInput;
};


export type QueryWeaponPropertiesArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryWeaponProperties_ConnectionArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryWeaponPropertyArgs = {
  documentId: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryWorldArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryWorldsArgs = {
  filters?: InputMaybe<WorldFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryWorlds_ConnectionArgs = {
  filters?: InputMaybe<WorldFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};

export type Race = {
  __typename?: 'Race';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Race>>;
  localizations_connection?: Maybe<RaceRelationResponseCollection>;
  name: Scalars['String']['output'];
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  size?: Maybe<Enum_Race_Size>;
  slug: Scalars['String']['output'];
  speed?: Maybe<Scalars['JSON']['output']>;
  traits: Array<Maybe<Trait>>;
  traits_connection?: Maybe<TraitRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type RaceLocalizationsArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RaceLocalizations_ConnectionArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RaceProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RaceProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RaceTraitsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RaceTraits_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type RaceEntityResponseCollection = {
  __typename?: 'RaceEntityResponseCollection';
  nodes: Array<Race>;
  pageInfo: Pagination;
};

export type RaceFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<RaceFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<RaceFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<RaceFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<RaceFiltersInput>>>;
  proficiencies?: InputMaybe<ProficiencyFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  size?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  speed?: InputMaybe<JsonFilterInput>;
  traits?: InputMaybe<TraitFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type RaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proficiencies?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  size?: InputMaybe<Enum_Race_Size>;
  slug?: InputMaybe<Scalars['String']['input']>;
  speed?: InputMaybe<Scalars['JSON']['input']>;
  traits?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type RaceRelationResponseCollection = {
  __typename?: 'RaceRelationResponseCollection';
  nodes: Array<Race>;
};

export type ReviewWorkflowsWorkflow = {
  __typename?: 'ReviewWorkflowsWorkflow';
  contentTypes: Scalars['JSON']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  stageRequiredToPublish?: Maybe<ReviewWorkflowsWorkflowStage>;
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  stages_connection?: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ReviewWorkflowsWorkflowStagesArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ReviewWorkflowsWorkflowEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflow>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  contentTypes?: InputMaybe<JsonFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  stageRequiredToPublish?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  stages?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type ReviewWorkflowsWorkflowInput = {
  contentTypes?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  stageRequiredToPublish?: InputMaybe<Scalars['ID']['input']>;
  stages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ReviewWorkflowsWorkflowStage = {
  __typename?: 'ReviewWorkflowsWorkflowStage';
  color?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workflow?: Maybe<ReviewWorkflowsWorkflow>;
};

export type ReviewWorkflowsWorkflowStageEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowStageFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  color?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  workflow?: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
};

export type ReviewWorkflowsWorkflowStageInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  workflow?: InputMaybe<Scalars['ID']['input']>;
};

export type ReviewWorkflowsWorkflowStageRelationResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageRelationResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
};

export type Room = {
  __typename?: 'Room';
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currentTimeFrame?: Maybe<TimeFrame>;
  dmSettings?: Maybe<DmSetting>;
  documentId: Scalars['ID']['output'];
  entity_sheets: Array<Maybe<EntitySheet>>;
  entity_sheets_connection?: Maybe<EntitySheetRelationResponseCollection>;
  entropyState?: Maybe<Scalars['JSON']['output']>;
  events: Array<Maybe<GameEvent>>;
  events_connection?: Maybe<GameEventRelationResponseCollection>;
  exploredTiles?: Maybe<Scalars['JSON']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isProcessing?: Maybe<Scalars['Boolean']['output']>;
  messages: Array<Maybe<Message>>;
  messages_connection?: Maybe<MessageRelationResponseCollection>;
  owner?: Maybe<UsersPermissionsUser>;
  phase?: Maybe<Enum_Room_Phase>;
  players?: Maybe<Array<Maybe<ComponentGamePlayer>>>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  roomId?: Maybe<Scalars['String']['output']>;
  timeFrames: Array<Maybe<TimeFrame>>;
  timeFrames_connection?: Maybe<TimeFrameRelationResponseCollection>;
  turnData?: Maybe<Scalars['JSON']['output']>;
  turns: Array<Maybe<Turn>>;
  turns_connection?: Maybe<TurnRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  world?: Maybe<World>;
};


export type RoomEntity_SheetsArgs = {
  filters?: InputMaybe<EntitySheetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomEntity_Sheets_ConnectionArgs = {
  filters?: InputMaybe<EntitySheetFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomEventsArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomEvents_ConnectionArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomMessagesArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomMessages_ConnectionArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomPlayersArgs = {
  filters?: InputMaybe<ComponentGamePlayerFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomTimeFramesArgs = {
  filters?: InputMaybe<TimeFrameFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomTimeFrames_ConnectionArgs = {
  filters?: InputMaybe<TimeFrameFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomTurnsArgs = {
  filters?: InputMaybe<TurnFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type RoomTurns_ConnectionArgs = {
  filters?: InputMaybe<TurnFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type RoomEntityResponseCollection = {
  __typename?: 'RoomEntityResponseCollection';
  nodes: Array<Room>;
  pageInfo: Pagination;
};

export type RoomFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<RoomFiltersInput>>>;
  code?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  currentTimeFrame?: InputMaybe<TimeFrameFiltersInput>;
  dmSettings?: InputMaybe<DmSettingFiltersInput>;
  documentId?: InputMaybe<IdFilterInput>;
  entity_sheets?: InputMaybe<EntitySheetFiltersInput>;
  entropyState?: InputMaybe<JsonFilterInput>;
  events?: InputMaybe<GameEventFiltersInput>;
  exploredTiles?: InputMaybe<JsonFilterInput>;
  isActive?: InputMaybe<BooleanFilterInput>;
  isProcessing?: InputMaybe<BooleanFilterInput>;
  messages?: InputMaybe<MessageFiltersInput>;
  not?: InputMaybe<RoomFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<RoomFiltersInput>>>;
  owner?: InputMaybe<UsersPermissionsUserFiltersInput>;
  phase?: InputMaybe<StringFilterInput>;
  players?: InputMaybe<ComponentGamePlayerFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  roomId?: InputMaybe<StringFilterInput>;
  timeFrames?: InputMaybe<TimeFrameFiltersInput>;
  turnData?: InputMaybe<JsonFilterInput>;
  turns?: InputMaybe<TurnFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  world?: InputMaybe<WorldFiltersInput>;
};

export type RoomInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  currentTimeFrame?: InputMaybe<Scalars['ID']['input']>;
  dmSettings?: InputMaybe<Scalars['ID']['input']>;
  entity_sheets?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  entropyState?: InputMaybe<Scalars['JSON']['input']>;
  events?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  exploredTiles?: InputMaybe<Scalars['JSON']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isProcessing?: InputMaybe<Scalars['Boolean']['input']>;
  messages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  owner?: InputMaybe<Scalars['ID']['input']>;
  phase?: InputMaybe<Enum_Room_Phase>;
  players?: InputMaybe<Array<InputMaybe<ComponentGamePlayerInput>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  roomId?: InputMaybe<Scalars['String']['input']>;
  timeFrames?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  turnData?: InputMaybe<Scalars['JSON']['input']>;
  turns?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  world?: InputMaybe<Scalars['ID']['input']>;
};

export type RoomRelationResponseCollection = {
  __typename?: 'RoomRelationResponseCollection';
  nodes: Array<Room>;
};

export type RuleSet = {
  __typename?: 'RuleSet';
  ability_caps?: Maybe<Scalars['JSON']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  full_caster_slots?: Maybe<Scalars['JSON']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<RuleSet>>;
  localizations_connection?: Maybe<RuleSetRelationResponseCollection>;
  proficiency_table: Scalars['JSON']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  xp_table: Scalars['JSON']['output'];
};

export type RuleSetInput = {
  ability_caps?: InputMaybe<Scalars['JSON']['input']>;
  full_caster_slots?: InputMaybe<Scalars['JSON']['input']>;
  proficiency_table?: InputMaybe<Scalars['JSON']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  xp_table?: InputMaybe<Scalars['JSON']['input']>;
};

export type RuleSetRelationResponseCollection = {
  __typename?: 'RuleSetRelationResponseCollection';
  nodes: Array<RuleSet>;
};

export type RuntimeAction = {
  __typename?: 'RuntimeAction';
  attackBonus?: Maybe<Scalars['Int']['output']>;
  cost?: Maybe<RuntimeCost>;
  damage?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  img?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  range?: Maybe<RuntimeRange>;
  sourceId?: Maybe<Scalars['String']['output']>;
  sourceType?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type RuntimeCost = {
  __typename?: 'RuntimeCost';
  actionType?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Int']['output']>;
  resourceId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type RuntimeRange = {
  __typename?: 'RuntimeRange';
  reach?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Int']['output']>;
};

export type SearchResult = {
  __typename?: 'SearchResult';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Skill = {
  __typename?: 'Skill';
  abilityScore?: Maybe<Ability>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Spell = {
  __typename?: 'Spell';
  casting_config?: Maybe<ComponentGameCastingConfig>;
  condition_instances?: Maybe<Array<Maybe<ComponentGameConditionInstance>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  damage_instances?: Maybe<Array<Maybe<ComponentGameDamageInstance>>>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  duration_config?: Maybe<ComponentGameDurationConfig>;
  image?: Maybe<UploadFile>;
  level?: Maybe<Scalars['Int']['output']>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Spell>>;
  localizations_connection?: Maybe<SpellRelationResponseCollection>;
  mechanics_config?: Maybe<ComponentGameMechanicsConfig>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  range_config?: Maybe<ComponentGameRangeConfig>;
  scaling_config?: Maybe<ComponentGameScalingConfig>;
  school?: Maybe<Enum_Spell_School>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type SpellCondition_InstancesArgs = {
  filters?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SpellDamage_InstancesArgs = {
  filters?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SpellLocalizationsArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SpellLocalizations_ConnectionArgs = {
  filters?: InputMaybe<SpellFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SpellEntityResponseCollection = {
  __typename?: 'SpellEntityResponseCollection';
  nodes: Array<Spell>;
  pageInfo: Pagination;
};

export type SpellFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<SpellFiltersInput>>>;
  casting_config?: InputMaybe<ComponentGameCastingConfigFiltersInput>;
  condition_instances?: InputMaybe<ComponentGameConditionInstanceFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  damage_instances?: InputMaybe<ComponentGameDamageInstanceFiltersInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  duration_config?: InputMaybe<ComponentGameDurationConfigFiltersInput>;
  level?: InputMaybe<IntFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<SpellFiltersInput>;
  mechanics_config?: InputMaybe<ComponentGameMechanicsConfigFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<SpellFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<SpellFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  range_config?: InputMaybe<ComponentGameRangeConfigFiltersInput>;
  scaling_config?: InputMaybe<ComponentGameScalingConfigFiltersInput>;
  school?: InputMaybe<StringFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type SpellInput = {
  casting_config?: InputMaybe<ComponentGameCastingConfigInput>;
  condition_instances?: InputMaybe<Array<InputMaybe<ComponentGameConditionInstanceInput>>>;
  damage_instances?: InputMaybe<Array<InputMaybe<ComponentGameDamageInstanceInput>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration_config?: InputMaybe<ComponentGameDurationConfigInput>;
  image?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  mechanics_config?: InputMaybe<ComponentGameMechanicsConfigInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  range_config?: InputMaybe<ComponentGameRangeConfigInput>;
  scaling_config?: InputMaybe<ComponentGameScalingConfigInput>;
  school?: InputMaybe<Enum_Spell_School>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type SpellRelationResponseCollection = {
  __typename?: 'SpellRelationResponseCollection';
  nodes: Array<Spell>;
};

export type StringFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  containsi?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  eqi?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  nei?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<StringFilterInput>;
  notContains?: InputMaybe<Scalars['String']['input']>;
  notContainsi?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type Subclass = {
  __typename?: 'Subclass';
  class?: Maybe<Class>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Subclass>>;
  localizations_connection?: Maybe<SubclassRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  subclass_flavor?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type SubclassLocalizationsArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SubclassLocalizations_ConnectionArgs = {
  filters?: InputMaybe<SubclassFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SubclassEntityResponseCollection = {
  __typename?: 'SubclassEntityResponseCollection';
  nodes: Array<Subclass>;
  pageInfo: Pagination;
};

export type SubclassFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<SubclassFiltersInput>>>;
  class?: InputMaybe<ClassFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<SubclassFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<SubclassFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<SubclassFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  subclass_flavor?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type SubclassInput = {
  class?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  subclass_flavor?: InputMaybe<Scalars['String']['input']>;
};

export type SubclassRelationResponseCollection = {
  __typename?: 'SubclassRelationResponseCollection';
  nodes: Array<Subclass>;
};

export type TimeFrame = {
  __typename?: 'TimeFrame';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  entropySnapshot?: Maybe<Scalars['JSON']['output']>;
  events: Array<Maybe<GameEvent>>;
  events_connection?: Maybe<GameEventRelationResponseCollection>;
  gameState: Scalars['JSON']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  room?: Maybe<Room>;
  timestamp: Scalars['DateTime']['output'];
  turnNumber: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type TimeFrameEventsArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TimeFrameEvents_ConnectionArgs = {
  filters?: InputMaybe<GameEventFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TimeFrameEntityResponseCollection = {
  __typename?: 'TimeFrameEntityResponseCollection';
  nodes: Array<TimeFrame>;
  pageInfo: Pagination;
};

export type TimeFrameFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<TimeFrameFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  entropySnapshot?: InputMaybe<JsonFilterInput>;
  events?: InputMaybe<GameEventFiltersInput>;
  gameState?: InputMaybe<JsonFilterInput>;
  not?: InputMaybe<TimeFrameFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<TimeFrameFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  timestamp?: InputMaybe<DateTimeFilterInput>;
  turnNumber?: InputMaybe<IntFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type TimeFrameInput = {
  entropySnapshot?: InputMaybe<Scalars['JSON']['input']>;
  events?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  gameState?: InputMaybe<Scalars['JSON']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  timestamp?: InputMaybe<Scalars['DateTime']['input']>;
  turnNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type TimeFrameRelationResponseCollection = {
  __typename?: 'TimeFrameRelationResponseCollection';
  nodes: Array<TimeFrame>;
};

export type ToolCastSpellInput = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['Float']['input']>;
  spellId?: InputMaybe<Scalars['String']['input']>;
  targetIds?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  targetLocation?: InputMaybe<Scalars['JSON']['input']>;
  type?: InputMaybe<Scalars['JSON']['input']>;
};

export type ToolDropItemInput = {
  entityId?: InputMaybe<Scalars['String']['input']>;
  itemComponentId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolGetAvailableActionsInput = {
  entityId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolGetEntropyInput = {
  _empty?: InputMaybe<Scalars['String']['input']>;
};

export type ToolGetLocationContextInput = {
  x?: InputMaybe<Scalars['Float']['input']>;
  y?: InputMaybe<Scalars['Float']['input']>;
};

export type ToolGetMapImageInput = {
  broadcast?: InputMaybe<Scalars['JSON']['input']>;
  entityId?: InputMaybe<Scalars['String']['input']>;
  radius?: InputMaybe<Scalars['JSON']['input']>;
  x?: InputMaybe<Scalars['Float']['input']>;
  y?: InputMaybe<Scalars['Float']['input']>;
};

export type ToolGetTimeInput = {
  _empty?: InputMaybe<Scalars['String']['input']>;
};

export type ToolGetWeatherInput = {
  _empty?: InputMaybe<Scalars['String']['input']>;
};

export type ToolInspectMapInput = {
  radius?: InputMaybe<Scalars['JSON']['input']>;
  x?: InputMaybe<Scalars['Float']['input']>;
  y?: InputMaybe<Scalars['Float']['input']>;
};

export type ToolInteractObjectInput = {
  actorId?: InputMaybe<Scalars['String']['input']>;
  interactionType?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolListEntitiesInput = {
  _empty?: InputMaybe<Scalars['String']['input']>;
};

export type ToolLongRestInput = {
  actorId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolModifyTerrainInput = {
  actorId?: InputMaybe<Scalars['String']['input']>;
  center?: InputMaybe<Scalars['JSON']['input']>;
  radius?: InputMaybe<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['Float']['input']>;
};

export type ToolMoveEntityInput = {
  entityId?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
};

export type ToolPerformActionInput = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Scalars['JSON']['input']>;
  targetId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolPerformAttackInput = {
  actionName?: InputMaybe<Scalars['String']['input']>;
  attackerId?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolPerformAttackLegacyInput = {
  actionName?: InputMaybe<Scalars['String']['input']>;
  attackerId?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolPickupItemInput = {
  actorId?: InputMaybe<Scalars['String']['input']>;
  targetId?: InputMaybe<Scalars['String']['input']>;
};

export type ToolRetrieveKnowledgeInput = {
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSearchClassesInput = {
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSearchMonstersInput = {
  query?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSearchRacesInput = {
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSearchSpellsInput = {
  level?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSetEntropyInput = {
  key?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSetTimeInput = {
  time?: InputMaybe<Scalars['JSON']['input']>;
};

export type ToolSetWeatherInput = {
  weather?: InputMaybe<Scalars['String']['input']>;
};

export type ToolSpawnEntityInput = {
  blueprintId?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['JSON']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type ToolThrowItemInput = {
  actorId?: InputMaybe<Scalars['String']['input']>;
  itemComponentId?: InputMaybe<Scalars['String']['input']>;
  targetEntityId?: InputMaybe<Scalars['String']['input']>;
  targetPosition?: InputMaybe<Scalars['JSON']['input']>;
};

export type Trait = {
  __typename?: 'Trait';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<Trait>>;
  localizations_connection?: Maybe<TraitRelationResponseCollection>;
  name: Scalars['String']['output'];
  proficiencies: Array<Maybe<Proficiency>>;
  proficiencies_connection?: Maybe<ProficiencyRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  races: Array<Maybe<Race>>;
  races_connection?: Maybe<RaceRelationResponseCollection>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type TraitLocalizationsArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TraitLocalizations_ConnectionArgs = {
  filters?: InputMaybe<TraitFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TraitProficienciesArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TraitProficiencies_ConnectionArgs = {
  filters?: InputMaybe<ProficiencyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TraitRacesArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TraitRaces_ConnectionArgs = {
  filters?: InputMaybe<RaceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TraitEntityResponseCollection = {
  __typename?: 'TraitEntityResponseCollection';
  nodes: Array<Trait>;
  pageInfo: Pagination;
};

export type TraitFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<TraitFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<TraitFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<TraitFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<TraitFiltersInput>>>;
  proficiencies?: InputMaybe<ProficiencyFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  races?: InputMaybe<RaceFiltersInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type TraitInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proficiencies?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  races?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type TraitRelationResponseCollection = {
  __typename?: 'TraitRelationResponseCollection';
  nodes: Array<Trait>;
};

export type Turn = {
  __typename?: 'Turn';
  actions?: Maybe<Scalars['JSON']['output']>;
  characterSnapshots?: Maybe<Scalars['JSON']['output']>;
  contextImage?: Maybe<UploadFile>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  messages: Array<Maybe<Message>>;
  messages_connection?: Maybe<MessageRelationResponseCollection>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  narrative?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  room?: Maybe<Room>;
  status?: Maybe<Enum_Turn_Status>;
  turnNumber: Scalars['Int']['output'];
  type?: Maybe<Enum_Turn_Type>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type TurnMessagesArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type TurnMessages_ConnectionArgs = {
  filters?: InputMaybe<MessageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TurnEntityResponseCollection = {
  __typename?: 'TurnEntityResponseCollection';
  nodes: Array<Turn>;
  pageInfo: Pagination;
};

export type TurnFiltersInput = {
  actions?: InputMaybe<JsonFilterInput>;
  and?: InputMaybe<Array<InputMaybe<TurnFiltersInput>>>;
  characterSnapshots?: InputMaybe<JsonFilterInput>;
  contextImage?: InputMaybe<UploadFileFiltersInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  messages?: InputMaybe<MessageFiltersInput>;
  metadata?: InputMaybe<JsonFilterInput>;
  narrative?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<TurnFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<TurnFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  status?: InputMaybe<StringFilterInput>;
  turnNumber?: InputMaybe<IntFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type TurnInput = {
  actions?: InputMaybe<Scalars['JSON']['input']>;
  characterSnapshots?: InputMaybe<Scalars['JSON']['input']>;
  contextImage?: InputMaybe<Scalars['ID']['input']>;
  messages?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  narrative?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Enum_Turn_Status>;
  turnNumber?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Enum_Turn_Type>;
};

export type TurnLock = {
  __typename?: 'TurnLock';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  expires_at: Scalars['DateTime']['output'];
  holder_id: Scalars['String']['output'];
  locked_at: Scalars['DateTime']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  room?: Maybe<Room>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TurnLockEntityResponseCollection = {
  __typename?: 'TurnLockEntityResponseCollection';
  nodes: Array<TurnLock>;
  pageInfo: Pagination;
};

export type TurnLockFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<TurnLockFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  expires_at?: InputMaybe<DateTimeFilterInput>;
  holder_id?: InputMaybe<StringFilterInput>;
  locked_at?: InputMaybe<DateTimeFilterInput>;
  not?: InputMaybe<TurnLockFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<TurnLockFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type TurnLockInput = {
  expires_at?: InputMaybe<Scalars['DateTime']['input']>;
  holder_id?: InputMaybe<Scalars['String']['input']>;
  locked_at?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
};

export type TurnRelationResponseCollection = {
  __typename?: 'TurnRelationResponseCollection';
  nodes: Array<Turn>;
};

export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText?: Maybe<Scalars['String']['output']>;
  caption?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  ext?: Maybe<Scalars['String']['output']>;
  formats?: Maybe<Scalars['JSON']['output']>;
  hash: Scalars['String']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  mime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewUrl?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  provider_metadata?: Maybe<Scalars['JSON']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  related?: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection';
  nodes: Array<UploadFile>;
  pageInfo: Pagination;
};

export type UploadFileFiltersInput = {
  alternativeText?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  ext?: InputMaybe<StringFilterInput>;
  formats?: InputMaybe<JsonFilterInput>;
  hash?: InputMaybe<StringFilterInput>;
  height?: InputMaybe<IntFilterInput>;
  mime?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UploadFileFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl?: InputMaybe<StringFilterInput>;
  provider?: InputMaybe<StringFilterInput>;
  provider_metadata?: InputMaybe<JsonFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  size?: InputMaybe<FloatFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  url?: InputMaybe<StringFilterInput>;
  width?: InputMaybe<IntFilterInput>;
};

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
  provider?: Scalars['String']['input'];
};

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload';
  jwt?: Maybe<Scalars['String']['output']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  blocked?: Maybe<Scalars['Boolean']['output']>;
  confirmed?: Maybe<Scalars['Boolean']['output']>;
  documentId: Scalars['ID']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role?: Maybe<UsersPermissionsMeRole>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  action: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<UsersPermissionsRole>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UsersPermissionsPermissionFiltersInput = {
  action?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  not?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection';
  nodes: Array<UsersPermissionsPermission>;
};

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Maybe<UsersPermissionsPermission>>;
  permissions_connection?: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  users: Array<Maybe<UsersPermissionsUser>>;
  users_connection?: Maybe<UsersPermissionsUserRelationResponseCollection>;
};


export type UsersPermissionsRolePermissionsArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRolePermissions_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsersArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsers_ConnectionArgs = {
  filters?: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection';
  nodes: Array<UsersPermissionsRole>;
  pageInfo: Pagination;
};

export type UsersPermissionsRoleFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions?: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  users?: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  users?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser';
  blocked?: Maybe<Scalars['Boolean']['output']>;
  characters: Array<Maybe<Character>>;
  characters_connection?: Maybe<CharacterRelationResponseCollection>;
  confirmed?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  provider?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<UsersPermissionsRole>;
  rooms: Array<Maybe<Room>>;
  rooms_connection?: Maybe<RoomRelationResponseCollection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};


export type UsersPermissionsUserCharactersArgs = {
  filters?: InputMaybe<CharacterFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsUserCharacters_ConnectionArgs = {
  filters?: InputMaybe<CharacterFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsUserRoomsArgs = {
  filters?: InputMaybe<RoomFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsUserRooms_ConnectionArgs = {
  filters?: InputMaybe<RoomFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data?: Maybe<UsersPermissionsUser>;
};

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection';
  nodes: Array<UsersPermissionsUser>;
  pageInfo: Pagination;
};

export type UsersPermissionsUserFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked?: InputMaybe<BooleanFilterInput>;
  characters?: InputMaybe<CharacterFiltersInput>;
  confirmed?: InputMaybe<BooleanFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<UsersPermissionsUserFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  provider?: InputMaybe<StringFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  role?: InputMaybe<UsersPermissionsRoleFiltersInput>;
  rooms?: InputMaybe<RoomFiltersInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  username?: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked?: InputMaybe<Scalars['Boolean']['input']>;
  characters?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  confirmed?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  role?: InputMaybe<Scalars['ID']['input']>;
  rooms?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  nodes: Array<UsersPermissionsUser>;
};

export type VoxelChange = {
  __typename?: 'VoxelChange';
  chunkX: Scalars['Int']['output'];
  chunkY: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  newType: Scalars['String']['output'];
  previousType?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['Long']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  voxelX: Scalars['Int']['output'];
  voxelY: Scalars['Int']['output'];
  voxelZ: Scalars['Int']['output'];
};

export type VoxelChangeEntityResponseCollection = {
  __typename?: 'VoxelChangeEntityResponseCollection';
  nodes: Array<VoxelChange>;
  pageInfo: Pagination;
};

export type VoxelChangeFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<VoxelChangeFiltersInput>>>;
  chunkX?: InputMaybe<IntFilterInput>;
  chunkY?: InputMaybe<IntFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  metadata?: InputMaybe<JsonFilterInput>;
  newType?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<VoxelChangeFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<VoxelChangeFiltersInput>>>;
  previousType?: InputMaybe<StringFilterInput>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  reason?: InputMaybe<StringFilterInput>;
  timestamp?: InputMaybe<LongFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  voxelX?: InputMaybe<IntFilterInput>;
  voxelY?: InputMaybe<IntFilterInput>;
  voxelZ?: InputMaybe<IntFilterInput>;
};

export type VoxelChangeInput = {
  chunkX?: InputMaybe<Scalars['Int']['input']>;
  chunkY?: InputMaybe<Scalars['Int']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  newType?: InputMaybe<Scalars['String']['input']>;
  previousType?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['Long']['input']>;
  voxelX?: InputMaybe<Scalars['Int']['input']>;
  voxelY?: InputMaybe<Scalars['Int']['input']>;
  voxelZ?: InputMaybe<Scalars['Int']['input']>;
};

export type VoxelChunk = {
  __typename?: 'VoxelChunk';
  tiles: Scalars['JSON']['output'];
  x: Scalars['Int']['output'];
  y: Scalars['Int']['output'];
};

export type WeaponProperty = {
  __typename?: 'WeaponProperty';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  image?: Maybe<UploadFile>;
  locale?: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<WeaponProperty>>;
  localizations_connection?: Maybe<WeaponPropertyRelationResponseCollection>;
  name: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type WeaponPropertyLocalizationsArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type WeaponPropertyLocalizations_ConnectionArgs = {
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type WeaponPropertyEntityResponseCollection = {
  __typename?: 'WeaponPropertyEntityResponseCollection';
  nodes: Array<WeaponProperty>;
  pageInfo: Pagination;
};

export type WeaponPropertyFiltersInput = {
  and?: InputMaybe<Array<InputMaybe<WeaponPropertyFiltersInput>>>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  locale?: InputMaybe<StringFilterInput>;
  localizations?: InputMaybe<WeaponPropertyFiltersInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<WeaponPropertyFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<WeaponPropertyFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  slug?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type WeaponPropertyInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type WeaponPropertyRelationResponseCollection = {
  __typename?: 'WeaponPropertyRelationResponseCollection';
  nodes: Array<WeaponProperty>;
};

export type World = {
  __typename?: 'World';
  adventureLength?: Maybe<Enum_World_Adventurelength>;
  chunkSize?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  detail?: Maybe<Scalars['Int']['output']>;
  documentId: Scalars['ID']['output'];
  elevationScale?: Maybe<Scalars['Float']['output']>;
  fogRadius?: Maybe<Scalars['Int']['output']>;
  globalScale?: Maybe<Scalars['Float']['output']>;
  history?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  moistureScale?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  roadDensity?: Maybe<Scalars['Float']['output']>;
  room?: Maybe<Room>;
  roughness?: Maybe<Scalars['Float']['output']>;
  seaLevel?: Maybe<Scalars['Float']['output']>;
  seed?: Maybe<Scalars['String']['output']>;
  structureChance?: Maybe<Scalars['Float']['output']>;
  structureSizeAvg?: Maybe<Scalars['Int']['output']>;
  structureSpacing?: Maybe<Scalars['Int']['output']>;
  temperatureOffset?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  worldBackground?: Maybe<Scalars['String']['output']>;
  worldSize?: Maybe<Enum_World_Worldsize>;
  worldType?: Maybe<Scalars['String']['output']>;
};

export type WorldConfigInput = {
  chunkSize?: InputMaybe<Scalars['Int']['input']>;
  detail?: InputMaybe<Scalars['Float']['input']>;
  elevationScale?: InputMaybe<Scalars['Float']['input']>;
  fogRadius?: InputMaybe<Scalars['Int']['input']>;
  globalScale?: InputMaybe<Scalars['Float']['input']>;
  moistureScale?: InputMaybe<Scalars['Float']['input']>;
  roadDensity?: InputMaybe<Scalars['Float']['input']>;
  roughness?: InputMaybe<Scalars['Float']['input']>;
  seaLevel?: InputMaybe<Scalars['Float']['input']>;
  seed?: InputMaybe<Scalars['String']['input']>;
  structureChance?: InputMaybe<Scalars['Float']['input']>;
  structureSizeAvg?: InputMaybe<Scalars['Int']['input']>;
  structureSpacing?: InputMaybe<Scalars['Int']['input']>;
  temperatureOffset?: InputMaybe<Scalars['Float']['input']>;
};

export type WorldEntityResponseCollection = {
  __typename?: 'WorldEntityResponseCollection';
  nodes: Array<World>;
  pageInfo: Pagination;
};

export type WorldFiltersInput = {
  adventureLength?: InputMaybe<StringFilterInput>;
  and?: InputMaybe<Array<InputMaybe<WorldFiltersInput>>>;
  chunkSize?: InputMaybe<IntFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  detail?: InputMaybe<IntFilterInput>;
  documentId?: InputMaybe<IdFilterInput>;
  elevationScale?: InputMaybe<FloatFilterInput>;
  fogRadius?: InputMaybe<IntFilterInput>;
  globalScale?: InputMaybe<FloatFilterInput>;
  history?: InputMaybe<StringFilterInput>;
  language?: InputMaybe<StringFilterInput>;
  moistureScale?: InputMaybe<FloatFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  not?: InputMaybe<WorldFiltersInput>;
  or?: InputMaybe<Array<InputMaybe<WorldFiltersInput>>>;
  publishedAt?: InputMaybe<DateTimeFilterInput>;
  roadDensity?: InputMaybe<FloatFilterInput>;
  room?: InputMaybe<RoomFiltersInput>;
  roughness?: InputMaybe<FloatFilterInput>;
  seaLevel?: InputMaybe<FloatFilterInput>;
  seed?: InputMaybe<StringFilterInput>;
  structureChance?: InputMaybe<FloatFilterInput>;
  structureSizeAvg?: InputMaybe<IntFilterInput>;
  structureSpacing?: InputMaybe<IntFilterInput>;
  temperatureOffset?: InputMaybe<FloatFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  worldBackground?: InputMaybe<StringFilterInput>;
  worldSize?: InputMaybe<StringFilterInput>;
  worldType?: InputMaybe<StringFilterInput>;
};

export type WorldInput = {
  adventureLength?: InputMaybe<Enum_World_Adventurelength>;
  chunkSize?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  detail?: InputMaybe<Scalars['Int']['input']>;
  elevationScale?: InputMaybe<Scalars['Float']['input']>;
  fogRadius?: InputMaybe<Scalars['Int']['input']>;
  globalScale?: InputMaybe<Scalars['Float']['input']>;
  history?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  moistureScale?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  roadDensity?: InputMaybe<Scalars['Float']['input']>;
  room?: InputMaybe<Scalars['ID']['input']>;
  roughness?: InputMaybe<Scalars['Float']['input']>;
  seaLevel?: InputMaybe<Scalars['Float']['input']>;
  seed?: InputMaybe<Scalars['String']['input']>;
  structureChance?: InputMaybe<Scalars['Float']['input']>;
  structureSizeAvg?: InputMaybe<Scalars['Int']['input']>;
  structureSpacing?: InputMaybe<Scalars['Int']['input']>;
  temperatureOffset?: InputMaybe<Scalars['Float']['input']>;
  worldBackground?: InputMaybe<Scalars['String']['input']>;
  worldSize?: InputMaybe<Enum_World_Worldsize>;
  worldType?: InputMaybe<Scalars['String']['input']>;
};

export type WorldTime = {
  __typename?: 'WorldTime';
  day: Scalars['Int']['output'];
  formatted: Scalars['String']['output'];
  isDay: Scalars['Boolean']['output'];
  lightLevel: Scalars['Float']['output'];
  ticks: Scalars['Int']['output'];
  timeOfDay: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type GetAbilitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAbilitiesQuery = { __typename?: 'Query', abilities?: Array<{ __typename?: 'Ability', documentId: string, name: string, fullName: string, description?: string | null, skills?: Array<{ __typename?: 'Skill', name: string } | null> | null } | null> | null };

export type GetSkillsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSkillsQuery = { __typename?: 'Query', skills?: Array<{ __typename?: 'Skill', documentId: string, name: string, description?: string | null, abilityScore?: { __typename?: 'Ability', name: string } | null } | null> | null };

export type GetRacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRacesQuery = { __typename?: 'Query', races: Array<{ __typename?: 'Race', documentId: string, name: string, description?: string | null, speed?: any | null, size?: Enum_Race_Size | null } | null> };

export type GetClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', documentId: string, name: string, description?: string | null, hit_die?: string | null } | null> };

export type GetAlignmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAlignmentsQuery = { __typename?: 'Query', alignments?: Array<{ __typename?: 'Alignment', documentId: string, name: string, abbreviation?: string | null, description?: string | null } | null> | null };

export type GetBackgroundsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBackgroundsQuery = { __typename?: 'Query', backgrounds?: Array<{ __typename?: 'Background', documentId: string, name: string, description?: string | null, skillProficiencies?: Array<{ __typename?: 'Skill', name: string } | null> | null } | null> | null };

export type GetLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLanguagesQuery = { __typename?: 'Query', languages: Array<{ __typename?: 'Language', documentId: string, name: string, note?: string | null } | null> };

export type GetMagicSchoolsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMagicSchoolsQuery = { __typename?: 'Query', magicSchools: Array<{ __typename?: 'MagicSchool', documentId: string, name: string, description?: string | null } | null> };

export type GetConditionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConditionsQuery = { __typename?: 'Query', conditions?: Array<{ __typename?: 'GameCondition', documentId: string, name: string, description?: string | null } | null> | null };

export type GetDamageTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDamageTypesQuery = { __typename?: 'Query', damageTypes: Array<{ __typename?: 'DamageType', documentId: string, name: string, description?: string | null } | null> };

export type GetMonstersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMonstersQuery = { __typename?: 'Query', entitySheets: Array<{ __typename?: 'EntitySheet', documentId: string, name?: string | null, type?: Enum_Entitysheet_Type | null, currentHp?: number | null, maxHp?: number | null } | null> };

export type GetSpellsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', documentId: string, name: string, level?: number | null, school?: Enum_Spell_School | null, description?: string | null } | null> };

export type GetFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeaturesQuery = { __typename?: 'Query', features: Array<{ __typename?: 'Feature', documentId: string, name: string, level?: number | null, description?: string | null } | null> };

export type GetTraitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTraitsQuery = { __typename?: 'Query', traits: Array<{ __typename?: 'Trait', documentId: string, name: string, description?: string | null, races: Array<{ __typename?: 'Race', name: string } | null> } | null> };

export type GetSubclassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSubclassesQuery = { __typename?: 'Query', subclasses: Array<{ __typename?: 'Subclass', documentId: string, name: string, description?: string | null, class?: { __typename?: 'Class', name: string } | null } | null> };

export type GetProficienciesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProficienciesQuery = { __typename?: 'Query', proficiencies: Array<{ __typename?: 'Proficiency', documentId: string, name: string, type?: Enum_Proficiency_Type | null, classes: Array<{ __typename?: 'Class', name: string } | null>, races: Array<{ __typename?: 'Race', name: string } | null> } | null> };

export type CreateRoomMutationVariables = Exact<{
  data: Scalars['JSON']['input'];
}>;


export type CreateRoomMutation = { __typename?: 'Mutation', createRoom?: { __typename?: 'Room', documentId: string, roomId?: string | null, code?: string | null, world?: { __typename?: 'World', name?: string | null, description?: string | null, seed?: string | null, language?: string | null, chunkSize?: number | null, detail?: number | null, fogRadius?: number | null, globalScale?: number | null, seaLevel?: number | null, elevationScale?: number | null, roughness?: number | null, moistureScale?: number | null, temperatureOffset?: number | null, roadDensity?: number | null, structureChance?: number | null, structureSpacing?: number | null, structureSizeAvg?: number | null, worldSize?: Enum_World_Worldsize | null, worldType?: string | null, worldBackground?: string | null } | null, dmSettings?: { __typename?: 'DmSetting', adventureLength?: Enum_Dmsetting_Adventurelength | null, difficulty?: Enum_Dmsetting_Difficulty | null, theme?: string | null, setting?: string | null, tone?: string | null, playerCount?: number | null, startingLevel?: number | null, attributePointBudget?: number | null, dmSystemPrompt?: string | null, dmStyle?: { __typename?: 'ComponentGameDmStyle', verbosity?: number | null, detail?: number | null, engagement?: number | null, narrative?: number | null, specialMode?: string | null, customDirectives?: string | null } | null } | null } | null };

export type JoinRoomMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type JoinRoomMutation = { __typename?: 'Mutation', joinRoom?: { __typename?: 'Room', documentId: string, roomId?: string | null, code?: string | null, phase?: Enum_Room_Phase | null, players?: Array<{ __typename?: 'ComponentGamePlayer', id: string, name?: string | null, isReady?: boolean | null, isOnline?: boolean | null, joinedAt?: any | null, action?: string | null, user?: { __typename?: 'UsersPermissionsUser', documentId: string, username: string } | null, character?: { __typename?: 'Character', documentId: string, name: string, portrait?: { __typename?: 'UploadFile', url: string } | null, upperBody?: { __typename?: 'UploadFile', url: string } | null, fullBody?: { __typename?: 'UploadFile', url: string } | null, stats?: { __typename?: 'ComponentGameStats', strength?: number | null, dexterity?: number | null, constitution?: number | null, intelligence?: number | null, wisdom?: number | null, charisma?: number | null } | null } | null } | null> | null, world?: { __typename?: 'World', name?: string | null, description?: string | null, seed?: string | null, language?: string | null, chunkSize?: number | null, detail?: number | null, fogRadius?: number | null, globalScale?: number | null, seaLevel?: number | null, elevationScale?: number | null, roughness?: number | null, moistureScale?: number | null, temperatureOffset?: number | null, roadDensity?: number | null, structureChance?: number | null, structureSpacing?: number | null, structureSizeAvg?: number | null, worldSize?: Enum_World_Worldsize | null, worldType?: string | null, worldBackground?: string | null } | null, dmSettings?: { __typename?: 'DmSetting', adventureLength?: Enum_Dmsetting_Adventurelength | null, difficulty?: Enum_Dmsetting_Difficulty | null, theme?: string | null, setting?: string | null, tone?: string | null, playerCount?: number | null, startingLevel?: number | null, attributePointBudget?: number | null, dmSystemPrompt?: string | null, dmStyle?: { __typename?: 'ComponentGameDmStyle', verbosity?: number | null, detail?: number | null, engagement?: number | null, narrative?: number | null, specialMode?: string | null, customDirectives?: string | null } | null } | null } | null };

export type UpdateRoomMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: RoomInput;
}>;


export type UpdateRoomMutation = { __typename?: 'Mutation', updateRoom?: { __typename?: 'Room', documentId: string } | null };

export type GenerateWorldMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  language?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateWorldMutation = { __typename?: 'Mutation', generateWorld?: any | null };

export type AddCharacterMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  character: Scalars['JSON']['input'];
}>;


export type AddCharacterMutation = { __typename?: 'Mutation', addCharacter?: any | null };

export type StartGameMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  language?: InputMaybe<Scalars['String']['input']>;
  streamId?: InputMaybe<Scalars['String']['input']>;
}>;


export type StartGameMutation = { __typename?: 'Mutation', startGame?: any | null };

export type SubmitActionMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  action: Scalars['String']['input'];
  mode?: InputMaybe<Scalars['String']['input']>;
}>;


export type SubmitActionMutation = { __typename?: 'Mutation', submitAction?: any | null };

export type GenerateAvatarPortraitMutationVariables = Exact<{
  payload: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateAvatarPortraitMutation = { __typename?: 'Mutation', generateAvatarPortrait?: any | null };

export type GenerateAvatarUpperBodyMutationVariables = Exact<{
  payload: Scalars['JSON']['input'];
  portrait: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateAvatarUpperBodyMutation = { __typename?: 'Mutation', generateAvatarUpperBody?: any | null };

export type GenerateAvatarFullBodyMutationVariables = Exact<{
  payload: Scalars['JSON']['input'];
  portrait: Scalars['JSON']['input'];
  upperBody: Scalars['JSON']['input'];
  referenceImage?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateAvatarFullBodyMutation = { __typename?: 'Mutation', generateAvatarFullBody?: any | null };

export type SpawnCreatureMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  creature: Scalars['JSON']['input'];
}>;


export type SpawnCreatureMutation = { __typename?: 'Mutation', spawnCreature?: any | null };

export type GenerateTerrainChunkMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  chunkX: Scalars['Int']['input'];
  chunkY: Scalars['Int']['input'];
  chunkSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GenerateTerrainChunkMutation = { __typename?: 'Mutation', generateTerrainChunk?: any | null };

export type CreateEntitySheetMutationVariables = Exact<{
  data: EntitySheetInput;
}>;


export type CreateEntitySheetMutation = { __typename?: 'Mutation', createEntitySheet?: { __typename?: 'EntitySheet', documentId: string, name?: string | null } | null };

export type ExecuteToolMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  command: Scalars['String']['input'];
}>;


export type ExecuteToolMutation = { __typename?: 'Mutation', executeTool?: any | null };

export type ProcessTurnMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  language?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProcessTurnMutation = { __typename?: 'Mutation', processTurn?: any | null };

export type FullRoomContextFragment = { __typename?: 'Room', documentId: string, roomId?: string | null, phase?: Enum_Room_Phase | null, turnData?: any | null, entropyState?: any | null, isProcessing?: boolean | null, world?: { __typename?: 'World', documentId: string, name?: string | null, description?: string | null } | null, players?: Array<{ __typename?: 'ComponentGamePlayer', id: string, name?: string | null, action?: string | null, isReady?: boolean | null, isOnline?: boolean | null, joinedAt?: any | null, user?: { __typename?: 'UsersPermissionsUser', documentId: string, username: string } | null, character?: { __typename?: 'Character', documentId: string, name: string, portrait?: { __typename?: 'UploadFile', url: string } | null, stats?: { __typename?: 'ComponentGameStats', strength?: number | null, dexterity?: number | null, constitution?: number | null, intelligence?: number | null, wisdom?: number | null, charisma?: number | null } | null, inventory?: Array<{ __typename?: 'ComponentGameInventoryItem', quantity?: number | null, isEquipped?: boolean | null, item?: { __typename?: 'Item', type: Enum_Item_Type, description?: string | null, rarity?: Enum_Item_Rarity | null, value?: number | null, weight?: number | null, documentId: string, name: string, equipment_data?: { __typename?: 'ComponentGameEquipmentData', armor_class_base?: number | null, damage_dice?: string | null, range_normal?: number | null } | null, spell_data?: { __typename?: 'ComponentGameSpellData', level?: number | null, school?: Enum_Componentgamespelldata_School | null } | null } | null } | null> | null } | null } | null> | null, entity_sheets: Array<{ __typename?: 'EntitySheet', documentId: string, name?: string | null, type?: Enum_Entitysheet_Type | null, currentHp?: number | null, maxHp?: number | null, position?: { __typename?: 'ComponentGamePosition', x?: number | null, y?: number | null, z?: number | null } | null, availableActions?: Array<{ __typename?: 'RuntimeAction', id: string, name: string, description?: string | null, type?: string | null, range?: { __typename?: 'RuntimeRange', type?: string | null, value?: number | null, reach?: number | null } | null } | null> | null } | null>, turns: Array<{ __typename?: 'Turn', documentId: string, turnNumber: number, narrative?: string | null, actions?: any | null, messages: Array<{ __typename?: 'Message', documentId: string, content: string, senderName?: string | null, timestamp?: any | null } | null> } | null>, events: Array<{ __typename?: 'GameEvent', documentId: string, type: Enum_Gameevent_Type, timestamp: any, turn_number?: number | null, payload: any, actor?: { __typename?: 'EntitySheet', documentId: string, name?: string | null } | null } | null> } & { ' $fragmentName'?: 'FullRoomContextFragment' };

export type GetRoomQueryVariables = Exact<{
  filters?: InputMaybe<RoomFiltersInput>;
}>;


export type GetRoomQuery = { __typename?: 'Query', rooms: Array<(
    { __typename?: 'Room' }
    & { ' $fragmentRefs'?: { 'FullRoomContextFragment': FullRoomContextFragment } }
  ) | null> };

export type ListRoomsQueryVariables = Exact<{
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type ListRoomsQuery = { __typename?: 'Query', rooms: Array<{ __typename?: 'Room', documentId: string, roomId?: string | null, code?: string | null, createdAt?: any | null, phase?: Enum_Room_Phase | null, dmSettings?: { __typename?: 'DmSetting', theme?: string | null, setting?: string | null, difficulty?: Enum_Dmsetting_Difficulty | null } | null, entity_sheets: Array<{ __typename?: 'EntitySheet', documentId: string } | null>, players?: Array<{ __typename?: 'ComponentGamePlayer', id: string, user?: { __typename?: 'UsersPermissionsUser', documentId: string } | null, character?: { __typename?: 'Character', documentId: string, name: string, backstory?: string | null, portrait?: { __typename?: 'UploadFile', url: string } | null, race?: { __typename?: 'Race', name: string } | null, classes?: Array<{ __typename?: 'ComponentGameCharacterClass', level: number, class?: { __typename?: 'Class', name: string } | null } | null> | null } | null } | null> | null } | null> };

export type ListCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListCharactersQuery = { __typename?: 'Query', characters: Array<{ __typename?: 'Character', documentId: string, name: string, backstory?: string | null, race?: { __typename?: 'Race', name: string } | null, classes?: Array<{ __typename?: 'ComponentGameCharacterClass', level: number, class?: { __typename?: 'Class', name: string } | null } | null> | null, portrait?: { __typename?: 'UploadFile', url: string } | null } | null> };

export type ListMonstersQueryVariables = Exact<{
  filters?: InputMaybe<EntitySheetFiltersInput>;
}>;


export type ListMonstersQuery = { __typename?: 'Query', entitySheets: Array<{ __typename?: 'EntitySheet', documentId: string, name?: string | null, type?: Enum_Entitysheet_Type | null, currentHp?: number | null, maxHp?: number | null } | null> };

export type ListSpellsQueryVariables = Exact<{
  filters?: InputMaybe<SpellFiltersInput>;
}>;


export type ListSpellsQuery = { __typename?: 'Query', spells: Array<{ __typename?: 'Spell', documentId: string, name: string, level?: number | null, school?: Enum_Spell_School | null } | null> };

export type ListItemsQueryVariables = Exact<{
  filters?: InputMaybe<ItemFiltersInput>;
}>;


export type ListItemsQuery = { __typename?: 'Query', items: Array<{ __typename?: 'Item', documentId: string, name: string, type: Enum_Item_Type, rarity?: Enum_Item_Rarity | null, value?: number | null, weight?: number | null, equipment_data?: { __typename?: 'ComponentGameEquipmentData', armor_class_base?: number | null, damage_dice?: string | null, range_normal?: number | null, range_long?: number | null, str_minimum?: number | null, stealth_disadvantage?: boolean | null } | null, spell_data?: { __typename?: 'ComponentGameSpellData', level?: number | null, school?: Enum_Componentgamespelldata_School | null } | null } | null> };

export type SearchEntitiesQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchEntitiesQuery = { __typename?: 'Query', searchEntities: Array<{ __typename?: 'SearchResult', id: string, name: string, type: string } | null> };

export type GetWorldTimeQueryVariables = Exact<{
  roomId: Scalars['ID']['input'];
}>;


export type GetWorldTimeQuery = { __typename?: 'Query', getWorldTime?: { __typename?: 'WorldTime', ticks: number, day: number, year: number, timeOfDay: string, formatted: string, isDay: boolean, lightLevel: number } | null };

export type GetAgentLogsQueryVariables = Exact<{
  roomId: Scalars['ID']['input'];
}>;


export type GetAgentLogsQuery = { __typename?: 'Query', getAgentLogs?: Array<{ __typename?: 'AgentLog', id: string, type: string, payload?: any | null, actorId?: string | null, sequenceId?: string | null, timestamp?: string | null } | null> | null };

export type VoxelPreviewQueryVariables = Exact<{
  chunks: Array<InputMaybe<ChunkRequestInput>> | InputMaybe<ChunkRequestInput>;
  config: WorldConfigInput;
}>;


export type VoxelPreviewQuery = { __typename?: 'Query', voxelPreview: Array<{ __typename?: 'VoxelChunk', x: number, y: number, tiles: any } | null> };

export type PaginationFragmentFragment = { __typename?: 'Pagination', total: number, page: number, pageSize: number, pageCount: number } & { ' $fragmentName'?: 'PaginationFragmentFragment' };

export type ExplorerGetClassesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<ClassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetClassesQuery = { __typename?: 'Query', classes_connection?: { __typename?: 'ClassEntityResponseCollection', nodes: Array<{ __typename?: 'Class', documentId: string, slug: string, name: string, description?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetDamageTypesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<DamageTypeFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetDamageTypesQuery = { __typename?: 'Query', damageTypes_connection?: { __typename?: 'DamageTypeEntityResponseCollection', nodes: Array<{ __typename?: 'DamageType', documentId: string, slug: string, name: string, description?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetFeaturesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<FeatureFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetFeaturesQuery = { __typename?: 'Query', features_connection?: { __typename?: 'FeatureEntityResponseCollection', nodes: Array<{ __typename?: 'Feature', documentId: string, name: string, description?: string | null, level?: number | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetLanguagesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<LanguageFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetLanguagesQuery = { __typename?: 'Query', languages_connection?: { __typename?: 'LanguageEntityResponseCollection', nodes: Array<{ __typename?: 'Language', documentId: string, name: string, note?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetMagicSchoolsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<MagicSchoolFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetMagicSchoolsQuery = { __typename?: 'Query', magicSchools_connection?: { __typename?: 'MagicSchoolEntityResponseCollection', nodes: Array<{ __typename?: 'MagicSchool', documentId: string, name: string, description?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetMonstersQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<EntitySheetFiltersInput>;
}>;


export type ExplorerGetMonstersQuery = { __typename?: 'Query', entitySheets_connection?: { __typename?: 'EntitySheetEntityResponseCollection', nodes: Array<{ __typename?: 'EntitySheet', documentId: string, name?: string | null, type?: Enum_Entitysheet_Type | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetProficienciesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<ProficiencyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetProficienciesQuery = { __typename?: 'Query', proficiencies_connection?: { __typename?: 'ProficiencyEntityResponseCollection', nodes: Array<{ __typename?: 'Proficiency', documentId: string, name: string, type?: Enum_Proficiency_Type | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetRacesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<RaceFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetRacesQuery = { __typename?: 'Query', races_connection?: { __typename?: 'RaceEntityResponseCollection', nodes: Array<{ __typename?: 'Race', documentId: string, slug: string, name: string, description?: string | null, size?: Enum_Race_Size | null, speed?: any | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetSpellsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<SpellFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetSpellsQuery = { __typename?: 'Query', spells_connection?: { __typename?: 'SpellEntityResponseCollection', nodes: Array<{ __typename?: 'Spell', documentId: string, slug: string, name: string, description?: string | null, level?: number | null, school?: Enum_Spell_School | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetSubclassesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<SubclassFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetSubclassesQuery = { __typename?: 'Query', subclasses_connection?: { __typename?: 'SubclassEntityResponseCollection', nodes: Array<{ __typename?: 'Subclass', documentId: string, slug: string, name: string, description?: string | null, subclass_flavor?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetTraitsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<TraitFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetTraitsQuery = { __typename?: 'Query', traits_connection?: { __typename?: 'TraitEntityResponseCollection', nodes: Array<{ __typename?: 'Trait', documentId: string, slug: string, name: string, description?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type ExplorerGetWeaponPropertiesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationArg>;
  filters?: InputMaybe<WeaponPropertyFiltersInput>;
  locale?: InputMaybe<Scalars['I18NLocaleCode']['input']>;
}>;


export type ExplorerGetWeaponPropertiesQuery = { __typename?: 'Query', weaponProperties_connection?: { __typename?: 'WeaponPropertyEntityResponseCollection', nodes: Array<{ __typename?: 'WeaponProperty', documentId: string, slug: string, name: string, description?: string | null, image?: { __typename?: 'UploadFile', url: string, alternativeText?: string | null } | null }>, pageInfo: (
      { __typename?: 'Pagination' }
      & { ' $fragmentRefs'?: { 'PaginationFragmentFragment': PaginationFragmentFragment } }
    ) } | null };

export type GenerateTerrainMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
}>;


export type GenerateTerrainMutation = { __typename?: 'Mutation', generateTerrain?: boolean | null };

export const FullRoomContextFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullRoomContext"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Room"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"turnData"}},{"kind":"Field","name":{"kind":"Name","value":"entropyState"}},{"kind":"Field","name":{"kind":"Name","value":"isProcessing"}},{"kind":"Field","name":{"kind":"Name","value":"world"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"portrait"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"isEquipped"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"equipment_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"armor_class_base"}},{"kind":"Field","name":{"kind":"Name","value":"damage_dice"}},{"kind":"Field","name":{"kind":"Name","value":"range_normal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spell_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"entity_sheets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}},{"kind":"Field","name":{"kind":"Name","value":"z"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"range"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reach"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"turns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"turnNumber:desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"turnNumber"}},{"kind":"Field","name":{"kind":"Name","value":"narrative"}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"timestamp:asc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"timestamp:desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"turn_number"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"actor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<FullRoomContextFragment, unknown>;
export const PaginationFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<PaginationFragmentFragment, unknown>;
export const GetAbilitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAbilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"abilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"skills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetAbilitiesQuery, GetAbilitiesQueryVariables>;
export const GetSkillsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSkills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skills"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"abilityScore"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetSkillsQuery, GetSkillsQueryVariables>;
export const GetRacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"races"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"speed"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<GetRacesQuery, GetRacesQueryVariables>;
export const GetClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"hit_die"}}]}}]}}]} as unknown as DocumentNode<GetClassesQuery, GetClassesQueryVariables>;
export const GetAlignmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAlignments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"abbreviation"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetAlignmentsQuery, GetAlignmentsQueryVariables>;
export const GetBackgroundsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBackgrounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgrounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"skillProficiencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetBackgroundsQuery, GetBackgroundsQueryVariables>;
export const GetLanguagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLanguages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"languages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<GetLanguagesQuery, GetLanguagesQueryVariables>;
export const GetMagicSchoolsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMagicSchools"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"magicSchools"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetMagicSchoolsQuery, GetMagicSchoolsQueryVariables>;
export const GetConditionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetConditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetConditionsQuery, GetConditionsQueryVariables>;
export const GetDamageTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDamageTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetDamageTypesQuery, GetDamageTypesQueryVariables>;
export const GetMonstersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMonsters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entitySheets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"StringValue","value":"monster","block":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}}]}}]}}]} as unknown as DocumentNode<GetMonstersQuery, GetMonstersQueryVariables>;
export const GetSpellsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSpells"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spells"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetSpellsQuery, GetSpellsQueryVariables>;
export const GetFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetFeaturesQuery, GetFeaturesQueryVariables>;
export const GetTraitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTraits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"traits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"races"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetTraitsQuery, GetTraitsQueryVariables>;
export const GetSubclassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubclasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subclasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"class"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetSubclassesQuery, GetSubclassesQueryVariables>;
export const GetProficienciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetProficiencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"proficiencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"races"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetProficienciesQuery, GetProficienciesQueryVariables>;
export const CreateRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"world"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"seed"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"chunkSize"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"fogRadius"}},{"kind":"Field","name":{"kind":"Name","value":"globalScale"}},{"kind":"Field","name":{"kind":"Name","value":"seaLevel"}},{"kind":"Field","name":{"kind":"Name","value":"elevationScale"}},{"kind":"Field","name":{"kind":"Name","value":"roughness"}},{"kind":"Field","name":{"kind":"Name","value":"moistureScale"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureOffset"}},{"kind":"Field","name":{"kind":"Name","value":"roadDensity"}},{"kind":"Field","name":{"kind":"Name","value":"structureChance"}},{"kind":"Field","name":{"kind":"Name","value":"structureSpacing"}},{"kind":"Field","name":{"kind":"Name","value":"structureSizeAvg"}},{"kind":"Field","name":{"kind":"Name","value":"worldSize"}},{"kind":"Field","name":{"kind":"Name","value":"worldType"}},{"kind":"Field","name":{"kind":"Name","value":"worldBackground"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dmSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adventureLength"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"setting"}},{"kind":"Field","name":{"kind":"Name","value":"tone"}},{"kind":"Field","name":{"kind":"Name","value":"playerCount"}},{"kind":"Field","name":{"kind":"Name","value":"startingLevel"}},{"kind":"Field","name":{"kind":"Name","value":"attributePointBudget"}},{"kind":"Field","name":{"kind":"Name","value":"dmSystemPrompt"}},{"kind":"Field","name":{"kind":"Name","value":"dmStyle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verbosity"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"engagement"}},{"kind":"Field","name":{"kind":"Name","value":"narrative"}},{"kind":"Field","name":{"kind":"Name","value":"specialMode"}},{"kind":"Field","name":{"kind":"Name","value":"customDirectives"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateRoomMutation, CreateRoomMutationVariables>;
export const JoinRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinRoom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"portrait"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upperBody"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fullBody"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"world"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"seed"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"chunkSize"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"fogRadius"}},{"kind":"Field","name":{"kind":"Name","value":"globalScale"}},{"kind":"Field","name":{"kind":"Name","value":"seaLevel"}},{"kind":"Field","name":{"kind":"Name","value":"elevationScale"}},{"kind":"Field","name":{"kind":"Name","value":"roughness"}},{"kind":"Field","name":{"kind":"Name","value":"moistureScale"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureOffset"}},{"kind":"Field","name":{"kind":"Name","value":"roadDensity"}},{"kind":"Field","name":{"kind":"Name","value":"structureChance"}},{"kind":"Field","name":{"kind":"Name","value":"structureSpacing"}},{"kind":"Field","name":{"kind":"Name","value":"structureSizeAvg"}},{"kind":"Field","name":{"kind":"Name","value":"worldSize"}},{"kind":"Field","name":{"kind":"Name","value":"worldType"}},{"kind":"Field","name":{"kind":"Name","value":"worldBackground"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dmSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adventureLength"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"setting"}},{"kind":"Field","name":{"kind":"Name","value":"tone"}},{"kind":"Field","name":{"kind":"Name","value":"playerCount"}},{"kind":"Field","name":{"kind":"Name","value":"startingLevel"}},{"kind":"Field","name":{"kind":"Name","value":"attributePointBudget"}},{"kind":"Field","name":{"kind":"Name","value":"dmSystemPrompt"}},{"kind":"Field","name":{"kind":"Name","value":"dmStyle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verbosity"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"engagement"}},{"kind":"Field","name":{"kind":"Name","value":"narrative"}},{"kind":"Field","name":{"kind":"Name","value":"specialMode"}},{"kind":"Field","name":{"kind":"Name","value":"customDirectives"}}]}}]}}]}}]}}]} as unknown as DocumentNode<JoinRoomMutation, JoinRoomMutationVariables>;
export const UpdateRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoomInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRoom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<UpdateRoomMutation, UpdateRoomMutationVariables>;
export const GenerateWorldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateWorld"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateWorld"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}}]}]}}]} as unknown as DocumentNode<GenerateWorldMutation, GenerateWorldMutationVariables>;
export const AddCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"character"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCharacter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"character"},"value":{"kind":"Variable","name":{"kind":"Name","value":"character"}}}]}]}}]} as unknown as DocumentNode<AddCharacterMutation, AddCharacterMutationVariables>;
export const StartGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"streamId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startGame"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}},{"kind":"Argument","name":{"kind":"Name","value":"streamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"streamId"}}}]}]}}]} as unknown as DocumentNode<StartGameMutation, StartGameMutationVariables>;
export const SubmitActionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitAction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"action"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitAction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"action"},"value":{"kind":"Variable","name":{"kind":"Name","value":"action"}}},{"kind":"Argument","name":{"kind":"Name","value":"mode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mode"}}}]}]}}]} as unknown as DocumentNode<SubmitActionMutation, SubmitActionMutationVariables>;
export const GenerateAvatarPortraitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAvatarPortrait"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAvatarPortrait"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}},{"kind":"Argument","name":{"kind":"Name","value":"referenceImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}}}]}]}}]} as unknown as DocumentNode<GenerateAvatarPortraitMutation, GenerateAvatarPortraitMutationVariables>;
export const GenerateAvatarUpperBodyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAvatarUpperBody"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"portrait"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAvatarUpperBody"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}},{"kind":"Argument","name":{"kind":"Name","value":"portrait"},"value":{"kind":"Variable","name":{"kind":"Name","value":"portrait"}}},{"kind":"Argument","name":{"kind":"Name","value":"referenceImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}}}]}]}}]} as unknown as DocumentNode<GenerateAvatarUpperBodyMutation, GenerateAvatarUpperBodyMutationVariables>;
export const GenerateAvatarFullBodyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAvatarFullBody"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"portrait"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"upperBody"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAvatarFullBody"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payload"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payload"}}},{"kind":"Argument","name":{"kind":"Name","value":"portrait"},"value":{"kind":"Variable","name":{"kind":"Name","value":"portrait"}}},{"kind":"Argument","name":{"kind":"Name","value":"upperBody"},"value":{"kind":"Variable","name":{"kind":"Name","value":"upperBody"}}},{"kind":"Argument","name":{"kind":"Name","value":"referenceImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"referenceImage"}}}]}]}}]} as unknown as DocumentNode<GenerateAvatarFullBodyMutation, GenerateAvatarFullBodyMutationVariables>;
export const SpawnCreatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpawnCreature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"creature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spawnCreature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"creature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"creature"}}}]}]}}]} as unknown as DocumentNode<SpawnCreatureMutation, SpawnCreatureMutationVariables>;
export const GenerateTerrainChunkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateTerrainChunk"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chunkX"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chunkY"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chunkSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateTerrainChunk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"chunkX"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chunkX"}}},{"kind":"Argument","name":{"kind":"Name","value":"chunkY"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chunkY"}}},{"kind":"Argument","name":{"kind":"Name","value":"chunkSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chunkSize"}}}]}]}}]} as unknown as DocumentNode<GenerateTerrainChunkMutation, GenerateTerrainChunkMutationVariables>;
export const CreateEntitySheetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEntitySheet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntitySheetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEntitySheet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateEntitySheetMutation, CreateEntitySheetMutationVariables>;
export const ExecuteToolDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteTool"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"command"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeTool"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"command"},"value":{"kind":"Variable","name":{"kind":"Name","value":"command"}}}]}]}}]} as unknown as DocumentNode<ExecuteToolMutation, ExecuteToolMutationVariables>;
export const ProcessTurnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProcessTurn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"processTurn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"messages"},"value":{"kind":"ListValue","values":[]}},{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}}]}]}}]} as unknown as DocumentNode<ProcessTurnMutation, ProcessTurnMutationVariables>;
export const GetRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RoomFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rooms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullRoomContext"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullRoomContext"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Room"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"turnData"}},{"kind":"Field","name":{"kind":"Name","value":"entropyState"}},{"kind":"Field","name":{"kind":"Name","value":"isProcessing"}},{"kind":"Field","name":{"kind":"Name","value":"world"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"isReady"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"portrait"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"isEquipped"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Item"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"equipment_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"armor_class_base"}},{"kind":"Field","name":{"kind":"Name","value":"damage_dice"}},{"kind":"Field","name":{"kind":"Name","value":"range_normal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spell_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"entity_sheets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}},{"kind":"Field","name":{"kind":"Name","value":"z"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableActions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"range"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"reach"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"turns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"turnNumber:desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"turnNumber"}},{"kind":"Field","name":{"kind":"Name","value":"narrative"}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"timestamp:asc","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"timestamp:desc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"turn_number"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"actor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetRoomQuery, GetRoomQueryVariables>;
export const ListRoomsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListRooms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"defaultValue":{"kind":"ListValue","values":[{"kind":"StringValue","value":"createdAt:desc","block":false}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rooms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"dmSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"setting"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}},{"kind":"Field","name":{"kind":"Name","value":"entity_sheets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"players"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"backstory"}},{"kind":"Field","name":{"kind":"Name","value":"portrait"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"race"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"class"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ListRoomsQuery, ListRoomsQueryVariables>;
export const ListCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"name:asc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1000"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"backstory"}},{"kind":"Field","name":{"kind":"Name","value":"race"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"class"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}}]}},{"kind":"Field","name":{"kind":"Name","value":"portrait"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<ListCharactersQuery, ListCharactersQueryVariables>;
export const ListMonstersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListMonsters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EntitySheetFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entitySheets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"name:asc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}}]}}]}}]} as unknown as DocumentNode<ListMonstersQuery, ListMonstersQueryVariables>;
export const ListSpellsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListSpells"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SpellFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spells"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"name:asc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}}]}}]}}]} as unknown as DocumentNode<ListSpellsQuery, ListSpellsQueryVariables>;
export const ListItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ItemFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"StringValue","value":"name:asc","block":false}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"equipment_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"armor_class_base"}},{"kind":"Field","name":{"kind":"Name","value":"damage_dice"}},{"kind":"Field","name":{"kind":"Name","value":"range_normal"}},{"kind":"Field","name":{"kind":"Name","value":"range_long"}},{"kind":"Field","name":{"kind":"Name","value":"str_minimum"}},{"kind":"Field","name":{"kind":"Name","value":"stealth_disadvantage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spell_data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}}]}}]}}]}}]} as unknown as DocumentNode<ListItemsQuery, ListItemsQueryVariables>;
export const SearchEntitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchEntities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEntities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<SearchEntitiesQuery, SearchEntitiesQueryVariables>;
export const GetWorldTimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorldTime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getWorldTime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ticks"}},{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"timeOfDay"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"isDay"}},{"kind":"Field","name":{"kind":"Name","value":"lightLevel"}}]}}]}}]} as unknown as DocumentNode<GetWorldTimeQuery, GetWorldTimeQueryVariables>;
export const GetAgentLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAgentLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAgentLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"actorId"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceId"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<GetAgentLogsQuery, GetAgentLogsQueryVariables>;
export const VoxelPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VoxelPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chunks"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChunkRequestInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"config"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorldConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"voxelPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chunks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chunks"}}},{"kind":"Argument","name":{"kind":"Name","value":"config"},"value":{"kind":"Variable","name":{"kind":"Name","value":"config"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"x"}},{"kind":"Field","name":{"kind":"Name","value":"y"}},{"kind":"Field","name":{"kind":"Name","value":"tiles"}}]}}]}}]} as unknown as DocumentNode<VoxelPreviewQuery, VoxelPreviewQueryVariables>;
export const ExplorerGetClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetClasses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ClassFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classes_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetClassesQuery, ExplorerGetClassesQueryVariables>;
export const ExplorerGetDamageTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetDamageTypes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DamageTypeFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageTypes_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetDamageTypesQuery, ExplorerGetDamageTypesQueryVariables>;
export const ExplorerGetFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetFeatures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FeatureFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"features_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetFeaturesQuery, ExplorerGetFeaturesQueryVariables>;
export const ExplorerGetLanguagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetLanguages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LanguageFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"languages_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetLanguagesQuery, ExplorerGetLanguagesQueryVariables>;
export const ExplorerGetMagicSchoolsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetMagicSchools"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MagicSchoolFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"magicSchools_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetMagicSchoolsQuery, ExplorerGetMagicSchoolsQueryVariables>;
export const ExplorerGetMonstersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetMonsters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EntitySheetFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entitySheets_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetMonstersQuery, ExplorerGetMonstersQueryVariables>;
export const ExplorerGetProficienciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetProficiencies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProficiencyFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"proficiencies_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetProficienciesQuery, ExplorerGetProficienciesQueryVariables>;
export const ExplorerGetRacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetRaces"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RaceFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"races_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"speed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetRacesQuery, ExplorerGetRacesQueryVariables>;
export const ExplorerGetSpellsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetSpells"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SpellFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spells_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"school"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetSpellsQuery, ExplorerGetSpellsQueryVariables>;
export const ExplorerGetSubclassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetSubclasses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SubclassFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subclasses_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subclass_flavor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetSubclassesQuery, ExplorerGetSubclassesQueryVariables>;
export const ExplorerGetTraitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetTraits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TraitFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"traits_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetTraitsQuery, ExplorerGetTraitsQueryVariables>;
export const ExplorerGetWeaponPropertiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExplorerGetWeaponProperties"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationArg"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WeaponPropertyFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"I18NLocaleCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weaponProperties_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaginationFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaginationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}}]}}]} as unknown as DocumentNode<ExplorerGetWeaponPropertiesQuery, ExplorerGetWeaponPropertiesQueryVariables>;
export const GenerateTerrainDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateTerrain"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateTerrain"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}]}]}}]} as unknown as DocumentNode<GenerateTerrainMutation, GenerateTerrainMutationVariables>;