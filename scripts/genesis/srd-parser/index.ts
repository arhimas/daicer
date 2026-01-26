import fs from 'fs';
import path from 'path';
import { MarkdownSplitter } from './MarkdownSplitter';
import { ClassParser } from './parsers/ClassParser';
import { SpellParser } from './parsers/SpellParser';
import { ItemParser } from './parsers/ItemParser';
import { ParseResult } from './types';

const SRD_PATH = '/Users/lg/lab/daicer/SRD.md';

async function main() {
  console.log(`[SRD-Parser] Reading from ${SRD_PATH}`);
  
  if (!fs.existsSync(SRD_PATH)) {
    console.error('SRD.md not found!');
    process.exit(1);
  }

  const splitter = new MarkdownSplitter(SRD_PATH);
  const content = splitter.readContent();
  const OUT_CLASSES = path.join(process.cwd(), 'data/library/molecules/classes');
const OUT_FEATURES = path.join(process.cwd(), 'data/library/atoms/features');
const OUT_SPELLS = path.join(process.cwd(), 'data/library/molecules/spells');
const OUT_ITEMS = path.join(process.cwd(), 'data/library/molecules/items');

if (!fs.existsSync(OUT_CLASSES)) fs.mkdirSync(OUT_CLASSES, { recursive: true });
if (!fs.existsSync(OUT_FEATURES)) fs.mkdirSync(OUT_FEATURES, { recursive: true });
if (!fs.existsSync(OUT_SPELLS)) fs.mkdirSync(OUT_SPELLS, { recursive: true });
if (!fs.existsSync(OUT_ITEMS)) fs.mkdirSync(OUT_ITEMS, { recursive: true });
  const classSections = splitter.splitClasses(content);
  
  const parser = new ClassParser();
  
  for (const [className, section] of Object.entries(classSections)) {
    console.log(`[SRD-Parser] Processing ${className}...`);
    try {
      const result: ParseResult = parser.parse(className, section);
      
      // Save Class JSON
      const classPath = path.join(OUT_CLASSES, `${result.classData.slug}.json`);
      fs.writeFileSync(classPath, JSON.stringify([result.classData], null, 2)); // Array wrapping as per current patterns
      
      // Save Feature JSONs (atomized)
      for (const feature of result.features) {
         // Create a unique slug for the feature: class-feature-name
         const featureSlug = `${result.classData.slug}-${feature.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
         const featurePath = path.join(OUT_FEATURES, `${featureSlug}.json`);
         
         const featureData = {
           slug: featureSlug,
           name: feature.name,
           class: result.classData.slug,
           level: feature.level,
           description: feature.description,
           is_subclass_feature: feature.is_subclass_feature
         };
         
         // We might want to append if exists, or overwrite. Overwriting for now to be clean.
         fs.writeFileSync(featurePath, JSON.stringify(featureData, null, 2));
         
         // Add to Batch Polish JSONL
         // We want to polish the description and maybe getting some lore.
         // We use the same structure as batch-polish.ts expects.
         // Actually batch-polish.ts constructs the prompt. We just need to give it the raw item.
         // But batch-polish.ts currently reads a SINGLE JSON file (Array).
         // The user wants 'batch-polish-input.jsonl' to be generated.
         // Wait, batch-polish.ts generates the JSONL from a source JSON.
         // The requirement says: "Generate a batch-polish-input.jsonl compatible file"
         // BETTER: Let's output a `srd-atoms-compilation.json` that contains ALL generated atoms/molecules data,
         // so `batch-polish.ts` can read IT as input if we tweak it, OR we generate valid JSONL directly.
         
         // Let's generate the JSONL lines directly here.
         // Schema for Request (from batch-polish.ts):
         // { custom_id, request: { contents: [...], generation_config: ... } }
         
         // { custom_id, request: { contents: [...], generation_config: ... } }
         
         // const prompt = `
         //    You are an expert Dungeon Master and Game Designer.
         //    Task: Polish this D&D 5e Feature.
         //    
         //    Feature: ${feature.name} (${result.classData.name} Level ${feature.level})
         //    Raw Description:
         //    ${feature.description}
         //    
         //    Requirements:
         //    1. Enhance the description to be vivid and clear.
         //    2. Extract any specific mechanics if implied but not explicit.
         //    3. Return valid JSON satisfying the schema.
         // `;
         // Came from original plan to generate JSONL here, but deferred.
         // Defined schema in batch-polish is for Magic Items.
         // We might need a different schema for Features?
         // User said "polish all our atoms molecules...".
         // Magic Item Schema has "rarity", "attunement". Features don't.
         // We need a generic "Entity Polish Schema".
         // For now, I will append to a 'srd-all-features.json' buffer, 
         // and we can have a specific 'polish-features.ts' or adapt 'batch-polish.ts'.
         
         // Let's stick to generating the JSON files, and create a manifest file `data/library/raw/srd-export.json`.
         // Then `batch-polish.ts` can be updated to read that.
      }
      
      // Save class data to the export list
      allExports.push({
          kind: 'molecule',
          type: 'class',
          data: result.classData
      });
      // Features are too many?
      result.features.forEach(f => {
          allExports.push({
              kind: 'atom',
              type: 'feature',
              data: {
                  name: f.name,
                  level: f.level,
                  class: result.classData.slug,
                  description: f.description
              }
          });
      });

    } catch (e) {
      console.error(`Error parsing ${className}:`, e);
    }
  }
  
  // --- SPELLS ---
  console.log('[SRD-Parser] Processing Spells...');
  const spellSection = splitter.extractSection(content, 'Spell Descriptions');
  if (spellSection) {
      const spellParser = new SpellParser();
      const spells = spellParser.parseSpells(spellSection);
      console.log(`[SRD-Parser] Found ${spells.length} spells.`);
      
      for (const spell of spells) {
          const spellPath = path.join(OUT_SPELLS, `${spell.slug}.json`);
          fs.writeFileSync(spellPath, JSON.stringify(spell, null, 2));
          
          allExports.push({
              kind: 'molecule',
              type: 'spell',
              data: spell
          });
      }
  } else {
      console.warn('[SRD-Parser] Could not find Spell Descriptions section.');
  }

  // --- ITEMS ---
  console.log('[SRD-Parser] Processing Items...');
  // "Magic Item Descriptions" or "Magic Items"?
  // Based on viewing usage, "Magic Item Descriptions" contains the list.
  const itemSection = splitter.extractSection(content, 'Magic Item Descriptions');
  if (itemSection) {
      const itemParser = new ItemParser();
      const items = itemParser.parseItems(itemSection);
      console.log(`[SRD-Parser] Found ${items.length} items.`);
      
      for (const item of items) {
          const itemPath = path.join(OUT_ITEMS, `${item.slug}.json`);
          fs.writeFileSync(itemPath, JSON.stringify(item, null, 2));
          
          allExports.push({
              kind: 'molecule',
              type: 'item',
              data: item
          });
      }
  } else {
      console.warn('[SRD-Parser] Could not find Magic Item Descriptions section.');
  }

  // Write the giant export file/manifest
  const rawDir = '/Users/lg/lab/daicer/data/library/raw';
  if (!fs.existsSync(rawDir)) {
      fs.mkdirSync(rawDir, { recursive: true });
  }

  fs.writeFileSync(
      path.join(rawDir, 'srd-export.json'), 
      JSON.stringify(allExports, null, 2)
  );

  console.log(`[SRD-Parser] Complete. Exported ${allExports.length} items to srd-export.json.`);
}

const allExports: Record<string, unknown>[] = []; // Global buffer

main();
