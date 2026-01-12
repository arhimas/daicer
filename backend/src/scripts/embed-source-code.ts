
import { factories } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { embeddingService } from '../services/embedding-service';
import bootstrap from '../cli/utils/bootstrap';

// Configuration
// We'll scan backend src, excluding node_modules, dist, etc.
const SOURCE_PATTERN = 'src/**/*.{ts,js}'; 
const IGNORE_PATTERNS = ['**/*.d.ts', '**/*.test.ts', '**/node_modules/**', '**/dist/**'];

async function embedSourceCode() {
  console.log('🚀 Starting Codebase Embedding...');
  
  // 1. Initialize Strapi (Headless)
  const strapi = await bootstrap();

  try {
    const cwd = process.cwd();
    const files = await glob(SOURCE_PATTERN, { cwd, ignore: IGNORE_PATTERNS });

    console.log(`Found ${files.length} source files.`);

    // 2. Ensure "Source Code" KnowledgeSource exists
    let sourceRecord = await strapi.db.query('api::knowledge-source.knowledge-source').findOne({
      where: { title: 'Daicer Backend Source Code' },
    });

    if (!sourceRecord) {
      sourceRecord = await strapi.entityService.create('api::knowledge-source.knowledge-source', {
        data: {
          title: 'Daicer Backend Source Code',
          type: 'codebase',
          description: 'Automated ingestion of backend source code.',
          // Assuming 'content' or other required fields?
        },
      });
      console.log('Created new KnowledgeSource for codebase.');
    }

    // 3. Process each file
    let updatedCount = 0;
    
    // We can filter by arguments (e.g., git diff output passed as args) to optimize
    const targetFiles = process.argv.slice(2);
    const filesToProcess = targetFiles.length > 0 ? targetFiles.filter(f => files.includes(f)) : files;

    if (targetFiles.length > 0) {
      console.log(`Targeting ${filesToProcess.length} specific files from arguments...`);
    }

    for (const filePath of filesToProcess) {
       const fullPath = path.join(cwd, filePath);
       const content = fs.readFileSync(fullPath, 'utf8');
       
       // Skip empty or tiny files
       if (content.length < 50) continue;

       const snippetTitle = `Code: ${filePath}`;
       
       // Check if snippet exists
       const existingSnippet = await strapi.db.query('api::knowledge-snippet.knowledge-snippet').findOne({
         where: { title: snippetTitle, source: sourceRecord.id },
       });

       // Logic: Only update if content changed? 
       // We can check hash or just overwrite. For simplicity in this v1, we overwrite/create.
       // Embedding generation is somewhat expensive (CPU), so might want to skip if no change.
       // But we don't have previous content hash easily unless we store it.
       // Strapi updated_at might help if we checked file mtime vs snippet updated_at?
       // Let's just re-embed for now.
       
       const embeddingText = `File: ${filePath}\n\n${content}`;
       // Truncate to avoid context limit if file is HUGE? 
       // Jina V2 is 8k tokens. 
       // Average 4 chars/token -> 32k chars.
       // If content > 30k chars, we might truncate or chunk.
       
       const safeContent = content.length > 30000 ? content.substring(0, 30000) + '\n...[Truncated]' : content;
       const vector = await embeddingService.generateEmbedding(`File: ${filePath}\n${safeContent}`);
       
       if (existingSnippet) {
         await strapi.entityService.update('api::knowledge-snippet.knowledge-snippet', existingSnippet.id, {
           data: {
             content: `\`\`\`typescript\n${safeContent}\n\`\`\``,
             embedding: vector,
           },
         });
         // console.log(`Updated: ${filePath}`);
       } else {
         await strapi.entityService.create('api::knowledge-snippet.knowledge-snippet', {
           data: {
             title: snippetTitle,
             content: `\`\`\`typescript\n${safeContent}\n\`\`\``,
             source: sourceRecord.id,
             embedding: vector,
           },
         });
         console.log(`Created: ${filePath}`);
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
