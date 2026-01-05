import fs from 'fs';
import path from 'path';

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
