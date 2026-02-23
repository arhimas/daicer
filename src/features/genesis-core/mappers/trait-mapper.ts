import { EntityMapper, GenerationRequest } from './entity-mapper';
import { SourceRef } from '@/features/genesis-core/source-types';

export class TraitMapper extends EntityMapper<SourceRef> {
    getUid(): string {
        return 'api::trait.trait'; // Assuming this is the UID for traits
    }

    map(trait: SourceRef): GenerationRequest {
        const prompt = `
Generate a D&D 5e Racial Trait based on the following reference.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(trait)}

Instructions:
1. Map 'name' directly.
2. Use the 'url' or 'index' to fetch the full description if possible, or generate a placeholder description if source is just a reference. 
   (Note: SourceRef for traits in Race JSON usually just has index/name/url. We might need to load the full Trait JSON if we want full text.)
   For now, we will ask the LLM to generate the standard 5e description for '${trait.name}' based on its knowledge, using the reference as a ground truth for the name.
3. Ensure 'slug' is kebab-case of the name.
`;

        return {
            uid: this.getUid(),
            prompt: prompt.trim(),
            referenceId: trait.index,
            name: trait.name
        };
    }
}
