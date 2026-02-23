import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const ClassSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  lore: z.string().optional(),
  hit_die: z.string().optional(),
  subclasses: z.array(z.string()).optional(),
  proficiencies: z.array(z.string()).optional(),
  features: z.array(z.any()).optional(),
  progression: z.array(z.any()).optional()
}).passthrough();

async function transformClasses() {
    console.log('🔄 Starting Class Validation (Blueprints -> Strapi Entities)');
    const classesDir = path.join(process.cwd(), 'seed-data', 'class');

    let files: string[] = [];
    try {
        files = await fs.readdir(classesDir);
    } catch {
        console.log('No classes found to transform.');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(classesDir, file);
        const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        const payload = {
            ...rawData,
            slug: rawData.slug,
            name: rawData.name,
            hit_die: rawData.hit_die,
        };

        const validation = ClassSchema.safeParse(payload);
        
        if (validation.success) {
            // Overwrite with clean validated data
            await fs.writeFile(filePath, JSON.stringify(validation.data, null, 2));
            successCount++;
        } else {
            console.error(`❌ Validation Failed for ${rawData.name}:`, validation.error.format());
            failCount++;
        }
    }

    console.log(`\n🏁 Validated ${successCount} classes. Failed: ${failCount}.`);
}

transformClasses().catch(console.error);
