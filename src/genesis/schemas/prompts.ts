import { z } from 'zod';

export const PromptSchema = z
  .object({
    key: z.string().min(1), // Unique Key (e.g. genesis-architect)
    text: z.string().min(1), // The actual template
    description: z.string().optional(),
    variables: z.any().optional(), // JSON
  })
  .strict();

export type SeedPrompt = z.infer<typeof PromptSchema>;
