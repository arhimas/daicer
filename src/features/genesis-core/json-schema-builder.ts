
import { ISchemaLoader } from './schema-loader';
import zodToJsonSchema from 'zod-to-json-schema';
import { MonsterBlueprintSchema } from './data/schemas/monster-blueprint-schema';

export interface JsonSchema {
  type?: string;
  properties?: Record<string, any>;
  items?: any;
  required?: string[];
  enum?: any[];
  anyOf?: any[];
  description?: string;
  nullable?: boolean;
}

export class JsonSchemaBuilder {
  constructor(private loader: ISchemaLoader) {}

  async build(uid: string): Promise<any> {
    // Handle Custom Schema Identifiers
    if (uid === 'monster-blueprint') {
        const schema = zodToJsonSchema(MonsterBlueprintSchema as any, { target: 'jsonSchema7' });
        // zodToJsonSchema returns { $schema: ..., definitions: ..., ... }
        // We typically just want the schema part or need to handle definitions
        // Gemini 3 handles definitions well if structured correctly.
        return schema;
    }

    const rootSchema = await this.loader.loadSchema(uid);
    if (!rootSchema) throw new Error(`Schema not found: ${uid}`);

    // ... existing logic ...
    const properties = await this.processAttributes(rootSchema.attributes, 0);
    
    const required = Object.entries(rootSchema.attributes || {})
       // @ts-ignore
       .filter(([_, attr]: [string, any]) => attr.required === true)
       // @ts-ignore
       .map(([key, _]) => key);

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      description: rootSchema.info?.description || rootSchema.info?.displayName
    };
  }

  // ... copy existing private methods ...
  private async processAttributes(attributes: any, depth: number): Promise<Record<string, JsonSchema>> {
    const props: Record<string, JsonSchema> = {};
    const MAX_DEPTH = 5;

    if (depth > MAX_DEPTH) {
        return {}; // Stop recursion
    }

    if (!attributes) return {};

    for (const [key, attr] of Object.entries(attributes) as [string, any][]) {
      let propSchema: any = null;

      switch (attr.type) {
        case 'string':
        case 'text':
        case 'richtext':
        case 'email':
        case 'uid':
          propSchema = { type: 'string' };
          break;
        case 'integer':
        case 'biginteger':
          propSchema = { type: 'integer' };
          break;
        case 'decimal':
        case 'float':
        case 'number':
          propSchema = { type: 'number' };
          break;
        case 'boolean':
          propSchema = { type: 'boolean' };
          break;
        case 'enumeration':
          propSchema = { type: 'string', enum: attr.enum };
          break;
        case 'json':
          propSchema = { type: 'object' }; // Loose object, no checks
          break;
        case 'component':
          propSchema = await this.handleComponent(attr, depth);
          break;
        case 'dynamiczone':
          propSchema = await this.handleDynamicZone(attr, depth);
          break;
        case 'relation':
           propSchema = { type: 'array', items: { type: 'string', description: 'Target Entity UID' } };
           break;
        case 'media':
           propSchema = { type: 'string', description: 'Media URL' };
           break;
        case 'customField':
            // Simple fallback for custom fields
           propSchema = { type: 'string' };
           break; 
        default:
          propSchema = { type: 'string' };
      }

      if (propSchema) {
         props[key] = propSchema;
      }
    }

    return props;
  }

  private async handleComponent(attr: any, depth: number): Promise<JsonSchema> {
    const componentUid = attr.component;
    
    // Inlining
    try {
        const compSchema = await this.loader.loadSchema(componentUid);
        if (!compSchema) return { type: 'object' };

        const compProps = await this.processAttributes(compSchema.attributes, depth + 1);
        const required = Object.entries(compSchema.attributes || {})
            // @ts-ignore
            .filter(([_, a]: [string, any]) => a.required === true)
            // @ts-ignore
            .map(([k, _]) => k);

        const inlineSchema: JsonSchema = {
            type: 'object',
            properties: compProps,
            required: required.length > 0 ? required : undefined,
            description: compSchema.info?.displayName
        };

        if (attr.repeatable) {
            return { type: 'array', items: inlineSchema };
        }
        return inlineSchema;

    } catch (e) {
        console.warn(`Failed to load component schema ${componentUid}:`, e);
        return { type: 'object' };
    }
  }

  private async handleDynamicZone(attr: any, depth: number): Promise<JsonSchema> {
     const componentUids = attr.components || [];
     const options: any[] = [];

     for (const uid of componentUids) {
         try {
            const compSchema = await this.loader.loadSchema(uid);
            if (!compSchema) continue;

            const compProps = await this.processAttributes(compSchema.attributes, depth + 1);
            
            // Add __component
            compProps['__component'] = { type: 'string', enum: [uid] };
            
            const required = Object.entries(compSchema.attributes || {})
                // @ts-ignore
                .filter(([_, a]: [string, any]) => a.required === true)
                // @ts-ignore
                .map(([k, _]) => k);
            required.push('__component');

            options.push({
                type: 'object',
                properties: compProps,
                required,
                description: compSchema.info?.displayName
            });
         } catch (e) {
             console.warn(`Failed to load DZ component ${uid}`, e);
         }
     }

     return {
         type: 'array',
         items: {
             anyOf: options
         }
     };
  }
}
