import { EntityMapper, GenerationRequest } from './entity-mapper';
import { SourceRef } from '../source-types';

export class FeatureMapper extends EntityMapper<SourceRef> {
    getUid(): string {
        return 'api::feature.feature'; // Assuming UID
    }

    map(feature: SourceRef): GenerationRequest {
        const prompt = `
Generate a D&D 5e Class Feature based on the following reference.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(feature)}

Instructions:
1. Map 'name' directly.
2. Generate the standard 5e description for the feature '${feature.name}'.
3. Ensure 'slug' is kebab-case of the name.
`;

        return {
            uid: this.getUid(),
            prompt: prompt.trim(),
            referenceId: feature.index,
            name: feature.name
        };
    }
}
