export {};
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { EmbeddingService } from '../services/embedding-service';

async function main() {
  console.log('\n📚 \x1b[1m\x1b[36mStarting Manuals Ingestion...\x1b[0m\n');

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

    // 1. Create/Find "System Manuals" Knowledge Source
    let manualSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).findFirst({
      filters: { name: 'System Manuals' },
    });

    if (!manualSource) {
      console.log('Creating "System Manuals" Source...');
      manualSource = await strapi.documents('api::knowledge-source.knowledge-source' as any).create({
        data: {
          name: 'System Manuals',
          content: 'Auto-ingested documentation and README files from the repository.',
          origin: 'manual',
          tags: ['system', 'documentation'],
        },
      });
    }

    // 2. Find Markdown Files
    // Exclude node_modules, .git, dist, .cache, .tmp, build
    const pattern = '**/*.md';
    const ignore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/.cache/**',
      '**/.tmp/**',
      '**/build/**',
      '**/public/**',
      '**/.agent/**' // Ignore agent artifacts to avoid recursion pollution
    ];

    const files = await glob(pattern, { cwd: backendRoot, ignore });
    console.log(`Found ${files.length} markdown files to ingest.`);

    // 3. Process Files
    let count = 0;
    for (const file of files) {
      const absPath = path.join(backendRoot, file);
      const content = fs.readFileSync(absPath, 'utf-8');
      
      // Skip empty or trivial files
      if (content.length < 50) continue;

      const relativePath = file;
      const _fileName = path.basename(file);
      
      console.log(`Processing ${relativePath}...`);

      // Generate Embedding
      // Context: "Documentation File: [Path]. Content: ..."
      const embedText = `Documentation File: ${relativePath}\n\n${content.substring(0, 8000)}`; // Truncate for embedding generation if too huge
      
      const vector = await embeddingService.generateEmbedding(embedText);

      // Upsert Snippet
      const existing = await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).findFirst({
        filters: { 
            title: relativePath,
            sourceType: 'manual'
        }
      });

      if (existing) {
        await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).update({
           documentId: existing.documentId,
           data: {
               content: content,
               embedding: vector,
               source: manualSource.documentId
           } as any
        });
      } else {
        await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).create({
            data: {
                title: relativePath,
                content: content,
                embedding: vector,
                sourceType: 'manual',
                source: manualSource.documentId
            } as any
        });
      }
      count++;
    }

    console.log(`\n✅ \x1b[32mManuals Ingestion Complete! Processed ${count} files.\x1b[0m\n`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

main();
