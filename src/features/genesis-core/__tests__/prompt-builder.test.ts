import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptBuilder } from '../prompt-builder';
import { JsonSchemaBuilder } from '../json-schema-builder';

const mockBuild = vi.fn();
const mockSchemaBuilder = {
    build: mockBuild
} as unknown as JsonSchemaBuilder;

describe('PromptBuilder', () => {
    let builder: PromptBuilder;

    beforeEach(() => {
        builder = new PromptBuilder(mockSchemaBuilder);
        vi.clearAllMocks();
    });

    it('should build prompt and return schema', async () => {
        const mockSchema = { type: 'object', properties: { test: { type: 'string' } } };
        mockBuild.mockResolvedValue(mockSchema);

        const result = await builder.buildPrompt('api::test.test');

        expect(result.jsonSchema).toEqual(mockSchema);
        expect(result.systemPrompt).toContain('You are the Genesis Engine');
        expect(result.systemPrompt).toContain('"api::test.test"');
        expect(mockBuild).toHaveBeenCalledWith('api::test.test');
    });
});
