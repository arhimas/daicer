import { ISchemaLoader } from './schema-loader';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class DryRunService {
  constructor(private loader: ISchemaLoader) {}

  async validate(data: any, uid: string): Promise<ValidationResult> {
    const errors: string[] = [];
    try {
      const schema = await this.loader.loadSchema(uid);
      if (!schema) {
        return { valid: false, errors: [`Schema not found for UID: ${uid}`] };
      }

      await this.validateNode(data, schema, uid, errors);
      
    } catch (e: any) {
      errors.push(`Validation crashed: ${e.message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async validateNode(data: any, schema: any, path: string, errors: string[]) {
    if (data === null || data === undefined) {
         // Check if required? Top level usually required if passed
         return;
    }

    const attributes = schema.attributes || {};
    
    for (const [key, attr] of Object.entries(attributes) as [string, any][]) {
        const value = data[key];
        const fieldPath = `${path}.${key}`;

        // Required Check
        if (attr.required && (value === undefined || value === null || value === '')) {
            errors.push(`Missing required field: ${fieldPath}`);
            continue;
        }

        if (value === undefined || value === null) continue;

        // Type Check
        switch (attr.type) {
            case 'string':
            case 'text':
            case 'richtext':
            case 'uid':
            case 'email':
                if (typeof value !== 'string') {
                    errors.push(`Invalid type for ${fieldPath}: Expected string, got ${typeof value}`);
                }
                break;
            case 'integer':
            case 'biginteger':
                 if (!Number.isInteger(value)) {
                    errors.push(`Invalid type for ${fieldPath}: Expected integer, got ${value}`);
                 }
                 if (attr.min !== undefined && value < attr.min) {
                     errors.push(`Value too small for ${fieldPath}: got ${value}, min ${attr.min}`);
                 }
                 if (attr.max !== undefined && value > attr.max) {
                     errors.push(`Value too large for ${fieldPath}: got ${value}, max ${attr.max}`);
                 }
                 break;
            case 'decimal':
            case 'float':
                if (typeof value !== 'number') {
                     errors.push(`Invalid type for ${fieldPath}: Expected number, got ${typeof value}`);
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`Invalid type for ${fieldPath}: Expected boolean, got ${typeof value}`);
                }
                break;
            case 'enumeration':
                if (!attr.enum.includes(value)) {
                    errors.push(`Invalid enum value for ${fieldPath}: got '${value}', expected one of [${attr.enum.join(', ')}]`);
                }
                break;
            case 'component':
                // Check repeatable
                if (attr.repeatable) {
                    if (!Array.isArray(value)) {
                        errors.push(`Invalid type for ${fieldPath}: Expected array, got ${typeof value}`);
                        continue;
                    }
                    for (let i = 0; i < value.length; i++) {
                        await this.validateComponent(value[i], attr.component, `${fieldPath}[${i}]`, errors, attr.__schema);
                    }
                } else {
                    if (typeof value !== 'object' || Array.isArray(value)) {
                         errors.push(`Invalid type for ${fieldPath}: Expected object, got ${typeof value}`);
                         continue;
                    }
                    await this.validateComponent(value, attr.component, fieldPath, errors, attr.__schema);
                }
                break;
             case 'dynamiczone':
                if (!Array.isArray(value)) {
                     errors.push(`Invalid type for ${fieldPath}: Expected array (dynamic zone), got ${typeof value}`);
                     continue;
                }
                for (let i = 0; i < value.length; i++) {
                    const componentData = value[i];
                    if (!componentData.__component) {
                         errors.push(`Missing __component field in dynamic zone item at ${fieldPath}[${i}]`);
                         continue;
                    }
                     // Load component schema on the fly
                     try {
                        const componentSchema = await this.loader.loadSchema(componentData.__component);
                        await this.validateNode(componentData, componentSchema, `${fieldPath}[${i}]`, errors);
                     } catch (e) {
                         errors.push(`Failed to load schema for dynamic zone component '${componentData.__component}' at ${fieldPath}[${i}]`);
                     }
                }
                break;
        }
    }
  }

  private async validateComponent(data: any, componentUid: string, path: string, errors: string[], embeddedSchema?: any) {
      let schema = embeddedSchema;
      if (!schema) {
          try {
              schema = await this.loader.loadSchema(componentUid);
          } catch (e) {
              errors.push(`Failed to load component schema '${componentUid}' for ${path}`);
              return;
          }
      }
      await this.validateNode(data, schema, path, errors);
  }
}
