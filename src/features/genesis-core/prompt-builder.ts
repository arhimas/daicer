import { JsonSchemaBuilder, JsonSchema } from './json-schema-builder';

export class PromptBuilder {
  constructor(private schemaBuilder: JsonSchemaBuilder) {}

  async buildPrompt(uid: string): Promise<{ systemPrompt: string; jsonSchema: JsonSchema }> {
    const jsonSchema = await this.schemaBuilder.build(uid);

    const systemPrompt = `
You are the Genesis Engine.
Your goal is to generate a valid JSON object for the Content Type: "${uid}".

## MANDATORY RULES
1. You must output a VALID JSON object.
2. You must strictly follow the provided JSON Schema structure.
3. Every field in "required" must be present.
4. Do not include any text outside the JSON object.
5. Use the "$defs" for recursive components as defined in the schema.
`;

    return { systemPrompt, jsonSchema };
  }
}
