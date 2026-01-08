import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { getStrapiClient } from '../utils/strapi-client';
import { getGeminiModel } from './modules/llm';
import { FeatureSchema } from './modules/schemas';
import { MODEL_NAME } from './modules/constants';

// Load Env
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

const ClassStructureSchema = z.object({
  name: z.string(),
  description: z.string(),
  hit_die: z.string().optional(),
  features: z.array(FeatureSchema).default([]),
});

async function run() {
  const client = getStrapiClient();
  const filePath = path.resolve(process.cwd(), 'classes.md');
  const generativeModel = getGeminiModel(MODEL_NAME).withStructuredOutput(ClassStructureSchema);

  console.log(`📖 Reading ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = content.split(/^## /gm).slice(1);

  console.log(`🧩 Found ${chunks.length} potential class sections.`);

  for (const chunk of chunks) {
    const firstLine = chunk.split('\n')[0].trim();
    const nameMatch = firstLine.match(/^([A-Za-z]+)/);

    if (!nameMatch) {
      console.log(`⚠️  Skipping chunk: "${firstLine.substring(0, 20)}..."`);
      continue;
    }

    const className = nameMatch[1];

    const VALID_CLASSES = [
      'Barbarian',
      'Bard',
      'Cleric',
      'Druid',
      'Fighter',
      'Monk',
      'Paladin',
      'Ranger',
      'Rogue',
      'Sorcerer',
      'Warlock',
      'Wizard',
      'Artificer',
    ];

    if (!VALID_CLASSES.includes(className)) {
      console.log(`⚠️  Skipping non-class section: "${className}"`);
      continue;
    }

    console.log(`\n----------------------------------------`);
    console.log(`🔍 Processing: ${className}`);

    // 1. Check for Duplication / Existence
    let targetId = null;
    try {
      const existing = await client.collection('classes').find({
        filters: { name: { $eq: className } },
      });

      if (existing.data && existing.data.length > 0) {
        targetId = existing.data[0].id || existing.data[0].documentId;
        console.log(`🔄 Updating existing ${className} (ID: ${targetId})...`);
      }
    } catch (err) {
      console.error(`⚠️  Error checking existence for ${className}:`, err);
    }

    // 2. Digest with LLM
    console.log(`🧠 Digesting ${className} with LLM...`);
    try {
      const result = await generativeModel.invoke([
        [
          'system',
          `You are an expert D&D 5e Data Assistant. 
           Analyze the text. Extract Class Name, short description, hit die, and ALL features.
           For each feature, identify if it uses an Action, Bonus Action, or Reaction (default to 'passive').
           Return strictly JSON.`,
        ],
        ['human', chunk],
      ]);

      if (!result) {
        console.error(`❌ LLM failed to digest ${className}`);
        continue;
      }

      console.log(`✨ Extracted ${result.features.length} features for ${result.name}.`);

      // 3. Create or Update Entity
      const payload = {
        name: result.name,
        slug: result.name.toLowerCase(),
        description: result.description,
        hit_die: result.hit_die,
        features: result.features.map((f) => ({
          name: f.name,
          description: f.description,
          source: 'class',
          activation_type: f.activation_type,
          recharge: f.recharge,
          usage_max: f.usage_max,
          usage_per: f.usage_per,
        })),
      };

      if (targetId) {
        const updated = await client.collection('classes').update(targetId, payload);
        if (updated) console.log(`✅ Updated ${className} successfully!`);
        else console.error(`❌ Failed to update ${className}`);
      } else {
        const created = await client.collection('classes').create(payload);
        if (created) console.log(`✅ Created ${className} successfully! (ID: ${created.id})`);
        else console.error(`❌ Failed to create ${className}`);
      }
    } catch (err: any) {
      console.error(`💥 Error processing ${className}:`, err.message);
    }
  }

  console.log(`\n🎉 Ingestion Complete.`);
}

run();
