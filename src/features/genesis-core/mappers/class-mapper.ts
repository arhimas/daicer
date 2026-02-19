
import { EntityMapper, GenerationRequest } from './entity-mapper';
import { SourceClass } from '../source-types';

export class ClassMapper extends EntityMapper<SourceClass> {
    getUid(): string {
        return 'api::class.class';
    }

    map(cls: SourceClass): GenerationRequest {
        const prompt = `
Generate a D&D 5e Class based on the following reference data.
Ensure the output matches the provided JSON Schema strictly.

Reference Data:
${this.formatJson(cls)}

Instructions:
1. Map 'name', 'hit_die'.
2. Map 'proficiencies' and 'saving_throws' to relations (or just list them for now, the schema might require IDs if strict relations).
3. 'class_levels' contains the progression table URL, you might need to infer standard 5e progression or leave it for a separate 'ClassLevel' entity if that exists (check schema).
4. Map 'subclasses'.
5. Ensure 'slug' is kebab-case of the name.
`;

        return {
            uid: this.getUid(),
            prompt: prompt.trim(),
            referenceId: cls.index,
            name: cls.name
        };
    }
}
