export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { EmbeddingService } from '../services/embedding-service';

async function main() {
  console.log('\n💻 \x1b[1m\x1b[36mStarting Codebase Ingestion...\x1b[0m\n');

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

    // 1. Create/Find "System Codebase" Knowledge Source
    let codeSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).findFirst({
      filters: { name: 'System Codebase' },
    });

    if (!codeSource) {
      console.log('Creating "System Codebase" Source...');
      codeSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).create({
        data: {
          name: 'System Codebase',
          content: 'Auto-ingested source code files from the repository.',
          origin: 'manual', // Technically manual override of automatic data? Or system?
          tags: ['system', 'code'],
        },
      });
    }

    // 2. Find Source Files
    // Focus on high-value directories to avoid noise
    const includePatterns = [
        'src/api/**/controllers/*.ts',
        'src/api/**/services/*.ts',
        'src/api/**/routes/*.ts',
        'src/services/*.ts',
        'src/scripts/*.ts',
        'src/cli/**/*.ts',
        'src/policies/*.ts',
        'src/middlewares/*.ts',
    ];
    
    // Flatten glob results
    let files: string[] = [];
    for (const pattern of includePatterns) {
        const matches = await glob(pattern, { cwd: backendRoot });
        files = files.concat(matches);
    }
    
    // Deduplicate
    files = [...new Set(files)];
    
    // Filter exclusions
    files = files.filter(f => !f.endsWith('.d.ts') && !f.includes('.test.'));

    console.log(`Found ${files.length} source files to ingest.`);

    // 3. Process Files
    let count = 0;
    for (const file of files) {
      const absPath = path.join(backendRoot, file);
      const content = fs.readFileSync(absPath, 'utf-8');
      
      // Skip trivial files
      if (content.length < 50) continue;

      const relativePath = file;
      
      console.log(`Processing ${relativePath}...`);

      // Generate Embedding
      // Context: "Source Code File: [Path]. Content: ..."
      // Wrap content in markdown block for better readability in simple views, 
      // but for embedding we might want raw text. 
      // EmbeddingService usually handles text.
      
      const embedText = `Source Code File: ${relativePath}\n\n\`\`\`typescript\n${content.substring(0, 8000)}\n\`\`\``; 
      
      const vector = await embeddingService.generateEmbedding(embedText);

      // Upsert Snippet
      const existing = await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).findFirst({
        filters: { 
            title: relativePath,
            sourceType: 'source-code'
        }
      });
      
      const finalContent = `\`\`\`typescript\n${content}\n\`\`\``;

      if (existing) {
        await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).update({
           documentId: existing.documentId,
           data: {
               content: finalContent,
               embedding: vector,
               source: codeSource.documentId
           } as any
        });
      } else {
        await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).create({
            data: {
                title: relativePath,
                content: finalContent,
                embedding: vector,
                sourceType: 'source-code',
                source: codeSource.documentId
            } as any
        });
      }
      count++;
    }

    console.log(`\n✅ \x1b[32mCodebase Ingestion Complete! Processed ${count} files.\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
