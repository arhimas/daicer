import fs from 'fs';
import path from 'path';

export interface SchemaAttribute {
  type: string;
  required?: boolean;
  target?: string;
  component?: string;
  repeatable?: boolean;
  [key: string]: unknown;
  // Recursive helper types for deep reading
  __targetSchema?: SchemaDefinition;
  __schema?: SchemaDefinition;
}

export interface SchemaDefinition {
  kind?: string;
  collectionName?: string;
  info: {
    displayName: string;
    singularName: string;
    pluralName: string;
    description?: string;
  };
  attributes: Record<string, SchemaAttribute>;
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

/**
 * Reads a schema and recursively populates its relations and components up to a certain depth.
 */
export function readSchemaDeep(uid: string, depth: number = 2, seen: Set<string> = new Set()): SchemaDefinition | null {
  let schema = readSchema(uid);

  // If not found via standard API read, try component read
  if (!schema && !uid.startsWith('api::') && !uid.startsWith('plugin::')) {
    schema = readComponentSchema(uid);
  }

  if (!schema) return null;

  if (depth <= 0) return schema;
  if (seen.has(uid)) return schema;
  seen.add(uid);

  const newAttributes = { ...schema.attributes };

  for (const [, value] of Object.entries(newAttributes)) {
    // 1. Components
    if (value.type === 'component' && value.component) {
      const compUid = value.component as string;
      const compSchema = readSchemaDeep(compUid, depth - 1, new Set(seen));
      if (compSchema) {
         
        (value as any).__schema = compSchema;
      }
    }
    // 2. Relations
    else if (value.type === 'relation' && value.target) {
      const targetUid = value.target as string;
      if (!targetUid) continue;

      const relSchema = readSchemaDeep(targetUid, depth - 1, new Set(seen));
      if (relSchema) {
         
        (value as any).__targetSchema = relSchema;
      }
    }
  }

  schema.attributes = newAttributes;
  return schema;
}

function readComponentSchema(uid: string): SchemaDefinition | null {
  // uid format: category.name
  const parts = uid.split('.');
  if (parts.length < 2) return null;

  const category = parts[0];
  const name = parts[1];

  const compPath = path.join(process.cwd(), 'src', 'components', category, `${name}.json`);
  if (fs.existsSync(compPath)) {
    try {
      return JSON.parse(fs.readFileSync(compPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Builds a deep populate object for Strapi Entity Service / Client queries.
 * Depth 2 means: populate relations, and populate relations of relations.
 */
 
export function buildDeepPopulate(uid: string, depth: number = 2, seen: Set<string> = new Set()): any {
  if (depth <= 0) return true; // End of recursion
  // If seen, return true to stop recursion but still populate this level?
  // Actually if we've seen this UID in this branch, we should probably stop.
  // Ideally we'd use 'true' (populate all 1 level deep) or just omit?
  // Let's return true to be safe.
  if (seen.has(uid)) return true;

  // Read schema (deep read not needed, just readSchema to get attrs)
  const schema = readSchema(uid);
  // If no schema (e.g. unknown plugin), fallback to wildcard
  if (!schema && (uid.startsWith('api::') || uid.startsWith('plugin::'))) return '*';

  if (!schema) {
    // Try component
    const comp = readComponentSchema(uid);
    if (!comp) return '*';

    // Component logic
    seen.add(uid);
     
    const populate: any = {};

    Object.entries(comp.attributes).forEach(([key, value]) => {
      if (value.type === 'component') {
        populate[key] = {
          populate: buildDeepPopulate(value.component as string, depth - 1, new Set(seen)),
        };
      } else if (value.type === 'relation') {
        populate[key] = {
          populate: buildDeepPopulate(value.target as string, depth - 1, new Set(seen)),
        };
      } else if (value.type === 'media') {
        populate[key] = true;
      } else if (value.type === 'dynamiczone') {
        populate[key] = { populate: '*' };
      }
    });
    return populate;
  }

  seen.add(uid);
   
  const populate: any = {};

  Object.entries(schema.attributes).forEach(([key, value]) => {
    if (value.type === 'component') {
      populate[key] = {
        populate: buildDeepPopulate(value.component as string, depth - 1, new Set(seen)),
      };
    } else if (value.type === 'relation') {
      populate[key] = {
        populate: buildDeepPopulate(value.target as string, depth - 1, new Set(seen)),
      };
    } else if (value.type === 'media') {
      populate[key] = true;
    } else if (value.type === 'dynamiczone') {
      populate[key] = { populate: '*' };
    }
  });

  // If empty populate (no relations/components), return true or *
  if (Object.keys(populate).length === 0) return true;

  return populate;
}
