import { EntityMapper, GenerationRequest } from './entity-mapper';
import { SourceItem } from '@/features/genesis-core/source-types';

export class ItemMapper extends EntityMapper<SourceItem> {
  getUid(): string {
    return 'api::item.item'; // Assuming UID for items/equipment
  }

  map(item: SourceItem): GenerationRequest {
    const prompt = `
Generate a D&D 5e Item (Equipment) based on the following reference.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(item)}

Instructions:
1. Map 'name', 'cost', 'weight' directly.
2. Map 'equipment_category' to the item type/category.
3. If it's a weapon, map 'damage', 'range', 'properties'. For 'properties', use the property name (slug) as a string.
4. If it's armor, map 'armor_class', 'str_minimum', 'stealth_disadvantage'.
5. Convert 'desc' array to Markdown description (if present).
6. Ensure 'slug' is kebab-case of the name.
`;

    return {
      uid: this.getUid(),
      prompt: prompt.trim(),
      referenceId: item.index,
      name: item.name,
    };
  }
}
