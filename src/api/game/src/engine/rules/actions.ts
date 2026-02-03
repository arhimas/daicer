/**
 * Re-exports Action Definitions and Schemas from the Shared Kernel.
 * This ensures the Engine stays in sync with the API Contracts.
 */
export {
  ActionType,
  DamageSchema,
  SaveSchema,
  AttackIntentSchema,
  CastSpellIntentSchema,
  UseFeatureIntentSchema,
  DashIntentSchema,
  DisengageIntentSchema,
  DodgeIntentSchema,
  GrappleIntentSchema,
  ActionIntentSchema,
  type ActionIntent,
  MeleeAttackDefinitionSchema,
  RangedAttackDefinitionSchema,
  SpellDefinitionSchema,
  FeatureDefinitionSchema,
  ReactionTriggerSchema,
  ReactionDefinitionSchema,
  ActionDefinitionSchema,
  type ActionDefinition,
} from '@daicer/shared';
