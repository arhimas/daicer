/* eslint-disable */
import fs from 'fs';
import path from 'path';

export interface ISchemaLoader {
  loadSchema(uid: string): Promise<any>;
  listSchemas(filter?: string): Promise<string[]>;
}

export class SchemaLoader implements ISchemaLoader {
  private schemaDir: string;

  constructor(schemaDir?: string) {
    this.schemaDir = schemaDir || path.join(process.cwd(), 'schema');
  }

  async loadSchema(uid: string): Promise<any> {
    // Convert UID to filename format: api::spell.spell -> spell-spell.json
    // plugin::users-permissions.user -> plugin-users-permissions-user.json
    // game.action -> component-game-action.json

    let filename = '';
    if (uid.startsWith('api::')) {
      filename = uid.replace('api::', '').replace(/\./g, '-') + '.json';
    } else if (uid.startsWith('plugin::')) {
      filename = uid.replace('plugin::', 'plugin-').replace(/\./g, '-') + '.json';
    } else {
      // Assume component
      filename = 'component-' + uid.replace(/\./g, '-') + '.json';
    }

    const filePath = path.join(this.schemaDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Schema file not found for UID: ${uid} (Expected: ${filePath})`);
    }

    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error: any) {
      throw new Error(`Failed to parse schema file for ${uid}: ${error.message}`);
    }
  }

  async listSchemas(filter?: string): Promise<string[]> {
    if (!fs.existsSync(this.schemaDir)) {
      return [];
    }

    const files = await fs.promises.readdir(this.schemaDir);
    let schemas = files.filter((f) => f.endsWith('.json') && !f.startsWith('_'));

    if (filter) {
      schemas = schemas.filter((f) => f.includes(filter));
    }

    return schemas;
  }
}
