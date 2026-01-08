import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { getStrapiClient } from '../utils/strapi-client';

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️  No API Key found in env, trying to load from parent...');
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

const generativeModel = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-pro',
  maxOutputTokens: 8192,
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  temperature: 0.1,
});

const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  usage_max: z.number().optional().nullable(),
  usage_per: z.enum(['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']).optional().nullable(),
});

const ClassStructureSchema = z.object({
  name: z.string(),
  description: z.string(),
  hit_die: z.string().optional(),
  features: z.array(FeatureSchema).default([]),
});

async function run() {
  const client = getStrapiClient();
  const filePath = path.resolve(process.cwd(), 'classes.md');

  console.log(`📖 Reading ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Split by "## " which denotes a class header
  // Note: The file starts with # Classes, so we skip the first chunk if it's just the header
  const chunks = content.split(/^## /gm).slice(1);

  console.log(`🧩 Found ${chunks.length} potential class sections.`);

  for (const chunk of chunks) {
    // Extract name from the first line, e.g. "Barbarian {#section-barbarian}" -> "Barbarian"
    const firstLine = chunk.split('\n')[0].trim();
    const nameMatch = firstLine.match(/^([A-Za-z]+)/);

    if (!nameMatch) {
      console.log(`⚠️  Could not parse name from chunk: "${firstLine.substring(0, 20)}..."`);
      continue;
    }

    const className = nameMatch[1];
    console.log(`\n----------------------------------------`);
    console.log(`🔍 Processing: ${className}`);

    // 1. Check for Duplication
    try {
      const existing = await client.collection('classes').find({
        filters: { name: { $eq: className } },
      });

      if (existing.data && existing.data.length > 0) {
        console.log(`⏭️  Skipping ${className} - Already exists (ID: ${existing.data[0].id})`);
        // If the user wanted to UPDATE, we would do it here.
        // But "avoid duplication" usually implies "don't create if exists".
        // To be safe and ensure data quality, let's strictly SKIP for now,
        // as the user said "exist or is created".
        continue;
      }
    } catch (err) {
      console.error(`⚠️  Error checking existence for ${className}:`, err);
    }

    // 2. Digest with LLM
    console.log(`🧠 Digesting ${className} with LLM...`);
    try {
      const result = await generativeModel.withStructuredOutput(ClassStructureSchema).invoke([
        [
          'system',
          `You are an expert D&D 5e Data Assistant. 
           Analyze the provided markdown text describing a Character Class.
           Extract:
           1. The Class Name.
           2. A short description (summary of flavor text).
           3. The Hit Die (e.g. "1d12").
           4. All Class Features (e.g. Rage, Unarmored Defense, Spellcasting, Bardic Inspiration). 
              For features, extract the name, a concise description (max 800 chars), and usage limits if mentioned (e.g. usage_max: 2, usage_per: 'long_rest').
           
           Return strictly JSON.`,
        ],
        ['human', chunk],
      ]);

      if (!result) {
        console.error(`❌ LLM failed to digest ${className}`);
        continue;
      }

      console.log(`✨ Extracted ${result.features.length} features for ${result.name}.`);

      // 3. Create Entity
      const payload = {
        name: result.name,
        slug: result.name.toLowerCase(),
        description: result.description, // Rich text field
        hit_die: result.hit_die,
        features: result.features.map((f) => ({
          name: f.name,
          description: f.description,
          source: 'class',
          usage_max: f.usage_max,
          usage_per: f.usage_per,
        })),
      };

      const created = await client.collection('classes').create(payload);
      if (created) {
        console.log(`✅ Created ${className} successfully! (ID: ${created.id})`);
      } else {
        console.error(`❌ Failed to create ${className} (API returned null)`);
      }
    } catch (err: any) {
      console.error(`💥 Error processing ${className}:`, err.message);
    }
  }

  console.log(`\n🎉 Ingestion Complete.`);
}

run();
