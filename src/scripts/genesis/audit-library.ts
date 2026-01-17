
import { GoogleGenAI, SchemaType } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
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

const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = "gemini-flash-lite-latest"; // As requested
const CONCURRENCY_LIMIT = 20;

const LIBRARY_ROOT = path.join(process.cwd(), 'data/library');
const AUDIT_ROOT = path.join(process.cwd(), 'data/library/audit');

if (!fs.existsSync(AUDIT_ROOT)) {
    fs.mkdirSync(AUDIT_ROOT, { recursive: true });
}

// ---------------------------------------------------------------------------
// 2. Zod Schemas (The "Tight" Definitions)
// ---------------------------------------------------------------------------

// Common Primitives
const Slug = z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be kebab-case");
const Name = z.string().min(1);
const Description = z.string().min(10, "Description is too short");

// --- Spell Schema ---
const SpellSchema = z.object({
    slug: Slug,
    name: Name,
    level: z.union([z.number().int().min(0).max(9), z.string()]), // Allow string "Cantrip" or digit
    school: z.string(),
    casting_time: z.string(),
    range: z.string(),
    components: z.string().optional(),
    duration: z.string(),
    description: Description,
    classes: z.array(z.string()).optional(),
    archetypes: z.array(z.string()).optional(),
}).passthrough(); // Allow extra props but warn

// --- Item Schema ---
const ItemSchema = z.object({
    slug: Slug,
    name: Name,
    type: z.string(),
    rarity: z.string(),
    attunement: z.union([z.boolean(), z.string().nullish()]).optional(),
    description: Description,
}).passthrough();

// --- Feature Schema ---
const FeatureSchema = z.object({
    slug: Slug,
    name: Name,
    level: z.union([z.number(), z.string().regex(/^\d+$/)]), // Ensure numeric
    description: Description,
    is_subclass_feature: z.boolean().optional(),
    // We expect linked content eventually
}).passthrough();

// --- Class Schema ---
const ClassSchema = z.object({
    slug: Slug,
    name: Name,
    hit_die: z.string().regex(/^d\d+$/),
    proficiencies: z.any().optional(), // Complex, leaving loose for now
    equipment: z.any().optional(),
    progression: z.array(z.object({
        level: z.union([z.number(), z.string()]),
        pb: z.any(),
        features: z.array(z.string())
    })).optional(),
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

const auditSchema = {
    type: SchemaType.OBJECT,
    properties: {
        quality_score: { type: SchemaType.NUMBER, description: "0-100 score of data quality" },
        issues: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING },
            description: "List of data consistency or quality issues"
        },
        description_polished: { type: SchemaType.STRING, description: "A rewritten, visually stunning HTML description (if needed)" },
        lore_snippet: { type: SchemaType.STRING, description: "A short flavor text or origin story" },
        mechanics_fix: { type: SchemaType.OBJECT, description: "Proposed JSON patches for mechanical fields", nullable: true }
    },
    required: ["quality_score", "issues", "lore_snippet"]
};

async function processFile(filepath: string) {
    const filename = path.basename(filepath);
    const relativePath = path.relative(LIBRARY_ROOT, filepath);
    const entityType = getEntityType(filepath);
    
    // 1. Read & Parse
    let data;
    try {
        const raw = fs.readFileSync(filepath, 'utf-8');
        data = JSON.parse(raw);
        // Handle array wrapper if present
        if (Array.isArray(data)) data = data[0];
    } catch (e) {
        return { error: "JSON Parse Failed", file: relativePath };
    }

    // 2. Zod Validation
    const schema = getSchema(entityType);
    const validation = schema.safeParse(data);
    let zodErrors = [];
    if (!validation.success) {
        zodErrors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    }

    // 3. LLM Audit
    const prompt = `
        You are a meticulous Data Archivist and Senior Game Designer for D&D 5e.
        
        ENTITY: ${entityType.toUpperCase()}
        FILE: ${filename}
        
        RAW DATA:
        ${JSON.stringify(data, null, 2)}
        
        ZOD VALIDATION ERRORS (Mechanical Integrity):
        ${zodErrors.length > 0 ? JSON.stringify(zodErrors, null, 2) : "NONE - Structurally Valid"}
        
        TASK:
        1. Analyze the entity for "Premium Quality".
        2. Assign a Quality Score (0-100).
        3. List specific issues (typos, clarity, missing scaling, boring description).
        4. If the description is plain, rewrite it in "description_polished" (Use HTML/Markdown for emphasis).
        5. Create a "lore_snippet" to add flavor.
        6. If mechanical fields (damage, range, etc) look wrong or inconsistent with 5e rules, suggest fixes in "mechanics_fix".
    `;

    try {
        const result = await ai.models.generateContent({
            model: MODEL_NAME,
            config: {
                responseMimeType: "application/json",
                responseSchema: auditSchema,
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        const responseJson = result.response.parsedContent;
        
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
        // Fallback for model not found or overloaded
        return { error: `LLM Error: ${e.message}`, file: relativePath };
    }
}

// ---------------------------------------------------------------------------
// 5. Main Loop (Concurrent Pool)
// ---------------------------------------------------------------------------

async function main() {
    console.log(`🚀 Starting Library Audit [${MODEL_NAME}]`);
    console.log(`🎯 Concurrency Limit: ${CONCURRENCY_LIMIT}`);
    console.log(`📂 Source: ${LIBRARY_ROOT}`);
    console.log(`📂 Output: ${AUDIT_ROOT}`);

    // Find files
    const allFiles = await glob('**/*.json', { cwd: LIBRARY_ROOT, absolute: true });
    // Filter out 'audit' directory itself if it's inside library
    const filesToProcess = allFiles.filter(f => !f.includes('/audit/') && !f.includes('/raw/'));
    
    console.log(`📚 Found ${filesToProcess.length} files to audit.`);
    
    const limit = pLimit(CONCURRENCY_LIMIT);
    
    let processed = 0;
    const errors: any[] = [];
    const lowQuality: any[] = [];

    const tasks = filesToProcess.map(file => {
        return limit(async () => {
            const result: any = await processFile(file);
            processed++;
            
            if (processed % 10 === 0) {
                process.stdout.write(`\r⏳ Progress: ${processed}/${filesToProcess.length}`);
            }

            if (result.error) {
                console.error(`\n❌ Error on ${result.file}: ${result.error}`);
                errors.push(result);
            } else if (result.score < 80) {
                // console.log(`\n⚠️  Low Quality (${result.score}): ${result.file}`);
                lowQuality.push({ file: result.file, score: result.score });
            }
        });
    });

    await Promise.all(tasks);
    
    console.log(`\n\n✅ Audit Complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Low Quality (<80): ${lowQuality.length}`);
    
    if (lowQuality.length > 0) {
        console.log(`\n👇 Top 5 Low Quality Items:`);
        lowQuality.sort((a, b) => a.score - b.score).slice(0, 5).forEach(f => console.log(`   - [${f.score}] ${f.file}`));
    }
}

main().catch(err => {
    console.error("Fatal:", err);
    process.exit(1);
});
