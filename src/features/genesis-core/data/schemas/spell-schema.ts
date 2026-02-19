
import { z } from 'zod';
import { APIReferenceSchema, DamageSchema, DCMethodSchema } from './common-schemas';

export const SpellSchema = z.object({
  index: z.string(),
  name: z.string(),
  desc: z.array(z.string()),
  higher_level: z.array(z.string()).optional(),
  range: z.string(),
  components: z.array(z.string()),
  material: z.string().optional(),
  ritual: z.boolean(),
  duration: z.string(),
  concentration: z.boolean(),
  casting_time: z.string(),
  level: z.number(),
  attack_type: z.string().optional(),
  damage: DamageSchema.optional(),
  dc: DCMethodSchema.optional(),
  school: APIReferenceSchema,
  classes: z.array(APIReferenceSchema).optional(),
  subclasses: z.array(APIReferenceSchema).optional(),
  url: z.string(),
});

export type SourceSpell = z.infer<typeof SpellSchema>;
