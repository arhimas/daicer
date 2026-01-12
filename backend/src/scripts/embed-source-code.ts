
import { factories } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { embeddingService } from '../services/embedding-service';
import { getStrapi } from '../cli/utils/bootstrap';
import { codeIngestionService } from '../services/code-ingestion-service';

// Configuration
// We'll scan backend src, excluding node_modules, dist, etc.
const SOURCE_PATTERN = 'src/**/*.{ts,js}'; 
const IGNORE_PATTERNS = ['**/*.d.ts', '**/*.test.ts', '**/node_modules/**', '**/dist/**'];

async function embedSourceCode() {
  console.log('🚀 Starting Codebase Embedding...');
  
  // 1. Initialize Strapi (Headless)
  const strapi = await getStrapi();

  try {
    const cwd = process.cwd();
    const files = await glob(SOURCE_PATTERN, { cwd, ignore: IGNORE_PATTERNS });

    console.log(`Found ${files.length} source files.`);

    // 2. Find or Create Knowledge Source "Daicer Backend Source Code"
    const sourceName = 'Daicer Backend Source Code';
    let source = await strapi.entityService.findMany('api::knowledge-source.knowledge-source', {
      filters: { name: sourceName },
    });

    let sourceId;
    if (Array.isArray(source) && source.length > 0) {
      sourceId = source[0].id;
      console.log(`Found existing KnowledgeSource for codebase (ID: ${sourceId}).`);
    } else {
      const newSource = await strapi.entityService.create('api::knowledge-source.knowledge-source', {
        data: {
          name: sourceName,
          content: 'Auto-generated Knowledge Source for Backend Code.',
          origin: 'manual', // or a new 'code' type if we added it to Source enum too, but Snippet has 'source-code'
        },
      });
      sourceId = newSource.id;
      console.log('Created new KnowledgeSource for codebase.');
    }

    // 3. Process each file
    let updatedCount = 0;
    


    for (const file of files) {
      const absolutePath = path.join(cwd, file);
      const relativePath = path.relative(cwd, absolutePath);
      
      // Use Service for validation logic
      if (!codeIngestionService.isValidFile(relativePath)) continue;

      const content = fs.readFileSync(absolutePath, 'utf-8');

      console.log(`Processing ${relativePath}...`);
       
       // Use Service for data generation
       const snippetData = codeIngestionService.generateSnippetData(relativePath, content);
       if (!snippetData) continue; // Skipped (empty/tiny)

       const vector = await embeddingService.generateEmbedding(snippetData.embeddingText);
       
       const existingSnippet = await strapi.db.query('api::knowledge-snippet.knowledge-snippet').findOne({
         where: { title: snippetData.title, source: sourceId },
       });

       if (existingSnippet) {
         // Update
         await strapi.entityService.update('api::knowledge-snippet.knowledge-snippet', existingSnippet.id, {
           data: {
             content: snippetData.content,
             embedding: vector,
             sourceType: snippetData.sourceType,
             publishedAt: new Date(),
           },
         });
         console.log(`Updated '${snippetData.title}'`);
       } else {
         // Create
         await strapi.entityService.create('api::knowledge-snippet.knowledge-snippet', {
           data: {
             title: snippetData.title,
             content: snippetData.content,
             source: sourceId,
             embedding: vector,
             sourceType: snippetData.sourceType,
             publishedAt: new Date(),
           },
         });
         console.log(`Created '${snippetData.title}'`);
       }
       
       updatedCount++;
       if (updatedCount % 10 === 0) process.stdout.write('.');
    }

    console.log(`\n✅ Codebase embedding complete. Processed ${updatedCount} files.`);

  } catch (error) {
    console.error('Codebase embedding failed:', error);
    process.exit(1);
  } finally {
    strapi.stop();
  }
}

embedSourceCode();
