import { EntityMapper, GenerationRequest } from '@/features/genesis-core/mappers/entity-mapper';
import { SourceRace } from '@/features/genesis-core/source-types';

export class RaceMapper extends EntityMapper<SourceRace> {
  getUid(): string {
    return 'api::race.race';
  }

  map(race: SourceRace): GenerationRequest {
    const prompt = `
Generate a D&D 5e Race based on the following reference data.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(race)}

Instructions:
1. Map 'name', 'speed', 'alignment', 'age', 'size', 'size_description', 'language_desc'.
2. Map 'ability_bonuses' to 'stats' modifiers if possible, or a specific component.
3. Map 'traits' and 'subraces'.
4. Ensure 'slug' is kebab-case of the name.
`;

    return {
      uid: this.getUid(),
      prompt: prompt.trim(),
      referenceId: race.index,
      name: race.name,
    };
  }
}
