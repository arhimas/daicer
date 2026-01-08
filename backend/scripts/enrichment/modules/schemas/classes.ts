import { z } from 'zod';
import { FeatureSchema } from './core';

export const ClassEnrichmentSchema = z.object({
  features: z.array(FeatureSchema).default([]),
});
