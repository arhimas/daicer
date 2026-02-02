import { z } from 'zod';

// Common Primitives
export const Slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case');
export const DocumentId = z.string();
export const RichText = z.string(); // For now, just string. Strapi Blocks are complex.

// For Seeding: Relations are typically arrays of Slugs (strings) that we resolve later.
export const RelationOne = z.string().nullable().optional(); // Slug of the related entity
export const RelationMany = z.array(z.string()).optional(); // Array of Slugs

// Simple Enums
export const DamageTypeEnum = z.enum([
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
]);

export const SizeEnum = z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']);

export const AbilityScoreEnum = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']);
