import { CLASSES as LEGACY_CLASSES } from '@/genesis/seed-data/classes';
import { FEATURES } from '@/genesis/vault/features';
import { PROFICIENCIES } from '@/genesis/vault/proficiencies';
import fs from 'fs';
import path from 'path';
import slugify from 'lodash/kebabCase';

// Helper to look up proficiency slug
const getProfSlug = (name: string): string => {
  const found = PROFICIENCIES.find((p) => p.name === name);
  if (found) return found.slug;
  return slugify(name);
};

// Helper to look up feature
const getFeatureSlug = (classSlug: string, featureName: string): string => {
  // 1. Try exact slug match pattern found in legacy data
  const candidateSlug = `${classSlug}-${slugify(featureName)}`;
  const found = FEATURES.find((f) => f.slug === candidateSlug);
  if (found) return found.slug;

  // 2. Try simple slug
  const simpleSlug = slugify(featureName);
  const foundSimple = FEATURES.find((f) => f.slug === simpleSlug);
  if (foundSimple) return foundSimple.slug;

  // 3. Fallback: Warn and return guessed slug
  console.warn(`⚠️  Could not find feature '${featureName}' for class '${classSlug}'. Guessed '${candidateSlug}'`);
  return candidateSlug;
};

const NEW_CLASSES = LEGACY_CLASSES.map((cls: any) => {
  const classSlug = cls.slug;

  // Proficiencies
  const profs = [
    ...cls.proficiencies.armor.map((n: string) => getProfSlug(n)),
    ...cls.proficiencies.weapons.map((n: string) => getProfSlug(n)),
    ...cls.proficiencies.tools.map((n: string) => getProfSlug(n)),
    ...cls.proficiencies.saving_throws.map((n: string) => getProfSlug(n)),
  ].filter((s) => s !== 'none' && s !== 'choose_one_type_of_artisan_s_tools_or_one_musical_instrument');
  // Filter out 'none' or instructions

  // Progression
  const progression = cls.progression.map((level: any) => ({
    level: level.level,
    features: (level.features || []).map((fname: string) => getFeatureSlug(classSlug, fname)),
  }));

  return {
    slug: classSlug,
    name: cls.name,
    hit_die: `d${cls.hit_die}`, // number to string d6/d8...
    proficiencies: profs,
    progression: progression,
    description: `Character Class: ${cls.name}`, // Fallback description
  };
});

const content = `import { SeedClass } from '@/genesis/schemas/molecules';

export const CLASSES: SeedClass[] = ${JSON.stringify(NEW_CLASSES, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/classes.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${NEW_CLASSES.length} classes to ${targetPath}`);
