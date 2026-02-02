import { z } from 'zod';

export type PromptKey =
  | 'system-identity'
  | 'gameplay-combat'
  | 'gameplay-exploration'
  | 'user-onboarding'
  | 'system-safety-tools'
  | 'pixel-forge-system'
  | 'blueprint-architect'
  | 'voxel-architect'
  | 'genesis-architect'
  | 'enhance-terrain'
  | 'enhance-item'
  | 'enhance-character';

export const PromptSchemas = {
  'system-identity': z.object({}),
  'gameplay-combat': z.object({
    combatantState: z.string(),
    action: z.string(),
  }),
  'gameplay-exploration': z.object({
    location: z.string(),
    players: z.string(),
  }),
  'user-onboarding': z.object({}),
  'system-safety-tools': z.object({}),
  'pixel-forge-system': z.object({
    width: z.number(),
    height: z.number(),
    contextData: z.string(),
    visionInstruction: z.string(),
    specificInstruction: z.string(),
    enhancedPrompt: z.string(),
    asciiBlueprint: z.string().optional(),
  }),
  'blueprint-architect': z.object({
    prompt: z.string(),
    archetype: z.string(),
    width: z.number(),
    height: z.number(),
    contextData: z.string(),
  }),
  'voxel-architect': z.object({
    prompt: z.string(),
    width: z.number(),
    depth: z.number(),
    contextData: z.string(),
  }),
  'genesis-architect': z.object({
    term: z.string(),
    type: z.string(),
    contextData: z.string(),
  }),
  'enhance-terrain': z.object({
    rawPrompt: z.string(),
  }),
  'enhance-item': z.object({
    rawPrompt: z.string(),
  }),
  'enhance-character': z.object({
    rawPrompt: z.string(),
  }),
} as const;

export type PromptVariableMap = {
  [K in PromptKey]: z.infer<(typeof PromptSchemas)[K]>;
};

export const VALID_PROMPT_KEYS = Object.keys(PromptSchemas) as PromptKey[];
