/* eslint-disable */

import { EntityMapper, GenerationRequest } from '@/features/genesis-core/mappers/entity-mapper';
import { DCMethodSchema } from '@/features/genesis-core/data/schemas/common-schemas'; // Using schema types if needed, but here we use manual mapping or source types

// Define SourceAction based on SourceMonster action structure
export interface SourceAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage?: Array<{
    damage_type?: { name: string; url: string };
    damage_dice?: string;
  }>;
  dc?: {
    dc_type: { name: string; url: string };
    dc_success: string;
  };
  usage?: any;
}

export class ActionMapper extends EntityMapper<SourceAction> {
  private monsterName: string;

  constructor(monsterName: string) {
    super();
    this.monsterName = monsterName;
  }

  getUid(): string {
    return 'api::action.action';
  }

  map(action: SourceAction): GenerationRequest {
    const slug = `monster-${this.slugify(this.monsterName)}-${this.slugify(action.name)}`;
    const prompt = `
Generate a D&D 5e Action based on the following reference data for "${this.monsterName}".
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(action)}

Instructions:
1. Map 'name' and 'desc' directly.
2. Determine 'type' (melee, ranged, utility) based on description or attack_bonus.
3. Map 'toHit' from 'attack_bonus'.
4. Map damage to 'damage_instances' component.
5. Map save DC to 'save' component if present.
6. Set 'slug' to "${slug}".
`;

    return {
      uid: this.getUid(),
      prompt: prompt.trim(),
      referenceId: slug, // Actions don't have global indices, use slug
      name: `${this.monsterName}: ${action.name}`,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
