import { createStrapi } from '@strapi/strapi';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const OUTPUT_FILE = path.resolve(process.cwd(), 'data/schemas/generated.ts');

async function main() {
  console.log('ðŸ”® Starting Zod Schema Generator...');
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    const components = strapi.components;
    const contentTypes = strapi.contentTypes;

    let output = `import { z } from 'zod';\n\n`;

    // 1. Generate Component Schemas
    // We sort keys to try and respect some order, but Zod lazy might be needed for cycles.
    // For now, we assume simple topological order or use z.lazy if needed.
    // Actually, simply exporting them as consts works if we don't have cycles.

    console.log(`Found ${Object.keys(components).length} components.`);

    // Helper to generate schema for a single Attribute
    // Helper to generate schema for a single Attribute
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateAttributeStr = (key: string, attr: any): string => {
      let validator = 'z.any()';

      switch (attr.type) {
        case 'string':
        case 'text':
        case 'richtext':
        case 'email':
        case 'uid':
          validator = 'z.string()';
          break;
        case 'integer':
        case 'biginteger':
        case 'float':
        case 'decimal':
        case 'number':
          validator = 'z.number()';
          break;
        case 'boolean':
          validator = 'z.boolean()';
          break;
        case 'enumeration':
          if (attr.enum && Array.isArray(attr.enum)) {
            const values = attr.enum.map((v: string) => `"${v}"`).join(', ');
            validator = `z.enum([${values}])`;
          } else {
            validator = 'z.string()';
          }
          break;
        case 'json':
          validator = 'z.any()';
          break;
        case 'component': {
          // attr.component is the UID 'game.casting-config'
          // We want to reference the exported const, e.g. GameCastingConfigSchema
          const compName = formatName(attr.component);
          const base = `${compName}Schema`;

          if (attr.repeatable) {
            validator = `z.array(z.lazy(() => ${base}))`;
          } else {
            validator = `z.lazy(() => ${base})`;
          }
          break;
        }
        case 'relation':
          // For the Library JSON, relations are typically SLUGS (strings)
          // But could be IDs. We allow string | number for now.
          // Or maybe arrays of them.
          if (attr.relation.endsWith('ToMany')) {
            validator = `z.union([z.string(), z.number()]).array()`;
          } else {
            validator = `z.union([z.string(), z.number()])`;
          }
          break;
        case 'media':
          validator = 'z.any()'; // Media is complex in JSON seeds
          break;
        default:
          validator = 'z.any()';
      }

      // Modifiers
      if (!attr.required && attr.type !== 'boolean') {
        // Booleans in Strapi usually have defaults, handled by Zod?
        // Actually, simplest to make everything optional unless strictly required
        // BUT for "Base Truth" JSONs, we might want strictness.
        // Let's use .optional() for everything that isn't explicitly required.
        validator += '.optional()';
      }

      // Handling Defaults?
      if (attr.default !== undefined) {
        // Basic defaults
        if (typeof attr.default === 'string') validator += `.default("${attr.default}")`;
        else if (typeof attr.default === 'number') validator += `.default(${attr.default})`;
        else if (typeof attr.default === 'boolean') validator += `.default(${attr.default})`;
      }

      return `${key}: ${validator}`;
    };

    const formatName = (uid: string) => {
      // game.casting-config -> GameCastingConfig
      return uid
        .split('.')
        .map((part) =>
          part
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join('')
        )
        .join('');
    };

    // Components Loop
    for (const [uid, schema] of Object.entries(components)) {
      const name = formatName(uid);
      output += `export const ${name}Schema = z.object({\n`;

      for (const [key, attr] of Object.entries(schema.attributes)) {
        output += `  ${generateAttributeStr(key, attr)},\n`;
      }

      output += `}).strict();\n\n`;
    }

    // 2. Generate Content Type Schemas (Atoms/Molecules)
    console.log(`Scanning Content Types...`);
    // Filter only our 'api::' types
    const apiTypes = Object.entries(contentTypes).filter(([uid]) => uid.startsWith('api::'));

    for (const [uid, schema] of apiTypes) {
      // api::spell.spell -> SpellSpell -> We probably just want 'Spell'
      // But let's be safe: ApiSpellSpellSchema to match generated strict types naming convention?
      // Helper: formatName('api::spell.spell') -> ApiSpellSpell
      // 'api::damage-type.damage-type' -> ApiDamageTypeDamageType
      // 'api::spell.spell' -> ApiSpellSpell

      // We can stick to a simpler naming if uniquely checkable?
      // Actually, let's use the standard PascalCase for the whole UID to avoid collisions

      const name = formatName(uid.replace('api::', 'api.')); // ApiSpellSpell

      output += `export const ${name}Schema = z.object({\n`;

      // Add 'id' or 'documentId'? Not for input JSONs usually, but 'slug' is key.
      // We iterate attributes
      for (const [key, attr] of Object.entries(schema.attributes)) {
        output += `  ${generateAttributeStr(key, attr)},\n`;
      }

      output += `}).strict();\n\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`âœ… Generated schemas at ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Generaton Failed:', error);
  } finally {
    strapi.stop();
  }
}

main();
