export type PromptKey = 
  | 'system-identity'
  | 'gameplay-combat'
  | 'gameplay-exploration'
  | 'user-onboarding'
  | 'system-safety-tools'
  | 'pixel-forge-system'
  | 'blueprint-architect'
  | 'voxel-architect';

export interface PromptVariableMap {
    'system-identity': Record<string, never>; // No variables
    'gameplay-combat': {
        combatantState: string;
        action: string;
    };
    'gameplay-exploration': {
        location: string;
        players: string;
    };
    'user-onboarding': Record<string, never>;
    'system-safety-tools': Record<string, never>;
    'pixel-forge-system': {
        width: number;
        height: number;
        contextData: string;
        visionInstruction: string;
        specificInstruction: string;
        enhancedPrompt: string;
    };
    'blueprint-architect': {
        prompt: string;
        archetype: string;
        width: number;
        height: number;
        contextData: string; // Must include Strict Legend
    };
    'voxel-architect': {
        prompt: string;
        width: number;
        depth: number;
        contextData: string;
    };
}

// Runtime Helper to validate keys
export const VALID_PROMPT_KEYS = [
  'system-identity',
  'gameplay-combat',
  'gameplay-exploration',
  'user-onboarding',
  'system-safety-tools',
  'pixel-forge-system',
  'blueprint-architect',
  'voxel-architect'
] as const;
