import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { glob } from 'glob';
import { getStrapi } from '../cli/utils/bootstrap';
import { codeIngestionService } from '../services/code-ingestion-service';

// Configuration
const SOURCE_PATTERN = 'src/**/*.{ts,js}';
const IGNORE_PATTERNS = ['**/*.d.ts', '**/*.test.ts', '**/node_modules/**', '**/dist/**'];

async function sendCode() {
  console.log('🚀 Starting Code Sync (SendCode)...');

  // 1. Initialize Strapi (Headless)
  const strapi = await getStrapi();

  try {
    const cwd = process.cwd();
    // 1.5 Get Files
    const files = await glob(SOURCE_PATTERN, { cwd, ignore: IGNORE_PATTERNS });
    console.log(`📂 Scanning ${files.length} source files...`);

    // 2. Find or Create Knowledge Source "Daicer Backend Source Code"
    const sourceName = 'Daicer Backend Source Code';
    let source = await strapi.documents('api::knowledge-source.knowledge-source').findFirst({
      filters: { name: sourceName },
    });

    if (!source) {
      source = await strapi.documents('api::knowledge-source.knowledge-source').create({
        data: {
          name: sourceName,
          content: 'Auto-synced Backend Source Code.',
          origin: 'manual',
        },
        status: 'published',
      });
      console.log('✨ Created Root KnowledgeSource.');
    }

    const sourceId = source.documentId;

    // 3. Batch Checksums
    // We want to minimize DB hits.
    // We iterate files, compute SHA.
    // We fetch ALL existing snippets for this source to compare?
    // If thousands of files, might be too big.
    // Better: Fetch existing map of { title: hash } if possible, or just iterate.
    // Since we don't store SHA explicitly in a field (unless we abuse a field or add one),
    // we might need to compare content or add a 'hash' field to KnowledgeSnippet.
    // BUT user said "checking the sha or sum if need if is same contet skiop".
    // Efficient way: Add 'hash' field to KnowledgeSnippet schema?
    // Current schema: title, content, embedding...
    // If we can't change schema now, we can compute SHA of 'content' from DB?
    // Fetching strictly title + content (partial) might be heavy.
    // Let's assume we can fetch titles and valid checksums from DB content? No, slow.
    // FASTEST WAY without schema change:
    // Fetch all snippet titles.
    // For existing titles, we might have to fetch content to diff.
    // OR we just overwrite if we don't care about write op cost (DB is fast enough for hundreds of files).
    // But embedding is expensive. The 'hash' check is to avoid re-EMBEDDING.
    // We rely on the 'recursion guard' in auto-embed?
    // auto-embed checks if *embedding* changed.
    // If we update content, auto-embed triggers.
    // So skipping update IS crucial.

    // Proposal: We assume title = `[Code] relative/path`.
    // We fetch all snippets for this source, selecting 'title' and 'content' (hashed?).
    // To be safe and sota, let's fetch all titles + length?
    // Let's implement a wrapper.

    let processed = 0;
    let skipped = 0;
    let updated = 0;
    let created = 0;

    // Fetch existing map: path -> { documentId, contentHash }
    // We can't easily get hash from DB. We fetch content.
    // Limitation: If codebase is HUGE (100MB+), this is heavy.
    // DAICER codebase seems moderate.
    const existingSnippets = await strapi.documents('api::knowledge-snippet.knowledge-snippet').findMany({
      filters: { source: { documentId: sourceId } },
      fields: ['title', 'content'], // Fetch content to compare
      limit: 10000, // Ensure we get all
    });

    const snippetMap = new Map();
    existingSnippets.forEach((s: any) => {
      // title format: "[Code] src/..."
      const relPath = s.title.replace('[Code] ', '');
      snippetMap.set(relPath, {
        id: s.documentId,
        hash: crypto.createHash('sha256').update(s.content).digest('hex'),
      });
    });

    // 4. Parallel Processing
    const OPERATIONS_BATCH_SIZE = 50;
    const updates = [];
    const creates = [];

    for (const file of files) {
      const absolutePath = path.join(cwd, file);
      const relativePath = path.relative(cwd, absolutePath);

      if (!codeIngestionService.isValidFile(relativePath)) continue;

      const content = fs.readFileSync(absolutePath, 'utf-8');
      const snippetData = codeIngestionService.generateSnippetData(relativePath, content);
      if (!snippetData) continue;

      const fileHash = crypto.createHash('sha256').update(snippetData.content).digest('hex');
      const existing = snippetMap.get(relativePath);

      if (existing) {
        if (existing.hash === fileHash) {
          skipped++;
          continue;
        }
        // Update
        updates.push(() =>
          strapi.documents('api::knowledge-snippet.knowledge-snippet').update({
            documentId: existing.id,
            data: {
              content: snippetData.content,
              sourceType: 'source-code',
              // We DO NOT set embedding here. The auto-embed subscriber picks up the change.
            },
          })
        );
        updated++;
      } else {
        // Create
        creates.push(() =>
          strapi.documents('api::knowledge-snippet.knowledge-snippet').create({
            data: {
              title: snippetData.title,
              content: snippetData.content,
              source: sourceId,
              sourceType: 'source-code',
            },
            status: 'published',
          })
        );
        created++;
      }
      processed++;
    }

    // Execute Operations in Batches
    console.log(`⚡ Updates: ${updated}, Creates: ${created}, Skipped: ${skipped}, Processed: ${processed}`);

    const allOps = [...creates, ...updates];

    // We run them in chunks to avoid overwhelming pool, though strict concurrency limit is better
    const chunk = (arr: any[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

    const bunches = chunk(allOps, OPERATIONS_BATCH_SIZE);

    let completed = 0;
    for (const bunch of bunches) {
      await Promise.all(bunch.map((op) => op()));
      completed += bunch.length;
      process.stdout.write(`\rProgress: ${completed}/${allOps.length}`);
    }

    console.log('\n✅ Sync Complete. Auto-embedder will handle vectors in background.');
  } catch (error) {
    console.error('❌ Sync Failed:', error);
    process.exit(1);
  } finally {
    strapi.stop();
  }
}

sendCode();
