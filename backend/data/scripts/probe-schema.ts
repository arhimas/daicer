
import { createStrapi } from '@strapi/strapi';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const strapi = await createStrapi({ distDir: 'dist' }).load();
  
  try {
    const spellUid = 'api::spell.spell';
    const contentType = strapi.contentTypes[spellUid];

    if (!contentType) {
      console.error(`UID ${spellUid} not found!`);
    } else {
      console.log('--- Spell Schema Attributes ---');
      console.log(JSON.stringify(contentType.attributes, null, 2));
      
      console.log('\n--- Checking Enumerations ---');
      const schoolAttr = contentType.attributes['school'];
      if (schoolAttr && schoolAttr.type === 'enumeration') {
        console.log('School Enum Values:', schoolAttr.enum);
      }
    }
    
    // Check components
    console.log('\n--- Component: Game.CastingConfig ---');
    const compConfig = strapi.components['game.casting-config'];
    if (compConfig) {
        console.log(JSON.stringify(compConfig.attributes, null, 2));
    }

  } catch (error) {
    console.error('Probe failed:', error);
  } finally {
    strapi.stop();
  }
}

main();
