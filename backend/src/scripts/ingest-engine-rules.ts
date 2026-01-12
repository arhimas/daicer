import { Project } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { embeddingService } from '../services/embedding-service';

// We need to bootstrap Strapi to use the ORM and Services
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Strapi = require('@strapi/strapi');

async function ingestRules() {
  // Ensure NODE_ENV is set
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

  const app = await Strapi.createStrapi({
    appDir: process.cwd(),
    distDir: 'dist',
  }).load();

  // Access embedding service through Strapi content if needed, or use the direct import if it acts as a utility.
  // The direct import is fine if it doesn't depend on `strapi` global being set before it's imported.
  // If it does, we might need to rely on `strapi.services` or ensures it works.
  // Our embedding-service seems to be a standalone export 'embeddingService'.

  console.log('🔍 Starting AST Ingestion of Engine Rules...');

  const project = new Project({
    tsConfigFilePath: path.join(__dirname, '../../tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  const ruleFilesGlob = path.join(__dirname, '../api/game/src/engine/rules/**/*.ts');
  project.addSourceFilesAtPaths(ruleFilesGlob);

  const knowledgeBlocks: Array<{ title: string; content: string; source: string }> = [];

  const sourceFiles = project.getSourceFiles();
  console.log(`📂 Found ${sourceFiles.length} rule files.`);

  for (const sourceFile of sourceFiles) {
    const fileName = sourceFile.getBaseName();

    // 1. Process Functions
    const functions = sourceFile.getFunctions();
    for (const func of functions) {
      if (!func.isExported()) continue;

      const name = func.getName();
      const jsDoc = func
        .getJsDocs()
        .map((doc) => doc.getDescription())
        .join('\n');
      const signature = func.getSignature().getDeclaration().getText();

      if (jsDoc || name) {
        knowledgeBlocks.push({
          title: `Rule: ${name} (${fileName})`,
          content: `File: ${fileName}\nFunction: ${name}\n\nDescription:\n${jsDoc}\n\nSignature:\n${signature}`,
          source: fileName,
        });
      }
    }

    // 2. Process Classes
    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      if (!cls.isExported()) continue;
      const name = cls.getName();
      const jsDoc = cls
        .getJsDocs()
        .map((doc) => doc.getDescription())
        .join('\n');

      knowledgeBlocks.push({
        title: `System: ${name} (${fileName})`,
        content: `Class: ${name}\nDescription: ${jsDoc}\n\nMethods: ${cls
          .getMethods()
          .map((m) => m.getName())
          .join(', ')}`,
        source: fileName,
      });
    }
  }

  console.log(`✅ Generated ${knowledgeBlocks.length} knowledge blocks.`);

  // Output to file
  const outPath = path.join(__dirname, '../../extensions/engine_rules_dump.json');
  fs.writeFileSync(outPath, JSON.stringify(knowledgeBlocks, null, 2));
  console.log(`💾 Saved artifacts to ${outPath}`);

  // DB Ingestion Logic

  const SOURCE_NAME = 'Engine Codebase (Auto)';

  // 1. Find existing source
  let source = await app.documents('api::knowledge-source.knowledge-source').findFirst({
    filters: { name: SOURCE_NAME },
    status: 'published', // Strapi 5 might require status for find
  });

  if (source) {
    console.log(`🧹 Cleaning up old snippets for ${SOURCE_NAME}...`);
    // In Strapi 5, deleting a document deletes all its locales and versions.
    await app.documents('api::knowledge-source.knowledge-source').delete({ documentId: source.documentId });
    source = null;
  }

  console.log(`🆕 Creating Knowledge Source: ${SOURCE_NAME}`);
  source = await app.documents('api::knowledge-source.knowledge-source').create({
    data: {
      name: SOURCE_NAME,
      content: 'Auto-generated detailed knowledge base from TypeScript Source Code (AST).',
      origin: 'manual',
      tags: ['code', 'rules', 'engine'],
    },
    status: 'published',
  });

  console.log('🧠 Vectorizing and Ingesting Snippets...');

  for (const block of knowledgeBlocks) {
    try {
      const embedding = await embeddingService.generateEmbedding(block.content);

      await app.documents('api::knowledge-snippet.knowledge-snippet').create({
        data: {
          title: block.title,
          content: block.content,
          source: source.documentId,
          embedding: embedding,
        },
        status: 'published',
      });
      process.stdout.write('.');
    } catch (e) {
      console.error(`\n❌ Failed to ingest ${block.title}:`, e);
    }
  }

  console.log('\n✨ Ingestion Complete.');
  app.stop();
}

ingestRules().catch((err) => {
  console.error(err);
  process.exit(1);
});
