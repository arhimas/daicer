
import { z } from 'zod';
import { Slug, RichText, RelationMany } from './common';

export const TraitSchema = z.object({
    slug: Slug,
    name: z.string().min(1),
    description: RichText,
    type: z.enum(["racial", "feat", "background", "monster"]).default("racial").optional(),
    races: RelationMany, // Slugs
    proficiencies: RelationMany // Slugs
}).strict();

export const TagSchema = z.object({
    slug: Slug,
    name: z.string(),
    color: z.string().optional(),
    category: z.enum(["general", "mechanic", "thematic", "meta"]).default("general")
}).strict();

export type SeedTrait = z.infer<typeof TraitSchema>;
export type SeedTag = z.infer<typeof TagSchema>;
