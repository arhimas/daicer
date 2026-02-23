/* eslint-disable */

import fs from 'fs';
import path from 'path';
import { discoverContentTypes, ContentTypeInfo } from '../src/cli/utils/schema';

// --- Types ---
interface SchemaAttribute {
  type: string;
  [key: string]: any;
}

interface SchemaDefinition {
  attributes: Record<string, SchemaAttribute>;
  [key: string]: any;
}

// --- Caches ---
const schemaCache = new Map<string, SchemaDefinition>();
const componentCache = new Map<string, SchemaDefinition>();

// --- Helpers ---

function loadAllContentTypes() {
  console.log("Loading all content types...");
  const types = discoverContentTypes();
  const apiRoot = path.join(process.cwd(), 'src', 'api');

  for (const type of types) {
      if (type.uid.startsWith('api::')) {
          const parts = type.uid.replace('api::', '').split('.');
          const apiName = parts[0];
          const contentTypeName = parts[1];
          const schemaPath = path.join(apiRoot, apiName, 'content-types', contentTypeName, 'schema.json');
          if (fs.existsSync(schemaPath)) {
              try {
                  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
                  schemaCache.set(type.uid, schema);
              } catch (e) {
                  console.warn(`Failed to parse ${type.uid}`, e);
              }
          }
      }
  }
  return types;
}

function loadAllComponents() {
  console.log("Loading all components...");
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const components: string[] = [];

  if (!fs.existsSync(componentsDir)) return [];

  try {
    const categories = fs.readdirSync(componentsDir).filter(f => {
        try {
            return fs.statSync(path.join(componentsDir, f)).isDirectory();
        } catch { return false; }
    });

    for (const category of categories) {
        const dir = path.join(componentsDir, category);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        for (const file of files) {
           const name = file.replace('.json', '');
           const uid = `${category}.${name}`;
           components.push(uid);
           
           try {
               const schema = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
               componentCache.set(uid, schema);
           } catch (e) {
               console.warn(`Failed to parse component ${uid}`, e);
           }
        }
    }
  } catch (e) {
      console.warn("Error exploring components dir:", e);
  }
  return components;
}

function getCachedSchema(uid: string): SchemaDefinition | undefined {
    if (uid.startsWith('api::') || uid.startsWith('plugin::')) {
        return schemaCache.get(uid);
    }
    return componentCache.get(uid);
}


/**
 * Smart Deep Reader
 * - First time seeing a UID in this traversal: Expand it.
 * - Second time: Reference it ($ref).
 * - Depth limit: High (50) just to prevent stack overflow in pathological cases, but recursion check usually catches it.
 */
function readSchemaSmart(uid: string, seenForThisFile: Set<string>, depth: number = 50): any {
  // If we have ALREADY fully defined this UID in this file's output structure (ancestor), we simple ref it.
  // Wait, `seenForThisFile` tracks ANCESTORS in the recursion stack to prevent loops.
  // AND it tracks things we've already outputted?
  //
  // Standard JSON schema / recursive expansion pattern:
  // If we are currently visiting X, and we see X again -> Cycle.
  // If we visited X earlier in a sibling branch...
  // User wants "no redundancy".
  // If Item A has prop B and prop C. Both B and C use Component D.
  // Should Component D be expanded twice?
  // User: "never redundant at all".
  // So NO. Use $ref for the second occurrence.
  // So `seenForThisFile` should accumulate across the whole traversal of this file.
  
  if (seenForThisFile.has(uid)) {
      return { $ref: uid };
  }
  
  if (depth <= 0) return { $ref: uid, _stop: 'depth_limit' };

  let schema = getCachedSchema(uid);

  if (!schema) {
      if (uid.startsWith('admin::') || uid.startsWith('strapi::')) return { $ref: uid, _type: 'system' };
      return { $ref: uid, _warning: 'schema_not_found_or_external' };
  }

  // MARK AS SEEN *BEFORE* RECURSING
  // This ensures self-reference or child-reference sees it as "done".
  seenForThisFile.add(uid);

  const attributes: Record<string, any> = {};

  if (schema.attributes) {
      for (const [key, value] of Object.entries(schema.attributes)) {
          const attr = value as any;
          
          if (attr.type === 'component' && attr.component) {
              attributes[key] = {
                  ...attr,
                  __schema: readSchemaSmart(attr.component, seenForThisFile, depth - 1)
              };
          } else if (attr.type === 'relation' && attr.target) {
             // For relations, we expand mostly structure not data.
             // But if we have huge entity graphs, maybe we shouldn't expand relations too deeply?
             // User wants "schemas nested one in others".
             // We expand relations. The 'seen' set protects us from blowing up.
            attributes[key] = {
                ...attr,
                __targetSchema: readSchemaSmart(attr.target, seenForThisFile, depth - 1)
            };
          } else if (attr.type === 'dynamiczone' && attr.components) {
              const components = (attr.components as string[]).map(c => ({
                  uid: c,
                  __schema: readSchemaSmart(c, seenForThisFile, depth - 1)
              }));
              attributes[key] = {
                  ...attr,
                  __components: components
              };
          } else {
              attributes[key] = attr;
          }
      }
  }

  return {
      uid,
      ...schema,
      attributes
  };
}

async function main() {
   const contentTypes = loadAllContentTypes(); // types with kind info
   const componentList = loadAllComponents();

   const schemaDir = path.join(process.cwd(), 'schema');
   if (!fs.existsSync(schemaDir)) {
       fs.mkdirSync(schemaDir);
   }

   console.log(`Generating separate schema files in ${schemaDir}...`);

   // 1. Generate API Schemas
   for(const ct of contentTypes) {
       // Reset seen for each file so each file is standalone but internally non-redundant
       const seen = new Set<string>();
       const schema = readSchemaSmart(ct.uid, seen);
       
       let filename = ct.uid.replace('api::', '').replace(/\./g, '-');
       if (ct.uid.startsWith('plugin::')) {
           filename = ct.uid.replace('plugin::', 'plugin-').replace(/\./g, '-');
       }
       
       fs.writeFileSync(path.join(schemaDir, `${filename}.json`), JSON.stringify(schema, null, 2));
   }
   
   // 2. Generate Component Schemas (Grouped by Category or Individual)
   // User "spells acitons entities terraom amd sp pm shpil;d hjave ts own files"
   // Components are often building blocks. Let's output them individually? 
   // Or maybe "component-game-position.json"?
   // Let's do `component-[fullname].json`
   
   for(const comp of componentList) {
       const seen = new Set<string>();
       const schema = readSchemaSmart(comp, seen);
       const filename = `component-${comp.replace(/\./g, '-')}.json`;
       fs.writeFileSync(path.join(schemaDir, filename), JSON.stringify(schema, null, 2));
   }
   
   // Keep the list files in root? Or move to schema/? 
   // User: "schema folder at root of the directory" for schemas.
   // Lists are useful meta-data. Let's keep them in schema/ too alongside for completeness.
   fs.writeFileSync(path.join(schemaDir, '_entity-list.json'), JSON.stringify(contentTypes.map(c => c.uid), null, 2));
   fs.writeFileSync(path.join(schemaDir, '_component-list.json'), JSON.stringify(componentList, null, 2));

   console.log(`Done. Generated ${contentTypes.length} Entity files and ${componentList.length} Component files in schema/`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
