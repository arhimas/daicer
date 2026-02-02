import fs from 'fs';
import path from 'path';

const PROMPTS_FILE = path.join(__dirname, '../prompts.json');
const OUTPUT_FILE = path.join(__dirname, '../src/prompt-registry/index.ts');

const toPascalCase = (str: string) => 
  str.split(/[-_.]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

const mapType = (type: string): string => {
  if (type === 'string') return 'z.string()';
  if (type === 'string?') return 'z.string().optional()';
  if (type === 'number') return 'z.number()';
  if (type === 'number?') return 'z.number().optional()';
  if (type === 'boolean') return 'z.boolean()';
  return 'z.any()';
};

const generate = () => {
    const content = fs.readFileSync(PROMPTS_FILE, 'utf-8');
    const prompts = JSON.parse(content);

    let output = `import { z } from 'zod';\n\n`;

    // Keys Enum
    output += `export type PromptKey = \n`;
    prompts.forEach((p: any) => {
        output += `  | '${p.key}'\n`;
    });
    output += `;\n\n`;

    // Schemas
    output += `export const PromptSchemas = {\n`;
    prompts.forEach((p: any) => {
        output += `    '${p.key}': z.object({\n`;
        const vars = p.variables || {};
        for (const [key, type] of Object.entries(vars)) {
            output += `        ${key}: ${mapType(type as string)},\n`;
        }
        output += `    }),\n`;
    });
    output += `} as const;\n\n`;

    // Map Helper
    output += `export type PromptVariableMap = {\n`;
    output += `    [K in PromptKey]: z.infer<typeof PromptSchemas[K]>;\n`;
    output += `};\n\n`;
    
    // Runtime Keys
    output += `export const VALID_PROMPT_KEYS = Object.keys(PromptSchemas) as PromptKey[];\n`;

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Generated ${prompts.length} prompts in ${OUTPUT_FILE}`);
};

generate();
