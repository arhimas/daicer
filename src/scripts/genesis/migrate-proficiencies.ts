import { CLASSES } from '@/genesis/seed-data/classes';
import fs from 'fs';
import path from 'path';
import slugify from 'lodash/kebabCase';

interface ProfData {
  name: string;
  slug: string;
  type: 'armor' | 'weapon' | 'tool' | 'saving_throw' | 'skill';
}

const collectedMap = new Map<string, ProfData>();

const add = (name: string, type: ProfData['type']) => {
  if (!name || name === 'None' || name.startsWith('Choose')) return;
  const slug = slugify(name);
  if (!collectedMap.has(slug)) {
    collectedMap.set(slug, { name, slug, type });
  }
};

CLASSES.forEach((cls: any) => {
  // Armor
  cls.proficiencies.armor.forEach((p: string) => add(p, 'armor'));
  // Weapons
  cls.proficiencies.weapons.forEach((p: string) => add(p, 'weapon'));
  // Tools
  cls.proficiencies.tools.forEach((p: string) => add(p, 'tool'));
  // Saving Throws
  cls.proficiencies.saving_throws.forEach((p: string) => add(p, 'saving_throw'));
  // Skills (Choices)
  if (cls.proficiency_choices) {
    cls.proficiency_choices.forEach((p: string) => add(p, 'skill'));
  }
});

const FINAL_PROFS = Array.from(collectedMap.values());

const content = `import { SeedProficiency } from '@/genesis/schemas/atoms';

export const PROFICIENCIES: SeedProficiency[] = ${JSON.stringify(FINAL_PROFS, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/proficiencies.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${FINAL_PROFS.length} proficiencies to ${targetPath}`);
