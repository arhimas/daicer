import { FEATURES as LEGACY_FEATURES } from '@/genesis/seed-data/features';
import fs from 'fs';
import path from 'path';
import slugify from 'lodash/kebabCase';

const NEW_FEATURES = LEGACY_FEATURES.map((feat: any) => ({
  name: feat.name,
  slug: feat.slug || slugify(feat.name),
  description: feat.description,
  level: feat.level,
  tags: [feat.class ? `class_${feat.class}` : null].filter(Boolean),
}));

const content = `import { SeedFeature } from '@/genesis/schemas/molecules';

export const FEATURES: SeedFeature[] = ${JSON.stringify(NEW_FEATURES, null, 2)};
`;

const targetPath = path.resolve(__dirname, '../../genesis/vault/features.ts');
fs.writeFileSync(targetPath, content);

console.log(`Migrated ${NEW_FEATURES.length} features to ${targetPath}`);
