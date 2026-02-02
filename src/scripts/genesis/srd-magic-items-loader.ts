import * as fs from 'fs';
import * as path from 'path';

const SRD_PATH = path.join(process.cwd(), 'SRD.md');
const OUT_PATH = path.join(process.cwd(), 'data/library/molecules/items/magic-items-srd.json');

// Lines where Magic Items chapter starts and ends (based on previous investigation)
// # Magic Items {#chapter-magic-items} -> Line 20934 (1-indexed)
// # Monsters {#chapter-monsters} -> Line 25162 (1-indexed)
const START_LINE = 20934;
const END_LINE = 25162;

interface ParsedItem {
  name: string;
  type_rarity?: string;
  description: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-+/g, '-'); // Replace multiple - with single -
}

function parseSRDItems() {
  console.log(`📖 Reading SRD from ${SRD_PATH}...`);
  const fileContent = fs.readFileSync(SRD_PATH, 'utf-8');
  const lines = fileContent.split('\n');

  // Extract the Magic Items section (adjust for 0-indexed array)
  const magicItemsLines = lines.slice(START_LINE, END_LINE);

  const items: ParsedItem[] = [];
  let currentItem: ParsedItem | null = null;
  let buffer: string[] = [];

  for (const line of magicItemsLines) {
    // Detect Item Header: ### Item Name
    const headerMatch = line.match(/^###\s+(.+)$/);

    if (headerMatch) {
      // Save previous item
      if (currentItem) {
        currentItem.description = buffer.join('\n').trim();
        items.push(currentItem);
      }

      // Start new item
      const name = headerMatch[1].trim();
      // Skip sub-sections that aren't items (like "Attunement", "Wearing and Wielding Items")
      // A simple heuristic: Most items have a description line immediately following or shortly after.
      // Also, regular sections usually don't have the "Type, rarity" line.
      // We'll capture everything as a potential item and filter later or just rely on the structure.
      // Actually, the SRD has sub-sections like "Attunement" under "Magic Items".
      // Real items usually appear under "Magic Item Descriptions" which is a ## Header.
      // But here we are just capturing ### headers.
      // In the SRD, "Magic Item Descriptions" is ## (Level 2).
      // Items are ### (Level 3).
      // Sections like "Attunement" are ## (Level 2).
      // Wait, let's verify if "Attunement" is ## or ###.
      // From the view_file output: ## Attunement {#section-attunement}
      // So ### Headers are likely Items (or sub-sections of Attunement? No, usually not).

      // Let's assume ### are items.
      currentItem = {
        name: name,
        slug: slugify(name),
        description: '',
      };
      buffer = [];
      continue;
    }

    if (currentItem) {
      // Check for Type/Rarity line: _Weapon (any sword), legendary (requires attunement)_
      // It usually starts with _ and ends with _
      const typeMatch = line.match(/^_(.+)_$/);
      if (typeMatch && buffer.length === 0) {
        currentItem.type_rarity = typeMatch[1];
      } else {
        buffer.push(line);
      }
    }
  }

  // Push last item
  if (currentItem) {
    currentItem.description = buffer.join('\n').trim();
    items.push(currentItem);
  }

  // Filter out obvious non-items if any (detected by lack of type_rarity maybe? or just manual review)
  // For now, valid magic items usually have a type_rarity line or specific formatting.
  // Let's keep all and maybe filter by checks later.

  // Actually, "Magic Item Descriptions" is a section. "Attunement" is a section.
  // Items start after "Magic Item Descriptions".
  // We should probably filter out headers that appear BEFORE "Magic Item Descriptions".

  // Let's refining the parsing to only start capturing after "Magic Item Descriptions"
  // We can do this in a post-processing or just iterate.

  // Simple filter: Items usually have a 'type_rarity' field detected. If not, it might be a rules section.
  const validItems = items.filter((i) => i.type_rarity || i.description.length > 50);

  console.log(`✅ Extracted ${validItems.length} items.`);

  // Determine output dir
  const outDir = path.dirname(OUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(validItems, null, 2));
  console.log(`💾 Saved to ${OUT_PATH}`);
}

parseSRDItems();
