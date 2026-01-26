
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import pLimit from 'p-limit';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// 1. Setup & Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY or GOOGLE_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
// User requested 'gemini-flash-lite-latest', fallback to 1.5-flash
const MODEL_NAME = "gemini-flash-lite-latest"; 
const FALLBACK_MODEL = "gemini-1.5-flash";
const CONCURRENCY_LIMIT = 20;

const LIBRARY_ROOT = path.join(process.cwd(), 'data/library');
const AUDIT_ROOT = path.join(process.cwd(), 'data/library/audit');

if (!fs.existsSync(AUDIT_ROOT)) {
    fs.mkdirSync(AUDIT_ROOT, { recursive: true });
}

// ---------------------------------------------------------------------------
// 2. Zod Schemas (The "Tight" Definitions)
// ---------------------------------------------------------------------------

const Slug = z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be kebab-case");
const Name = z.string().min(1);
const Description = z.string().min(10, "Description is too short");

// --- Spell Schema ---
const SpellSchema = z.object({
    slug: Slug,
    name: Name,
    level: z.union([z.number().int().min(0).max(9), z.string()]), 
    school: z.string(),
    casting_time: z.string(),
    range: z.string(),
    components: z.string().optional(),
    duration: z.string(),
    description: Description,
}).passthrough(); 

// --- Item Schema ---
const ItemSchema = z.object({
    slug: Slug,
    name: Name,
    type: z.string(),
    rarity: z.string(),
    description: Description,
}).passthrough();

// --- Feature Schema ---
const FeatureSchema = z.object({
    slug: Slug,
    name: Name,
    description: Description,
}).passthrough();

// --- Class Schema ---
const ClassSchema = z.object({
    slug: Slug,
    name: Name,
    hit_die: z.string().regex(/^d\d+$/),
}).passthrough();

// ---------------------------------------------------------------------------
// 3. Types & Helpers
// ---------------------------------------------------------------------------

type EntityType = 'spell' | 'item' | 'feature' | 'class' | 'unknown';

function getEntityType(filepath: string): EntityType {
    if (filepath.includes('/spells/')) return 'spell';
    if (filepath.includes('/items/')) return 'item';
    if (filepath.includes('/features/')) return 'feature';
    if (filepath.includes('/classes/')) return 'class';
    return 'unknown';
}

function getSchema(type: EntityType): z.ZodSchema<any> {
    switch (type) {
        case 'spell': return SpellSchema;
        case 'item': return ItemSchema;
        case 'feature': return FeatureSchema;
        case 'class': return ClassSchema;
        default: return z.any();
    }
}

// ---------------------------------------------------------------------------
// 4. The "Audit" Worker
// ---------------------------------------------------------------------------

// We use a simplified Schema object for the SDK to avoid type errors
// const auditJsonSchema = { ... } // Unused for now
/* const auditJsonSchema = {
    type: "OBJECT", // Use string literal for type
    properties: {
        quality_score: { type: "NUMBER", description: "0-100 score of data quality" },
        issues: { 
            type: "ARRAY", 
            items: { type: "STRING" },
            description: "List of data consistency or quality issues"
        },
        description_polished: { type: "STRING", description: "A rewritten, visually stunning HTML description" },
        lore_snippet: { type: "STRING", description: "A short flavor text or origin story" },
        mechanics_fix: { type: "OBJECT", description: "Proposed JSON patches for mechanical fields", nullable: true }
    },
    required: ["quality_score", "issues", "lore_snippet"]
}; */

async function processFile(filepath: string) {
    const filename = path.basename(filepath);
    const relativePath = path.relative(LIBRARY_ROOT, filepath);
    const entityType = getEntityType(filepath);
    
    // 1. Read & Parse
    let data;
    try {
        const raw = fs.readFileSync(filepath, 'utf-8');
        data = JSON.parse(raw);
        if (Array.isArray(data)) data = data[0];
    } catch (_e) {
        return { error: "JSON Parse Failed", file: relativePath };
    }

    // 2. Zod Validation
    const schema = getSchema(entityType);
    const validation = schema.safeParse(data);
    let zodErrors: string[] = [];
    if (!validation.success) {
        zodErrors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
    }

    // 3. LLM Audit
    const prompt = `
        You are a meticulous Data Archivist.
        ENTITY: ${entityType.toUpperCase()}
        FILE: ${filename}
        RAW DATA: ${JSON.stringify(data)}
        ZOD ERRORS: ${zodErrors.length > 0 ? JSON.stringify(zodErrors) : "NONE"}
        
        TASK: analyze consistency, quality, and mechanics. return valid JSON.
    `;

    try {
        // Try requested model first
        let model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            generationConfig: {
                responseMimeType: "application/json",
                // responseSchema: auditJsonSchema as any 
                // Note: casting to any to avoid TS mismatch with enum 
            }
        });

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (_err: any) {
            // Fallback
            // console.warn(`Model ${MODEL_NAME} failed, trying ${FALLBACK_MODEL}`);
            model = genAI.getGenerativeModel({ 
                model: FALLBACK_MODEL,
                generationConfig: { responseMimeType: "application/json" }
            });
            result = await model.generateContent(prompt);
        }
        
        const responseText = result.response.text();
        const responseJson = JSON.parse(responseText || '{}');
        
        // 4. Save Audit Artifact
        const auditArtifact = {
            file: relativePath,
            type: entityType,
            zod_valid: zodErrors.length === 0,
            zod_errors: zodErrors,
            llm_audit: responseJson,
            timestamp: new Date().toISOString()
        };

        const auditPath = path.join(AUDIT_ROOT, `${filename}.audit.json`);
        fs.writeFileSync(auditPath, JSON.stringify(auditArtifact, null, 2));

        return { success: true, file: relativePath, score: responseJson.quality_score };

    } catch (e: any) {
        return { error: `LLM Error: ${e.message}`, file: relativePath };
    }
}

// ---------------------------------------------------------------------------
// 5. Main Loop
// ---------------------------------------------------------------------------

async function main() {
    console.log(`🚀 Starting Library Audit [${MODEL_NAME}]`);
    console.log(`🎯 Concurrency Limit: ${CONCURRENCY_LIMIT}`);
    console.log(`📂 Source: ${LIBRARY_ROOT}`);
    console.log(`📂 Output: ${AUDIT_ROOT}`);

    const allFiles = await glob('**/*.json', { cwd: LIBRARY_ROOT, absolute: true });
    const filesToProcess = allFiles.filter(f => !f.includes('/audit/') && !f.includes('/raw/'));
    
    console.log(`📚 Found ${filesToProcess.length} files to audit.`);
    
    const limit = pLimit(CONCURRENCY_LIMIT);
    let processed = 0;
    const errors: any[] = [];

    const tasks = filesToProcess.map(file => {
        return limit(async () => {
            const result: any = await processFile(file);
            processed++;
            if (processed % 10 === 0) {
                process.stdout.write(`\r⏳ Progress: ${processed}/${filesToProcess.length}`);
            }
            if (result.error) errors.push(result);
        });
    });

    await Promise.all(tasks);
    
    console.log(`\n\n✅ Audit Complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Errors: ${errors.length}`);
}

main().catch(err => {
    console.error("Fatal:", err);
    process.exit(1);
});
