import { createStrapi } from '@strapi/strapi';
import { GenesisSeeder } from '@/genesis/seeder';
import * as Schemas from '@/genesis/schemas';
import fs from 'fs';
import path from 'path';

// Load directly to avoid the seeder.ts massive array maps
const loadFromDir = (dirName: string) => {
   const items: any[] = [];
   const dirPath = path.resolve(process.cwd(), 'src/genesis/blueprints', dirName); 
   if (fs.existsSync(dirPath)) {
     const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.ts'));
     for (const f of files) {
       try {
         // eslint-disable-next-line @typescript-eslint/no-require-imports
         const mod = require(path.join(dirPath, f));
         items.push(mod.default);
       } catch (e) {
         console.error(`❌ Failed to load ${f}:`, e);
       }
     }
   }
   return items;
};

async function run() {
  const strapi = createStrapi({ distDir: 'dist' });
  await strapi.load();
  
  const ctx = new GenesisSeeder(strapi);

  try {
     const dynamicEntities = loadFromDir('entity');
     
     // Quick manual dynamic resolve
     // eslint-disable-next-line @typescript-eslint/no-require-imports
     const { pngToHexArray } = require(path.resolve(process.cwd(), 'src/scripts/png-to-hex.js'));

     const hydrateWithAssets = async (typeSlug: string, itemData: any) => {
       const result = { ...itemData };
       if (!result.slug) return result;
       const spritePath = path.resolve(process.cwd(), `src/genesis/sprites/${typeSlug}/${result.slug}.png`);
       if (fs.existsSync(spritePath)) {
         try {
            const parsed = await pngToHexArray(spritePath);
            if (parsed && parsed.hexArray) {
               result.spriteData = parsed.hexArray;
               if (parsed.width) result.width = parsed.width / 32;
               if (parsed.height) result.height = parsed.height / 32;
            }
         } catch (_e) {
            // ignore
         }
       }
       return result;
     };


     let count = 0;
     const dbCount = await strapi.documents('api::entity.entity').count({});
     console.log(`Current Entities in DB: ${dbCount}`);

     for (const item of dynamicEntities) {
        count++;
        process.stdout.write(`\rProcess ${count}/${dynamicEntities.length}`);
        
        try {
           const hydratedEntity = await hydrateWithAssets('entities', item);
           // Directly access private method for hotfix runner
           await (ctx as any).syncEntity('api::entity.entity', hydratedEntity, Schemas.EntitySchema);
        } catch(e) {
           console.error(`💥 FATAL ERROR on Entity ${item.slug}:`, e);
        }
     }
     console.log('\nEntity seeding finished smoothly.');
  } catch(e) {
     console.error("OVERALL CRASH", e);
  } finally {
     process.exit(0); // Force exit without triggering standard Strapi workers
  }
}
run();
