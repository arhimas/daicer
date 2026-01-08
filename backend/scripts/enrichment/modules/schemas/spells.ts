import { z } from 'zod';
import {
  CastingConfigSchema,
  RangeConfigSchema,
  DurationConfigSchema,
  MechanicsConfigSchema,
  ScalingConfigSchema,
  DamageInstanceSchema,
  ConditionInstanceSchema,
} from './core';

export const SpellSchema = z.object({
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
    .optional()
    .nullable(),
  casting_config: CastingConfigSchema.optional().nullable(),
  range_config: RangeConfigSchema.optional().nullable(),
  duration_config: DurationConfigSchema.optional().nullable(),
  mechanics_config: MechanicsConfigSchema.optional().nullable(),
  scaling_config: ScalingConfigSchema.optional().nullable(),
  damage_instances: z.array(DamageInstanceSchema).optional().nullable(),
  condition_instances: z.array(ConditionInstanceSchema).optional().nullable(),
});
