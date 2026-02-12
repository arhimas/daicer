// @ts-expect-error -- module alias not resolved in parser context
import type { ItemData } from '@scripts/genesis/srd-parser/types';
import { slugify } from '@scripts/genesis/srd-parser/types';

export interface ItemData {
  slug: string;
  name: string;
  type: string;
  rarity: string;
  requires_attunement: boolean;
  description: string;
  source_type_rarity: string; // Keep raw string for reference
}

export class ItemParser {
  public parseItems(sectionContent: string): ItemData[] {
    // Split by ### Headers
    // The section starts with ## Magic Item Descriptions
    // Items are ### Item Name

    // We can split by line starting with ###
    const chunks = sectionContent.split(/^###\s+/gm);
    // Remove the first chunk if it's just preamble
    if (chunks.length > 0 && !chunks[0].includes('_')) {
      // Heuristic: Items usually have the type/rarity line "_Weapon, rare_"
      // But some items might not.
      // The preamble of "Magic Item Descriptions" is usually empty or small.
      chunks.shift();
    }

    const items: ItemData[] = [];

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      const item = this.parseItemChunk(chunk);
      if (item) items.push(item);
    }

    return items;
  }

  private parseItemChunk(chunk: string): ItemData | null {
    const lines = chunk.split('\n');
    const name = lines[0].trim();

    let type = 'Unknown';
    let rarity = 'Unknown';
    let requires_attunement = false;
    let descriptionStartLine = -1;
    let rawTypeRarity = '';

    // Find the type/rarity line. usually matching _..._
    // Example: _Weapon (any sword), legendary (requires attunement)_

    for (let i = 0; i < lines.length; i++) {
      // Skip the name line (0)
      if (i === 0) continue;

      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('_') && line.endsWith('_')) {
        rawTypeRarity = line.replace(/_/g, '');
        descriptionStartLine = i + 1;

        // Basic parsing of raw string
        const lowerObj = rawTypeRarity.toLowerCase();

        if (lowerObj.includes('attunement')) {
          requires_attunement = true;
        }

        // Extract Rarity
        if (lowerObj.includes('legendary')) rarity = 'Legendary';
        else if (lowerObj.includes('very rare')) rarity = 'Very Rare';
        else if (lowerObj.includes('rare')) rarity = 'Rare';
        else if (lowerObj.includes('uncommon')) rarity = 'Uncommon';
        else if (lowerObj.includes('common')) rarity = 'Common';
        else if (lowerObj.includes('artifact')) rarity = 'Artifact';
        else rarity = 'Varies'; // default or 'Varies'

        // Extract Type (simple heuristic: text before comma)
        const parts = rawTypeRarity.split(',');
        if (parts.length > 0) {
          type = parts[0].trim();
        }
        break;
      }
    }

    if (descriptionStartLine === -1) {
      // Maybe it doesn't have a type line? (Artifacts might be different)
      // Or it's a sub-header like "Table: Scroll Mishaps"
      // If no type line found, assume description starts at 1
      descriptionStartLine = 1;
    }

    const description = lines.slice(descriptionStartLine).join('\n').trim();

    return {
      slug: slugify(name),
      name: name,
      type,
      rarity,
      requires_attunement,
      description,
      source_type_rarity: rawTypeRarity,
    };
  }
}
