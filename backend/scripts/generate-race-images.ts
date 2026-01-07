import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { client } from '../src/cli/utils/client';
import { generateImageGemini } from '../src/utils/llm/image';
import FormData from 'form-data';

interface ImageGeneratorOptions {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
  style?: string;
  negativePrompt?: string;
}

async function generateImageFromText(options: ImageGeneratorOptions): Promise<string> {
  const { prompt, aspectRatio = '1:1', style, negativePrompt } = options;

  let fullPrompt = prompt;
  if (style) fullPrompt += ` Style: ${style}`;
  if (negativePrompt) fullPrompt += ` (NO ${negativePrompt})`;
  fullPrompt += '. No text, no watermark, no typography.';

  const { url } = await generateImageGemini({
    prompt: fullPrompt,
    aspectRatio: aspectRatio,
  });

  return url;
}

// Load RAG results
const RESEARCH_PATH = path.join(__dirname, 'race-research-results.json');
let RESEARCH_DATA: Record<string, any> = {};

if (fs.existsSync(RESEARCH_PATH)) {
  RESEARCH_DATA = JSON.parse(fs.readFileSync(RESEARCH_PATH, 'utf-8'));
} else {
  console.warn('⚠️ Research data not found. Using defaults.');
}

// Hardcoded token
import dotenv from 'dotenv';

// Load env from monorepo root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const STRAPI_TOKEN = process.env.STRAPI_AUDIT_TOKEN;
if (!STRAPI_TOKEN) {
  console.warn('⚠️ STRAPI_AUDIT_TOKEN not found in .env');
}

async function uploadImage(buffer: Buffer, name: string): Promise<number | null> {
  const form = new FormData();
  form.append('files', buffer, {
    filename: `${name.toLowerCase()}_avatar.png`,
    contentType: 'image/png',
  });

  try {
    const length = await new Promise<number>((resolve, reject) => {
      form.getLength((err, length) => {
        if (err) reject(err);
        else resolve(length);
      });
    });

    const response = await axios.post('http://localhost:1337/api/upload', form, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Length': length,
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id;
    }
    return null;
  } catch (err: any) {
    console.error('Upload Error:', err.response?.data || err.message);
    return null;
  }
}

function getVisualDescription(name: string): string {
  const data = RESEARCH_DATA[name];
  if (Array.isArray(data) && data.length > 0) {
    // Find best snippet for visual description
    // Priority: Title has "Appearance" or "Visual" or "Traits"
    // Also exclude mechanical game rules if possible (though RAG snippet might mix them)

    const visualSnippet = data.find(
      (d: any) =>
        (d.title && (d.title.toLowerCase().includes('appearance') || d.title.toLowerCase().includes('visual'))) ||
        d.content.toLowerCase().includes('skin') ||
        d.content.toLowerCase().includes('height')
    );

    if (visualSnippet) {
      // Extract text, remove markdown headers
      return visualSnippet.content
        .replace(/#+\s.+/g, '')
        .substring(0, 500)
        .replace(/\n/g, ' ')
        .trim();
    }

    // Fallback to first
    return data[0].content.substring(0, 500).replace(/\n/g, ' ').trim();
  }
  return `A fantasy ${name} character. Biological and natural appearance.`;
}

async function run() {
  console.log('Starting Humble Race Image Generation (Refined)...');

  // 1. Fetch all races
  const races = await client.collection('races').find({ limit: 50 });
  const raceList = Array.isArray(races) ? races : (races as any).data;

  if (!raceList || raceList.length === 0) {
    console.error('No races found in database!');
    process.exit(1);
  }

  // 2. Process each race
  for (const race of raceList) {
    const name = race.name || race.attributes?.name;
    const documentId = race.documentId;

    if (!name) continue;

    console.log(`\nProcessing ${name}...`);

    // Extract description "Text from Prompts"
    const rawDescription = getVisualDescription(name);
    // Clean it up further?
    // "create a prompt for the description as text" - extracting core visual traits
    // For now the raw snippet is the best source of truth we have.

    console.log(`Visual Context: ${rawDescription.substring(0, 80)}...`);

    // 3. Generate Image with Humble Focus
    try {
      console.log('Generating image...');
      // "rumble race not a powerful is focus on race not in gears"
      // "1x1 aspect ratio"
      // "no text on imae"

      const refinedPrompt = `Single ${name} character, biological study, humble appearance, commoner clothes or naked (tasteful), no armor, no weapons, no gears, focus on facial features and anatomy. ${rawDescription}. 1x1 aspect ratio.`;

      const negativePrompt =
        'text, watermark, typography, weapons, armor, sword, shield, helmet, complex gear, glowing eyes, magic aura, powerful, epic, action pose';

      const url = await generateImageFromText({
        prompt: refinedPrompt,
        aspectRatio: '1:1',
        style:
          'Magic the Gathering illustration, oil painting, high fantasy, detailed textures, natural lighting, biological drawing style',
        negativePrompt: negativePrompt,
      });

      if (!url) throw new Error('No URL generated');

      // remove data prefix
      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // 4. Upload to Strapi
      console.log('Uploading to Media Library...');
      const imageId = await uploadImage(buffer, name);

      if (imageId) {
        // 5. Update Entity
        console.log(`Updating Race entity with Image ID ${imageId}...`);
        await client.collection('races').update(documentId, {
          description: rawDescription, // Use extracted visual description as the main description? Or keep broadly? User said "add the corrtect descriptioin"
          image: imageId,
        });
        console.log(`✅ ${name} complete.`);
      } else {
        console.error(`❌ Failed to upload image for ${name}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${name}:`, err);
    }
  }
}

run().catch(console.error);
