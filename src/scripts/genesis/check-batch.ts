
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// 1. Setup & Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY or GOOGLE_API_KEY is missing in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const BATCH_METADATA_FILE = path.join(process.cwd(), 'data/library/molecules/items/batch-job-metadata.json');
const OUTPUT_DIR = path.join(process.cwd(), 'data/library/molecules/items/polished');
const OUTPUT_RESULTS_FILE = path.join(process.cwd(), 'data/library/molecules/items/batch-results.jsonl');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 2. Logic
// ---------------------------------------------------------------------------

async function checkBatch() {
    console.log(`🔍 Checking Batch Job Status...`);

    if (!fs.existsSync(BATCH_METADATA_FILE)) {
        console.error(`❌ Metadata file not found: ${BATCH_METADATA_FILE}`);
        console.log("   Run 'batch-polish.ts' first.");
        process.exit(0);
    }

    const metadata = JSON.parse(fs.readFileSync(BATCH_METADATA_FILE, 'utf-8'));
    const jobId = metadata.jobId; 

    if (!jobId) {
        console.error(`❌ invalid metadata file.`);
        process.exit(1);
    }

    console.log(`   Job ID: ${jobId}`);

    const MAX_RETRIES = 30; // 5 minutes approx
    const DELAY_MS = 10000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const job = await ai.batches.get({ name: jobId });
            console.log(`   [${i + 1}/${MAX_RETRIES}] State: ${job.state}`);

            if (job.state === 'JOB_STATE_SUCCEEDED') {
                console.log(`🎉 Job Succeeded!`);
                console.log(JSON.stringify(job, null, 2));

                // Try to find the output URI
                // The SDK output for Gemini API usually puts the file URI in `outputFile` or similar if not in dest.
                // But let's check `dest` or just try to list files if needed.
                // Actually, often the response contains `outputUri` at root for REST, but SDK might map it.
                // Let's assume we can find it in the logged object.
                // For this script, if we find it, we proceed.
                
                // HACK: Inspect known potential keys
                const outputUri = (job as any).outputUri || (job.dest as any)?.gcsUri;
                
                if (outputUri) {
                    console.log(`⬇️ Downloading results from ${outputUri}...`);
                    try {
                         const response = await fetch(`${outputUri}?key=${API_KEY}`);
                         if (!response.ok) throw new Error(response.statusText);
                         const text = await response.text();
                         fs.writeFileSync(OUTPUT_RESULTS_FILE, text);
                         console.log(`💾 Saved raw results to ${OUTPUT_RESULTS_FILE}`);
                         processResults(text);
                    } catch (err) {
                        console.error("Failed to download/save:", err);
                    }
                } else {
                    console.error("❌ Job succeeded but could not find Output URI in job object.");
                }
                
                return; // Exit loop
            } else if (job.state === 'JOB_STATE_FAILED') {
                console.error(`❌ Job Failed.`);
                console.error((job as any).error);
                return;
            }

            // Wait
            await new Promise(r => setTimeout(r, DELAY_MS));

        } catch (error) {
            console.error(`❌ Error checking batch status:`, error);
            // Don't exit, retry
        }
    }
    console.log(`⏳ Timed out waiting for batch job.`);
}


function processResults(jsonlContent: string) {
    console.log(`⚙️ Processing Results...`);
    
    /* Result format (JSONL):
       {"custom_id": "...", "response": {"status_code": 200, "request": {...}, "body": {...}}}
    */

    const lines = jsonlContent.split('\n').filter(l => l.trim());
    let successCount = 0;

    for (const line of lines) {
        try {
            const result = JSON.parse(line);
            const customId = result.custom_id;
            
            if (result.response && result.response.body) {
                // The body is likely the standard GenerateContentResponse
                // BUT, since we used Structured Output (responseSchema), the text inside candidates should be JSON.
                
                // Inspect structure deep down
                // response.body.candidates[0].content.parts[0].text
                const candidates = result.response.body.candidates;
                if (candidates && candidates.length > 0) {
                    const text = candidates[0].content.parts[0].text;
                    const polishedItem = JSON.parse(text); // Should be our MagicItemSchema object
                    
                    // Save individual file
                    const safeName = customId; // We used slug as customId
                    const filePath = path.join(OUTPUT_DIR, `${safeName}.json`);
                    
                    fs.writeFileSync(filePath, JSON.stringify(polishedItem, null, 2));
                    successCount++;
                }
            }
        } catch (e) {
            console.error(`⚠️ Error parsing line:`, e);
        }
    }
    
    console.log(`✅ Successfully processed and saved ${successCount} items to ${OUTPUT_DIR}`);
}

checkBatch();
