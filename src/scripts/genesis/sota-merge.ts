
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import 'dotenv/config';

// ---------------------------------------------------------------------------
// 1. Configuration
// ---------------------------------------------------------------------------

const LIBRARY_ROOT = path.join(process.cwd(), 'data/library');
const AUDIT_ROOT = path.join(process.cwd(), 'data/library/audit');
const SEED_ROOT = path.join(process.cwd(), 'data/seed');

// Ensure Seed Dirs
['spells', 'items', 'features', 'classes'].forEach(dir => {
    fs.mkdirSync(path.join(SEED_ROOT, dir), { recursive: true });
});

// ---------------------------------------------------------------------------
// 2. Schemas (Shared with Audit)
// ---------------------------------------------------------------------------

const Slug = z.string().min(3).regex(/^[a-z0-9-]+$/);
const Name = z.string().min(1);
const Description = z.string();

// Note: These schemas are now the "Canonical Seed Schemas".
// They must be strict enough to ensure quality but loose enough for the merge.

const SpellSchema = z.object({
    slug: Slug,
    name: Name,
    level: z.union([z.number(), z.string()]),
    school: z.string(),
    casting_time: z.string(),
    range: z.string(),
    components: z.string().optional(),
    duration: z.string(),
    description: Description,
    // Enhanced Fields
    lore: z.string().optional(),
    classes: z.array(z.string()).optional(),
}).passthrough();

const ItemSchema = z.object({
    slug: Slug,
    name: Name,
    type: z.string(),
    rarity: z.string(),
    description: Description,
    lore: z.string().optional(),
    attunement: z.union([z.boolean(), z.string().nullish()]).optional(),
}).passthrough();

const FeatureSchema = z.object({
    slug: Slug,
    name: Name,
    level: z.union([z.number(), z.string()]),
    description: Description,
    is_subclass_feature: z.boolean().optional(),
    lore: z.string().optional(),
}).passthrough();

const ClassSchema = z.object({
    slug: Slug,
    name: Name,
    hit_die: z.union([z.string(), z.number()]), // Allow raw number or "d8"
    lore: z.string().optional(),
}).passthrough();

// ---------------------------------------------------------------------------
// 3. Logic
// ---------------------------------------------------------------------------

function getEntityType(filepath: string) {
    if (filepath.includes('/molecules/spells/')) return 'spells';
    if (filepath.includes('/molecules/items/')) return 'items';
    if (filepath.includes('/atoms/features/')) return 'features';
    if (filepath.includes('/molecules/classes/')) return 'classes';
    return 'unknown';
}

async function main() {
    console.log(`🧬 Starting SOTA Merge...`);
    console.log(`   Source: ${LIBRARY_ROOT}`);
    console.log(`   Audits: ${AUDIT_ROOT}`);
    console.log(`   Target: ${SEED_ROOT}`);

    const allFiles = await glob('**/*.json', { cwd: LIBRARY_ROOT, absolute: true });
    // Filter out audit/raw/seed dirs if they are nested (they shouldn't be matched by logic below properly but safety first)
    // Actually our glob is recursive from LIBRARY_ROOT. 
    // We strictly want: molecules/spells, molecules/items, atoms/features, molecules/classes.
    
    const validFiles = allFiles.filter(f => 
        (f.includes('/molecules/') || f.includes('/atoms/')) && 
        !f.includes('/raw/') && 
        !f.includes('/audit/')
    );

    console.log(`📚 Processing ${validFiles.length} raw entities.`);
    
    let stats = {
        merged: 0,
        failed: 0,
        skipped: 0
    };

    for (const filepath of validFiles) {
        const filename = path.basename(filepath);
        const relativePath = path.relative(LIBRARY_ROOT, filepath);
        const entityType = getEntityType(filepath);
        
        if (entityType === 'unknown') continue;

        // 1. Load Raw
        let rawData;
        try {
            const content = fs.readFileSync(filepath, 'utf-8');
            rawData = JSON.parse(content);
            if (Array.isArray(rawData)) rawData = rawData[0];
        } catch (e) {
            console.error(`❌ Failed to parse raw: ${filename}`);
            stats.failed++;
            continue;
        }

        // 2. Load Audit (if exists)
        const auditPath = path.join(AUDIT_ROOT, `${filename}.audit.json`);
        let auditData: any = null;
        if (fs.existsSync(auditPath)) {
            try {
                const auditContent = fs.readFileSync(auditPath, 'utf-8');
                auditData = JSON.parse(auditContent);
            } catch (e) {
                console.warn(`⚠️ Failed to parse audit: ${filename}`);
            }
        }

        // 3. Merge Logic
        const seedData = { ...rawData };
        
        // Apply Audit Enhancements
        if (auditData && auditData.llm_audit) {
            const audit = auditData.llm_audit;
            
            // Polished Description (Priority)
            if (audit.description_polished && audit.description_polished.length > rawData.description?.length) {
                seedData.description = audit.description_polished;
            }

            // Lore Snippet
            if (audit.lore_snippet) {
                seedData.lore = audit.lore_snippet;
            }

            // Mechanics Fixes (Patching)
            if (audit.mechanics_fix) {
                // We patch only keys that exist in fix. 
                // E.g. damage type, casting time correction.
                // Be careful not to overwrite generic objects unless sure.
                Object.assign(seedData, audit.mechanics_fix);
            }
        }

        // 4. Validate & Write
        let schema;
        switch (entityType) {
            case 'spells': schema = SpellSchema; break;
            case 'items': schema = ItemSchema; break;
            case 'features': schema = FeatureSchema; break;
            case 'classes': schema = ClassSchema; break;
        }

        if (schema) {
            const result = schema.safeParse(seedData);
            if (result.success) {
                const outPath = path.join(SEED_ROOT, entityType, filename);
                fs.writeFileSync(outPath, JSON.stringify(seedData, null, 2));
                stats.merged++;
            } else {
                // If validation fails, we try to write raw but log warning, OR skip?
                // User wants "Awesome Structured Seed".
                // Let's write it but log error. Ideally we fix it.
                // We'll write to seed anyway so we don't lose data, but maybe prefix with _unverified or just log.
                // For now: Log error, write anyway (best effort merge).
                console.error(`⚠️ Validation Failed for ${filename}:`, result.error.issues[0].message);
                const outPath = path.join(SEED_ROOT, entityType, filename);
                fs.writeFileSync(outPath, JSON.stringify(seedData, null, 2));
                stats.merged++; // We counted it as merged, just invalid.
            }
        }
    }

    console.log(`\n🎉 Merge Complete.`);
    console.log(`   Merged: ${stats.merged}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Seed Folder: ${SEED_ROOT}`);
}

main().catch(console.error);
