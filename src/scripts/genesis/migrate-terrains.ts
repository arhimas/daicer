import { TERRAINS as LEGACY_TERRAINS } from '@/genesis/seed-data/terrains';
import fs from 'fs';
import path from 'path';

const NEW_TERRAINS = LEGACY_TERRAINS.map((t: any) => ({
  name: t.name,
  slug: t.slug,
  color: t.color,
  isWalkable: t.isWalkable,
  isTransparent: t.isTransparent,
  isLiquid: t.isLiquid,
  damagePerTick: t.damagePerTick,
  luminance: t.luminance,
  moisture: t.moisture,
  temperature: t.temperature,
  tags: t.tags,
}));

const content = `import { SeedTerrain } from '@/genesis/schemas/atoms';

export const TERRAINS: SeedTerrain[] = ${JSON.stringify(NEW_TERRAINS, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/terrains.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${NEW_TERRAINS.length} terrains to ${targetPath}`);
