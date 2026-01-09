import fs from 'fs';
import path from 'path';

export interface SchemaDefinition {
  kind?: string;
  collectionName?: string;
  info: {
    displayName: string;
    singularName: string;
    pluralName: string;
    description?: string;
  };
  attributes: Record<
    string,
    {
      type: string;
      required?: boolean;
      target?: string;
      component?: string;
      repeatable?: boolean;
      [key: string]: unknown;
    }
  >;
  [key: string]: unknown;
}
export interface ContentTypeInfo {
  uid: string;
  apiName: string;
  kind: 'collectionType' | 'singleType';
  info: {
    displayName: string;
    singularName: string;
    pluralName: string;
    description?: string;
  };
}

/**
 * Scans the backend source code to find all available Content Types.
 * This looks into `src/api` to find `schema.json` files.
 *
 * Note: This is a static analysis of the file system to discover UIDs.
 * It assumes standard Strapi v5 folder structure: src/api/<apiName>/content-types/<contentTypeName>/schema.json
 */
export function discoverContentTypes(): ContentTypeInfo[] {
  const apiRoot = path.join(process.cwd(), 'src', 'api');
  const contentTypes: ContentTypeInfo[] = [];

  if (!fs.existsSync(apiRoot)) {
    console.warn(`[Schema] API root not found at ${apiRoot}`);
    return [];
  }

  const apiDirs = fs
    .readdirSync(apiRoot, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const apiName of apiDirs) {
    const contentTypesDir = path.join(apiRoot, apiName, 'content-types');
    if (!fs.existsSync(contentTypesDir)) continue;

    const contentTypeDirs = fs
      .readdirSync(contentTypesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const contentTypeName of contentTypeDirs) {
      const schemaPath = path.join(contentTypesDir, contentTypeName, 'schema.json');
      if (fs.existsSync(schemaPath)) {
        try {
          const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

          // Construct UID (standard convention)
          const uid = `api::${apiName}.${contentTypeName}`;

          contentTypes.push({
            uid,
            apiName,
            kind: schema.kind || 'collectionType',
            info: schema.info || { displayName: contentTypeName },
          });
        } catch (err) {
          console.warn(`[Schema] Failed to parse schema for ${apiName}/${contentTypeName}`, err);
        }
      }
    }
  }

  // Also add common plugins if needed, but for now focus on user APIs
  // To verify plugins like 'plugin::users-permissions.user', we'd need to check node_modules or rely on a hardcoded list.
  // Adding core Users explicitly as it's often needed.
  contentTypes.push({
    uid: 'plugin::users-permissions.user',
    apiName: 'user',
    kind: 'collectionType',
    info: {
      displayName: 'User',
      singularName: 'user',
      pluralName: 'users',
      description: 'System Users',
    },
  });

  contentTypes.push({
    uid: 'plugin::users-permissions.role',
    apiName: 'role',
    kind: 'collectionType',
    info: {
      displayName: 'Role',
      singularName: 'role',
      pluralName: 'roles',
      description: 'User Roles',
    },
  });

  return contentTypes.sort((a, b) => a.uid.localeCompare(b.uid));
}

/**
 * Reads the schema.json for a specific UID
 */
export function readSchema(uid: string): SchemaDefinition | null {
  const all = discoverContentTypes();
  const found = all.find((t) => t.uid === uid);

  if (!found) {
    // try direct path lookup if it looks like a standard api
    return null;
  }

  // We need to re-scan to find path because discover doesn't store path nicely yet?
  // Actually we can just reconstruct path from apiName and singularName or just do a quick scan map.
  // Let's refactor slightly to be more robust: re-use discover logic but just return the object.
  // Or, since discoverContentTypes is cheap (fs scan), we can just enhance it to return paths or read directly if we added paths to ContentTypeInfo.
  // For now, let's keep it simple:

  const apiRoot = path.join(process.cwd(), 'src', 'api');

  // Re-scanning is safer than guessing folder names from singular/plural which might differ
  // Let's just do a specialized find.

  if (uid.startsWith('plugin::')) {
    // Plugin schemas are in node_modules usually, hard to read source for them unless we look in node_modules
    // For now return null for plugins
    return null;
  }

  const parts = uid.replace('api::', '').split('.');
  const apiName = parts[0];
  const contentTypeName = parts[1];

  const schemaPath = path.join(apiRoot, apiName, 'content-types', contentTypeName, 'schema.json');

  if (fs.existsSync(schemaPath)) {
    return JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  }

  return null;
}

export function readAllSchemas(): Record<string, SchemaDefinition> {
  const all = discoverContentTypes();
  const result: Record<string, SchemaDefinition> = {};

  for (const type of all) {
    if (type.uid.startsWith('api::')) {
      const schema = readSchema(type.uid);
      if (schema) {
        result[type.uid] = schema;
      }
    }
  }
  return result;
}
