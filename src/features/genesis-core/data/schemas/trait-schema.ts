import { z } from 'zod';
import { APIReferenceSchema } from '@/features/genesis-core/data/schemas/common-schemas';

export const TraitSchema = z.object({
  index: z.string(),
  name: z.string(),
  desc: z.array(z.string()),
  races: z.array(APIReferenceSchema).optional(),
  subraces: z.array(APIReferenceSchema).optional(),
  proficiencies: z.array(APIReferenceSchema).optional(),
  proficiency_choices: z
    .object({
      choose: z.number(),
      type: z.string(),
      from: z.union([
        z.object({
          options: z.array(z.object({ item: APIReferenceSchema })),
        }),
        z.array(APIReferenceSchema), // Sometimes direct array? Needs verification
      ]),
    })
    .optional(),
  url: z.string(),
});

export type SourceTrait = z.infer<typeof TraitSchema>;
