export {};
import dotenv from 'dotenv';
import path from 'path';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { EmbeddingService } from '../services/embedding-service';

// Main Execution
async function main() {
  console.log('\n📐 \x1b[1m\x1b[36mStarting Schema Ingestion...\x1b[0m\n');

  // HACK: Fix CWD for Strapi auto-loader
  const backendRoot = path.resolve(__dirname, '../..');
  process.chdir(backendRoot);

  // Initialize Strapi
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({
    appDir: backendRoot,
    distDir: 'dist',
  }).load();

  try {
    const embeddingService = new EmbeddingService();
    
    // 1. Create/Find "System Schemas" Knowledge Source
    let schemaSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).findFirst({
      filters: { name: 'System Schemas' },
    });

    if (!schemaSource) {
      console.log('Creating "System Schemas" Source...');
      schemaSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).create({
        data: {
          name: 'System Schemas',
          content: 'Auto-generated schema definitions from Strapi Content Types and Components.',
          origin: 'manual',
          tags: ['system', 'schema'],
        },
      });
    }

    // 2. Collect Schemas
    const schemas: any[] = [];
    
    // Content Types
    Object.values(strapi.contentTypes).forEach((ct: any) => {
      if (ct.uid.startsWith('api::') || ct.uid.startsWith('plugin::users-permissions')) {
         schemas.push({ kind: 'contentType', uid: ct.uid, schema: ct });
      }
    });

    // Components
    Object.values(strapi.components).forEach((cmp: any) => {
        schemas.push({ kind: 'component', uid: cmp.uid, schema: cmp });
    });

    console.log(`Found ${schemas.length} schemas to ingest.`);

    // 3. Process Each Schema
    for (const item of schemas) {
      const { uid, schema, kind } = item;
      const friendlyName = schema.info.displayName || uid;
      
      console.log(`Processing ${uid}...`);

      // Generate Markdown Representation
      let md = `# Schema: ${friendlyName} (${uid})\n\n`;
      md += `**Kind**: ${kind}\n`;
      md += `**Description**: ${schema.info.description || 'No description'}\n\n`;
      
      md += `## Attributes\n`;
      md += `| Name | Type | Details |\n`;
      md += `|------|------|---------|\n`;

      for (const [key, attr] of Object.entries(schema.attributes) as [string, any][]) {
         let details = '';
         if (attr.type === 'relation') {
            details = `Relation: ${attr.relation} -> ${attr.target}`;
         } else if (attr.type === 'component') {
            details = `Component: ${attr.component} (Repeatable: ${attr.repeatable})`;
            
            // 1-Level Depth Expansion
            const compDef = strapi.components[attr.component];
            if (compDef) {
                details += `<br><ul>`;
                for (const [cKey, cAttr] of Object.entries(compDef.attributes) as [string, any][]) {
                    details += `<li>${cKey}: ${cAttr.type}</li>`;
                }
                details += `</ul>`;
            }
         } else if (attr.type === 'enumeration') {
            details = `Enum: ${attr.enum.join(', ')}`;
         } else {
             // General constraints
             const constraints = [];
             if (attr.required) constraints.push('required');
             if (attr.unique) constraints.push('unique');
             if (attr.default !== undefined) constraints.push(`default: ${attr.default}`);
             details = constraints.length > 0 ? `(${constraints.join(', ')})` : '-';
         }

         md += `| \`${key}\` | ${attr.type} | ${details} |\n`;
      }

      // Generate Embedding
      // Format text for embedding: "Schema for [Name]. Fields: [List...]"
      const fieldNames = Object.keys(schema.attributes).join(', ');
      const embedText = `Schema Definition for ${friendlyName} (${uid}). Type: ${kind}. Fields: ${fieldNames}.\n${md}`;

      const vector = await embeddingService.generateEmbedding(embedText);

      // Check if snippet exists
      const existing = await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).findFirst({
        filters: { 
            title: `Schema: ${friendlyName}`,
            source: {
              documentId: schemaSource.documentId
            } 
        }
      });

      if (existing) {
         // Update
         await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).update({
            documentId: existing.documentId,
            data: {
                content: md,
                embedding: vector,
                sourceType: 'schema'
            } as any
         });
      } else {
         // Create
         await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).create({
            data: {
                title: `Schema: ${friendlyName}`,
                content: md,
                embedding: vector,
                sourceType: 'schema',
                source: schemaSource.documentId // Link to source
            } as any
         });
      }
      console.log(`✅ Processed ${uid}`);
    }

    const snippetCount = await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).count({
        filters: { sourceType: 'schema' }
    });
    console.log(`\n✅ \x1b[32mSchema Ingestion Complete! Total DB Snippets: ${snippetCount}\x1b[0m\n`);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    // Shutdown
    await strapi.destroy();
    
    // Force exit to kill workers if any
    process.exit(0);
  }
}

main();
