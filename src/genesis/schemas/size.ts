import { z } from 'zod';

export const SizeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  instruction: z.string(),
  order: z.number().int().default(0),
});

export type Size = z.infer<typeof SizeSchema>;
