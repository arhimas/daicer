
import { EntityMapper, GenerationRequest } from './entity-mapper';
import { SourceMonster } from '@/features/genesis-core/source-types';

export class MonsterMapper extends EntityMapper<SourceMonster> {
    getUid(): string {
        return 'api::entity.entity'; // Strapi UID
    }

    // Override to indicate we want a custom schema for generation
    getSchemaIdentifier(): string {
        return 'monster-blueprint';
    }

    map(monster: SourceMonster): GenerationRequest {
        const prompt = `
Generate a D&D 5e Monster Blueprint based on the following reference data.
Match the JSON Schema exactly.

Reference Data:
${this.formatJson(monster)}

Instructions:
1. Map core stats.
2. Flatten 'proficiencies' to simple objects.
3. Include 'actions' inline.
4. Ensure 'slug' is kebab-case.
5. Stats should be nested in 'stats' object.
`;

        return {
            uid: this.getUid(),
            prompt: prompt.trim(),
            referenceId: monster.index,
            name: monster.name
        };
    }
}
