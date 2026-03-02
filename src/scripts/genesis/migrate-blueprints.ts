import fs from 'fs';
import path from 'path';

// Hex code default definitions
const ZONE_COLORS: Record<string, string> = {
  head: '#FFCCCC',
  core: '#CCFFCC',
  legs: '#CCCCFF',
  tail: '#FFFFCC',
  'hand-l': '#FFCCFF',
  'hand-r': '#CCFFFF',
  accessory: '#DDDDDD',
  wings: '#EEEEEE',
  weapon: '#888888',
  mount: '#444444'
};
// Fallback generator for unusual zones
function getFallbackColor(index: number) {
  const fallbacks = ['#f54242', '#f5a442', '#f5f542', '#42f554', '#42f5e3', '#426cf5', '#9c42f5', '#f542d1'];
  return fallbacks[index % fallbacks.length];
}

async function run() {
  const blueprintsDir = path.resolve(process.cwd(), 'src/genesis/blueprints/blueprint');
  const spritesDir = path.resolve(process.cwd(), 'src/genesis/sprites/blueprints');
  
  if (!fs.existsSync(spritesDir)) fs.mkdirSync(spritesDir, { recursive: true });

  const files = fs.readdirSync(blueprintsDir).filter(f => f.endsWith('.ts'));

  console.log(`\n🔍 Found ${files.length} legacy blueprints to migrate...`);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hexArrayToPng } = require('../../scripts/png-to-hex.js');

  for (const file of files) {
    const filePath = path.join(blueprintsDir, file);
    try {
      // Dynamic import to parse it through defineBlueprint which just passes the object through
      const mod = await import(filePath);
      const bp = mod.default;

      if (!bp.grid) {
         console.log(`⏩ Skipping ${bp.slug}, no grid array found.`);
         continue;
      }

      console.log(`⚙️ Migrating ${bp.name} (${bp.slug})...`);

      // 1. Build the PNG Hex array
      const hexArray: string[] = [];
      const newMapping: Record<string, string> = {};
      
      let fallbackCounter = 0;
      
      const legacyMapping = bp.mapping || {};
      
      for (let y = 0; y < bp.grid.length; y++) {
         const row = bp.grid[y];
         for (let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char === ' ') {
               hexArray.push('#00000000');
            } else {
               const zoneSlug = legacyMapping[char];
               if (!zoneSlug) {
                  hexArray.push('#FF00FF'); // Unknown char logic
                  continue;
               }

               let hexColor = ZONE_COLORS[zoneSlug];
               if (!hexColor) {
                  hexColor = getFallbackColor(fallbackCounter++);
                  ZONE_COLORS[zoneSlug] = hexColor; // Cache it
               }

               newMapping[hexColor] = zoneSlug;
               hexArray.push(hexColor);
            }
         }
      }

      // 2. Export PNG
      const pngPath = path.join(spritesDir, `${bp.slug}.png`);
      const dimensions = bp.grid.length; // usually 32, 64, or 128
      await hexArrayToPng(hexArray, dimensions, pngPath);

      // 3. Rewrite blueprint file omitting grid and old mapping
      const fileContent = `import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: '${bp.name}',
  slug: '${bp.slug}',
  category: '${bp.category}',
  gridUrl: '/src/genesis/sprites/blueprints/${bp.slug}.png',
  zones: ${JSON.stringify(bp.zones)},
  mapping: ${JSON.stringify(newMapping, null, 4)},
  anchors: ${JSON.stringify(bp.anchors, null, 4)}
});
`;

      fs.writeFileSync(filePath, fileContent);
      console.log(`   ✅ Exported ${dimensions}x${dimensions} PNG to ${pngPath} and cleaned ${file}`);
    } catch (e: any) {
       console.error(`   ❌ Failed to migrate ${file}: ${e.message}`);
    }
  }

  console.log('\n🎉 Blueprint Image Migration Complete!');
}

run();
