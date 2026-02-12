import { RACES as LEGACY_RACES } from '@/genesis/seed-data/races';
import fs from 'fs';
import path from 'path';
import slugify from 'lodash/kebabCase';

const NEW_RACES = LEGACY_RACES.map((race: any) => ({
  name: race.name,
  slug: race.slug || slugify(race.name),
  description: race.description,
  speed: race.speed.walk, // Flatten speed object to number if Schema expects number
  size: race.size,
  traits: (race.traits || []).map((t: string) => slugify(t)),
}));

const content = `import { SeedRace } from '@/genesis/schemas/atoms';

export const RACES: SeedRace[] = ${JSON.stringify(NEW_RACES, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/races.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${NEW_RACES.length} races to ${targetPath}`);
