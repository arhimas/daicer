import { z } from 'zod';
import { APIReferenceSchema } from '@/features/genesis-core/data/schemas/common-schemas';

export const FeatureSchema = z.object({
  index: z.string(),
  name: z.string(),
  level: z.number().optional(), // Sometimes missing?
  desc: z.array(z.string()),
  class: APIReferenceSchema,
  subclass: APIReferenceSchema.optional(),
  parent: APIReferenceSchema.optional(), // Sometimes present
  prerequisites: z.array(z.any()).optional(), // Complex structure, leaving as any for now
  reference: z.string().optional(),
  url: z.string(),
});

export type SourceFeature = z.infer<typeof FeatureSchema>;
