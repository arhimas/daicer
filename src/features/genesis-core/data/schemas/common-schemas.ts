import { z } from 'zod';

export const APIReferenceSchema = z.object({
  index: z.string(),
  name: z.string(),
  url: z.string(),
});

export type APIReference = z.infer<typeof APIReferenceSchema>;

export const DCMethodSchema = z.object({
  dc_type: APIReferenceSchema,
  dc_success: z.string().optional(),
});

export const DamageSchema = z.object({
  damage_type: APIReferenceSchema.optional(),
  damage_at_slot_level: z.record(z.string(), z.string()).optional(),
  damage_at_character_level: z.record(z.string(), z.string()).optional(),
});
