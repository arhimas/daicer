import { EntityMapper, GenerationRequest } from '@/features/genesis-core/mappers/entity-mapper';
import { SourceSpell } from '@/features/genesis-core/source-types';

export class SpellMapper extends EntityMapper<SourceSpell> {
  getUid(): string {
    return 'api::spell.spell';
  }

  map(spell: SourceSpell): GenerationRequest {
    const prompt = `
Generate a D&D 5e Spell based on the following reference data.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(spell)}

Instructions:
1. Map 'name', 'level', 'school', 'casting_time', 'range', 'components', 'duration' directly.
2. Convert 'desc' array into a single formatted Markdown string for the description.
3. If 'higher_level' exists, append it to the description or a specific field if available.
4. accurately map the school to the correct enum if needed (e.g., 'evocation').
5. Ensure 'slug' is kebab-case of the name.
`;

    return {
      uid: this.getUid(),
      prompt: prompt.trim(),
      referenceId: spell.index,
      name: spell.name,
    };
  }
}
