// The Vault exports standard arrays of seed data.
// These are populated by the 'genesis craft' command or manual entry.

import { SeedTrait, SeedTag } from '@/genesis/schemas/atoms';
import { SeedSpell, SeedItem, SeedClass, SeedFeature } from '@/genesis/schemas/molecules';
import { SeedEntity } from '@/genesis/schemas/composites';
import { SeedPrompt } from '@/genesis/schemas/prompts';

import { PROMPTS as InitialPrompts } from '@/genesis/vault/prompts';
import { SPELLS as SpellsData } from '@/genesis/vault/spells';

export const TAGS: SeedTag[] = [];
export const TRAITS: SeedTrait[] = [];
export const FEATURES: SeedFeature[] = [];
export const SPELLS: SeedSpell[] = SpellsData;
export const ITEMS: SeedItem[] = [];
export const CLASSES: SeedClass[] = [];
export const ENTITIES: SeedEntity[] = [];
export const PROMPTS: SeedPrompt[] = InitialPrompts;

// Re-export specific prompt file content if we want to separate it
// For now, we manually import and push in specific files or just manage it here.
// Let's import from prompts.ts
// PROMPTS.push(...InitialPrompts); // Already assigned above
