// The Vault exports standard arrays of seed data.
// These are populated by the 'genesis craft' command or manual entry.

import {
  SeedTag,
  SeedTrait,
  SeedFeature,
  SeedSpell,
  SeedItem,
  SeedClass,
  SeedEntity,
  SeedPrompt,
  SeedProficiency,
  SeedRace,
  SeedTerrain,
} from '@/genesis/schemas';

import { PROMPTS as InitialPrompts } from '@/genesis/vault/prompts';
import { TAGS as TagsData } from '@/genesis/vault/tags';
import { SPELLS as SpellsData } from '@/genesis/vault/spells';
import { TRAITS as TraitsData } from '@/genesis/vault/traits';

import { ITEMS as ItemsData } from '@/genesis/vault/items';
import { FEATURES as FeaturesData } from '@/genesis/vault/features';
import { PROFICIENCIES as ProfData } from '@/genesis/vault/proficiencies';
import { SIZES as SizesData } from '@/genesis/vault/sizes';
import { Size } from '@/genesis/schemas/size';
import { CLASSES as ClassesData } from '@/genesis/vault/classes';
import { RACES as RacesData } from '@/genesis/vault/races';
import { TERRAINS as TerrainsData } from '@/genesis/vault/terrains';

export const TAGS: SeedTag[] = TagsData;
export const TRAITS: SeedTrait[] = TraitsData;
export const PROFICIENCIES: SeedProficiency[] = ProfData;
export const FEATURES: SeedFeature[] = FeaturesData;
export const SPELLS: SeedSpell[] = SpellsData;
export const ITEMS: SeedItem[] = ItemsData;
export const CLASSES: SeedClass[] = ClassesData;
export const RACES: SeedRace[] = RacesData;
export const TERRAINS: SeedTerrain[] = TerrainsData;
export const ENTITIES: SeedEntity[] = [];
export const PROMPTS: SeedPrompt[] = InitialPrompts;
export const SIZES: Size[] = SizesData;

// Re-export specific prompt file content if we want to separate it
// For now, we manually import and push in specific files or just manage it here.
// Let's import from prompts.ts
// PROMPTS.push(...InitialPrompts); // Already assigned above
