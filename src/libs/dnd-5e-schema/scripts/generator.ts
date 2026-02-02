import fs from 'fs';
import path from 'path';

const SCHEMAS_DIR = path.join(__dirname, '../schemas');
const OUTPUT_FILE = path.join(__dirname, '../src/generated.ts');

const toPascalCase = (str: string) =>
  str
    .split(/[-_.]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapType = (attr: any): string => {
  if (attr.type === 'string' || attr.type === 'text' || attr.type === 'uid' || attr.type === 'richtext')
    return 'z.string()';
  if (attr.type === 'integer') return 'z.number().int()';
  if (attr.type === 'float' || attr.type === 'decimal') return 'z.number()';
  if (attr.type === 'boolean') return 'z.boolean()';
  if (attr.type === 'enumeration') {
    const values = attr.enum.map((v: string) => `"${v}"`).join(', ');
    return `z.enum([${values}])`;
  }
  if (attr.type === 'component') {
    const targetName = attr.component.split('.')[1]; // game.damage-instance -> damage-instance
    const schemaName = toPascalCase(targetName) + 'Schema';
    let code = `z.lazy(() => ${schemaName})`;
    if (attr.repeatable) code = `z.array(${code})`;
    return code;
  }

  return 'z.unknown()'; // Fallback for relations/media which are complex
};

const generate = () => {
  const files = fs.readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith('.json'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components: any[] = [];
  const componentMap: Record<string, string> = {}; // game.action -> ActionSchema

  // Pass 1: Read all and map names
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(SCHEMAS_DIR, file), 'utf-8');
    const json = JSON.parse(content);
    const name = file.replace('.json', '');
    const schemaName = toPascalCase(name) + 'Schema';
    const typeName = toPascalCase(name);

    components.push({ name, schemaName, typeName, json });
    // Assuming strict "game." prefix for now based on files
    componentMap[`game.${name}`] = schemaName;
  });

  let output = `import { z } from 'zod';\n\n`;

  // Pass 2: Generate Schemas
  components.forEach(({ schemaName, json }) => {
    output += `export const ${schemaName} = z.object({\n`;

    const attributes = json.attributes || {};
    for (const [key, attr] of Object.entries(attributes)) {
      const zodType = mapType(attr);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRequired = (attr as any).required === true;
      // Make optional if not explicitly required
      const suffix = isRequired ? '' : '.optional()';
      output += `  ${key}: ${zodType}${suffix},\n`;
    }

    output += `});\n\n`;
  });

  // Pass 3: Generate Types
  components.forEach(({ typeName, schemaName }) => {
    output += `export type ${typeName} = z.infer<typeof ${schemaName}>;\n`;
  });

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${files.length} schemas in ${OUTPUT_FILE}`);
};

generate();
