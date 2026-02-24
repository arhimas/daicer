import fs from 'fs/promises';
import path from 'path';

const BLUEPRINTS_DIR = path.join(process.cwd(), 'src/data/blueprints');

// Mapping of blueprint subdirectories to their respective factory names
const FACTORY_MAP: Record<string, string> = {
  entity: 'defineEntity',
  action: 'defineAction',
  spell: 'defineSpell',
  item: 'defineItem',
  feature: 'defineFeature',
  trait: 'defineTrait',
  class: 'defineClass',
  subclass: 'defineSubclass',
  race: 'defineRace',
  'damage-type': 'defineDamageType',
  'status-effect': 'defineStatusEffect',
  'magic-school': 'defineMagicSchool',
  background: 'defineBackground',
  'weapon-property': 'defineWeaponProperty',
};

async function convertPacks() {
  console.log('🚀 Starting Mass Blueprint TypeScript Transpilation...');
  let totalConverted = 0;

  for (const [folderName, factoryName] of Object.entries(FACTORY_MAP)) {
    const packDir = path.join(BLUEPRINTS_DIR, folderName);

    try {
      await fs.access(packDir);
    } catch {
      continue; // Skip if directory doesn't exist
    }

    const files = await fs.readdir(packDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    if (jsonFiles.length === 0) continue;

    console.log(`\n📂 Transpiling [${folderName}] using ${factoryName} (${jsonFiles.length} blueprints)`);

    for (const file of jsonFiles) {
      const jsonPath = path.join(packDir, file);
      const tsPath = path.join(packDir, file.replace('.json', '.ts'));

      try {
        const rawJson = await fs.readFile(jsonPath, 'utf-8');
        // Parse and stringify to ensure clean formatting and drop weird whitespace
        const dataStr = JSON.stringify(JSON.parse(rawJson), null, 2);

        const tsContent = `import { ${factoryName} } from '../../../features/genesis-core/blueprints';\n\nexport default ${factoryName}(${dataStr});\n`;

        await fs.writeFile(tsPath, tsContent);
        // Delete original JSON after successful TS cast
        await fs.unlink(jsonPath);

        totalConverted++;
      } catch (err) {
        console.error(`❌ Failed to transpile ${file}:`, err);
      }
    }
  }

  console.log(`\n🏁 Typesafe Transpilation Complete. Upgraded ${totalConverted} semantic assets to TypeScript.`);
}

convertPacks().catch(console.error);
