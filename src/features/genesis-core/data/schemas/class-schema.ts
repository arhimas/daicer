import { z } from 'zod';
import { APIReferenceSchema } from './common-schemas';

export const ClassSchema = z.object({
  index: z.string(),
  name: z.string(),
  hit_die: z.number(),
  proficiency_choices: z.array(
    z.object({
      choose: z.number(),
      type: z.string(),
      from: z.object({
        options: z.array(
          z.object({
            item: APIReferenceSchema.optional(), // Sometimes item, sometimes reference?
            desc: z.string().optional(), // Sometimes description like "Skill: History"
          })
        ),
      }),
    })
  ),
  proficiencies: z.array(APIReferenceSchema),
  saving_throws: z.array(APIReferenceSchema),
  starting_equipment: z.array(
    z.object({
      equipment: APIReferenceSchema,
      quantity: z.number(),
    })
  ),
  class_levels: z.string(),
  subclasses: z.array(APIReferenceSchema),
  url: z.string(),
});

export type SourceClass = z.infer<typeof ClassSchema>;
