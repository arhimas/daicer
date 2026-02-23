import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const RaceSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    size: z.enum(['Tiny', 'Small', 'Medium', 'Large']).optional(),
    speed: z.any().optional(),
    traits: z.array(z.string()).optional(),
    proficiencies: z.array(z.string()).optional(),
  })
  .passthrough();

async function transformRaces() {
  console.log('🔄 Starting Race Validation (Blueprints -> Strapi Entities)');
  const racesDir = path.join(process.cwd(), 'seed-data', 'race');

  let files: string[] = [];
  try {
    files = await fs.readdir(racesDir);
  } catch {
    console.log('No races found to transform.');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(racesDir, file);
    const rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    // Standardize size casing for Enum
    let size = rawData.size;
    if (typeof size === 'string') {
      size = size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();
    }

    const payload = {
      ...rawData,
      slug: rawData.slug,
      name: rawData.name,
      size: size,
    };

    const validation = RaceSchema.safeParse(payload);

    if (validation.success) {
      // Overwrite with clean validated data
      await fs.writeFile(filePath, JSON.stringify(validation.data, null, 2));
      successCount++;
    } else {
      console.error(`❌ Validation Failed for ${rawData.name}:`, validation.error.format());
      failCount++;
    }
  }

  console.log(`\n🏁 Validated ${successCount} races. Failed: ${failCount}.`);
}

transformRaces().catch(console.error);
