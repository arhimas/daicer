import { ITEMS as LEGACY_ITEMS } from '@/genesis/seed-data/items';
import fs from 'fs';
import path from 'path';
import slugify from 'lodash/kebabCase';

const mapType = (t: string): string => {
  const lower = t.toLowerCase();
  if (lower.includes('weapon')) return 'weapon';
  if (lower.includes('armor') || lower.includes('shield')) return 'armor';
  if (lower.includes('scroll')) return 'spell_scroll';
  if (lower.includes('wondrous')) return 'wondrous_item';
  if (lower.includes('ring')) return 'ring';
  if (lower.includes('rod')) return 'rod';
  if (lower.includes('staff')) return 'staff';
  if (lower.includes('wand')) return 'wand';
  if (lower.includes('potion')) return 'potion';
  return 'loot';
};

const mapRarity = (r: string): string => {
  return r.toLowerCase().replace(' ', '_');
};

const NEW_ITEMS = LEGACY_ITEMS.map((item: any) => ({
  name: item.name,
  slug: item.slug || slugify(item.name),
  type: mapType(item.type),
  rarity: mapRarity(item.rarity),
  requires_attunement: item.requires_attunement || false,
  value: 0,
  weight: 0,
  description: item.description,
  tags: [],
}));

const content = `import { SeedItem } from '@/genesis/schemas/molecules';

export const ITEMS: SeedItem[] = ${JSON.stringify(NEW_ITEMS, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/items.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${NEW_ITEMS.length} items to ${targetPath}`);
