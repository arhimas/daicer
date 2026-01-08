import { z } from 'zod';

export const CastingConfigSchema = z.object({
  time_value: z.number().int().describe('Numeric value of casting time'),
  time_unit: z.enum(['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day', 'Round']),
  reaction_trigger: z.string().optional().nullable().describe('Trigger condition if reaction'),
  is_ritual: z.boolean().default(false),
  is_concentration: z.boolean().describe('Requires Concentration (Duration rule)').default(false),
  components: z.object({
    verbal: z.boolean().default(false),
    somatic: z.boolean().default(false),
    material: z.boolean().default(false),
    material_description: z.string().optional().nullable(),
    cost_gp: z.number().int().default(0),
    consumed: z.boolean().default(false),
  }),
});

export const RangeConfigSchema = z.object({
  type: z.enum(['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']).default('Ranged (Feet)'),
  distance: z.number().int().optional().nullable().describe('Distance in feet (or miles if type matches)'),
  aoe_shape: z.enum(['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']).optional().nullable(),
  aoe_size: z.number().int().optional().nullable().describe('Radius, Length, or Side length in feet'),
  aoe_height: z.number().int().optional().nullable().describe('Height for Cylinder'),
});

export const DurationConfigSchema = z.object({
  type: z
    .enum(['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special'])
    .default('Instantaneous'),
  value: z.number().int().optional().nullable().describe('Numeric duration'),
  unit: z.enum(['Rounds', 'Minutes', 'Hours', 'Days']).optional().nullable(),
  concentration: z.boolean().default(false),
});

export const MechanicsConfigSchema = z.object({
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
  save_effect: z.enum(['Negate', 'Half', 'None']).optional().nullable().describe('Effect on successful save'),
});

export const ScalingConfigSchema = z.object({
  scales: z.boolean().default(false),
  type: z.enum(['Dice', 'Target', 'Duration', 'Special', 'None']).default('Dice').optional().nullable(),
  method: z
    .enum(['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds', 'None'])
    .default('Per Slot Level')
    .optional()
    .nullable(),
  dice_count: z.number().int().optional().nullable(),
  dice_value: z.number().int().optional().nullable(),
});

export const DamageInstanceSchema = z.object({
  dice_count: z.number().int().default(1),
  dice_value: z.number().int().default(6),
  flat_bonus: z.number().int().default(0),
  effect_type: z.enum(['Damage', 'Healing', 'TempHP']).optional().nullable().default('Damage'),
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
    .or(z.string())
    .optional()
    .nullable(),
  timing: z.enum(['Instant', 'Start of Turn', 'End of Turn', 'One Time Trigger']).default('Instant'),
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
  description: z.string().optional().nullable(),
});

export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  activation_type: z.enum(['action', 'bonus_action', 'reaction', 'passive', 'other']).optional().default('passive'),
  usage_max: z.number().int().optional().nullable(),
  usage_per: z.enum(['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']).optional().nullable(),
  recharge: z.string().optional().nullable().describe('Recharge condition e.g. "5-6"'),
});
