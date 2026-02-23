import { z } from 'zod';
import { APIReferenceSchema } from './common-schemas';

export const RaceSchema = z.object({
  index: z.string(),
  name: z.string(),
  speed: z.number(),
  ability_bonuses: z.array(
    z.object({
      ability_score: APIReferenceSchema,
      bonus: z.number(),
    })
  ),
  alignment: z.string(),
  age: z.string(),
  size: z.string(),
  size_description: z.string(),
  starting_proficiencies: z.array(APIReferenceSchema).optional(),
  languages: z.array(APIReferenceSchema),
  language_desc: z.string(),
  traits: z.array(APIReferenceSchema),
  subraces: z.array(APIReferenceSchema),
  url: z.string(),
});

export type SourceRace = z.infer<typeof RaceSchema>;
