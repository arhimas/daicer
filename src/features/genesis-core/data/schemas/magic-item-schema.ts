import { z } from 'zod';
import { APIReferenceSchema } from '@/features/genesis-core/data/schemas/common-schemas';

export const RaritySchema = z.object({
  name: z.enum(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies']),
});

export const MagicItemSchema = z.object({
  index: z.string(),
  name: z.string(),
  equipment_category: APIReferenceSchema,
  rarity: RaritySchema,
  variants: z.array(APIReferenceSchema),
  variant: z.boolean(),
  desc: z.array(z.string()),
  image: z.string().optional(),
  url: z.string(),
});

export type SourceMagicItem = z.infer<typeof MagicItemSchema>;
