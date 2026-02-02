import { GoogleGenAI } from '@google/genai';
// import { z } from "zod";
// import { zodToJsonSchema } from "zod-to-json-schema";
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// 1. Setup & Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY or GOOGLE_API_KEY is missing in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const INPUT_FILE = path.join(process.cwd(), 'data/library/raw/srd-export.json');
const OUTPUT_JSONL = path.join(process.cwd(), 'data/library/raw/batch-polish-input.jsonl');
const BATCH_METADATA_FILE = path.join(process.cwd(), 'data/library/raw/batch-job-metadata.json');

// ... (Schemas remain similar or genericized) ...

// ---------------------------------------------------------------------------
// 3. Script Logic
// ---------------------------------------------------------------------------

async function runBatch() {
  console.log(`🚀 Starting Batch Polishing using ${MODEL_NAME}`);

  // A. Read Items
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }
  const rawItems = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📦 Loaded ${rawItems.length} entities from ${INPUT_FILE}`);

  // Limit to 20 items buffer as requested (or remove limit for prod)
  // For testing, let's just do 5 items.
  const bufferedItems = rawItems.slice(0, 5);
  console.log(`✂️  Limiting batch to ${bufferedItems.length} items (Testing Mode).`);

  // B. Create JSONL Content
  console.log(`📝 generating JSONL requests...`);
  const jsonlLines = bufferedItems.map((entry: any) => {
    const item = entry.data;
    const kind = entry.kind; // atom | molecule

    let prompt = '';

    if (kind === 'atom' && entry.type === 'feature') {
      prompt = `
                You are an expert Dungeon Master and Game Designer.
                Task: Polish this D&D 5e Feature.
                
                Name: ${item.name}
                Context: Class Feature (Level ${item.level})
                Raw Description:
                ${item.description}
                
                Requirements:
                1. Enhance the description to be immersive.
                2. Extract implied mechanics if any.
                3. Return valid JSON.
             `;
    } else if (kind === 'molecule' && entry.type === 'class') {
      prompt = `
                You are an expert Dungeon Master and Game Designer.
                Task: Polish this D&D 5e Class.
                
                Name: ${item.name}
                Raw Data: ${JSON.stringify(item.proficiencies)}
                
                Requirements:
                1. Write a short, epic 'lore_snippet' describing this class in the world.
                2. Return valid JSON.
             `;
    } else if (kind === 'molecule' && entry.type === 'spell') {
      prompt = `
                You are a Legendary Archmage and Game Designer.
                Task: Polish this D&D 5e Spell.
                
                Spell: ${item.name} (Level ${item.level} ${item.school})
                Raw Description:
                ${item.description}
                
                Requirements:
                1. rewrite 'formatted_description' to be visually stunning (HTML allowed).
                2. Extract 'scaling' (At Higher Levels) if present.
                3. Add 'lore_snippet' about the spell's origin.
                4. Return valid JSON.
             `;
    } else {
      // Fallback
      prompt = `Polish this entity: ${JSON.stringify(item)}`;
    }

    const requestObj = {
      custom_id: item.slug || `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      request: {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generation_config: {
          response_mime_type: 'application/json',
          // response_schema: jsonSchema // We might need to relax schema or make it dynamic
        },
      },
    };
    return JSON.stringify(requestObj);
  });

  // Write JSONL
  fs.writeFileSync(OUTPUT_JSONL, jsonlLines.join('\n'));
  console.log(`💾 JSONL written to ${OUTPUT_JSONL} (${jsonlLines.length} lines)`);

  // C. Upload File
  console.log(`☁️ Uploading file to Gemini...`);
  // Note: Documentation says ai.files.upload is the way.
  // We treat it as a batch input file.
  const fileUpload = await ai.files.upload({
    file: OUTPUT_JSONL,
    config: {
      name: `batch-polish-${Date.now()}`,
      mimeType: 'application/json',
    },
  });

  console.log(`✅ File uploaded: ${fileUpload.name} (URI: ${fileUpload.uri})`);

  // Wait for the file to be processed/active?
  let fileState = fileUpload.state;
  console.log(`   File State: ${fileState}`);

  // Simple wait loop if needed
  while (fileState === 'PROCESSING') {
    console.log(`   Waiting for file processing...`);
    await new Promise((r) => setTimeout(r, 2000));
    const fileCheck = await ai.files.get({ name: fileUpload.name });
    fileState = fileCheck.state;
  }

  if (fileState !== 'ACTIVE') {
    console.error(`❌ File upload failed or stuck. State: ${fileState}`);
  }

  // D. Create Batch Job
  console.log(`⚙️ Creating Batch Job...`);
  // FIXED: src is a top-level parameter, not inside config.
  const batchJob = await ai.batches.create({
    src: fileUpload.name,
    model: MODEL_NAME, // Optional but good to specify if API needs it or default used
  });

  console.log(`🎉 Batch Job Created!`);
  console.log(`   ID: ${batchJob.name}`); // Resource name: batches/123...
  console.log(`   State: ${batchJob.state}`);

  // E. Save Metadata
  const metadata = {
    jobId: batchJob.name,
    inputFileUri: fileUpload.uri,
    startTime: new Date().toISOString(),
    status: batchJob.state,
  };
  fs.writeFileSync(BATCH_METADATA_FILE, JSON.stringify(metadata, null, 2));
  console.log(`📝 Job metadata saved to ${BATCH_METADATA_FILE}`);
  console.log(`👉 Run 'yarn ts-node src/scripts/genesis/check-batch.ts' to check status.`);
}

runBatch().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
