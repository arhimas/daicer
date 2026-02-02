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
  | 'genesis-architect';

// Zod Schemas for Runtime Validation
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
    }),
    'blueprint-architect': z.object({
        prompt: z.string(),
        archetype: z.string(),
        width: z.number(),
        height: z.number(),
        contextData: z.string(), // Must include Strict Legend
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
} as const;

// Infer types from Zod schemas for Single Source of Truth
export type PromptVariableMap = {
    [K in PromptKey]: z.infer<typeof PromptSchemas[K]>;
};

// Runtime Helper to validate keys
export const VALID_PROMPT_KEYS = Object.keys(PromptSchemas) as PromptKey[];
