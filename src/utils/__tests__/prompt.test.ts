
import { getPrompt, getPrompts, formatPrompt } from '../prompt';
// import type { Language } from '../api/game/src/engine/types';

// Mock Strapi global
const mockFindMany = vi.fn();
global.strapi = {
    documents: vi.fn(() => ({
        findMany: mockFindMany
    })),
    log: { warn: vi.fn() }
} as any;

describe('Prompt Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPrompt', () => {
        it('should return text if prompt exists', async () => {
            mockFindMany.mockResolvedValueOnce([{ text: 'Hello World', documentId: '1' }]);
            
            const result = await getPrompt('greeting', 'en', 'Default');
            expect(result).toBe('Hello World');
            expect(mockFindMany).toHaveBeenCalledWith({
                filters: { key: 'greeting' },
                locale: 'en'
            });
        });

        it('should return default text if prompt not found', async () => {
            mockFindMany.mockResolvedValueOnce([]); // Empty result

            const result = await getPrompt('missing', 'en', 'Default');
            expect(result).toBe('Default');
        });

        it('should return default text on error', async () => {
            mockFindMany.mockRejectedValueOnce(new Error('DB Error'));

            const result = await getPrompt('error_key', 'en', 'Default');
            expect(result).toBe('Default');
            expect(global.strapi.log.warn).toHaveBeenCalled();
        });
    });

    describe('getPrompts', () => {
        it('should fetch multiple prompts', async () => {
            mockFindMany
                .mockResolvedValueOnce([{ text: 'Value 1' }])
                .mockResolvedValueOnce([{ text: 'Value 2' }]);

            const results = await getPrompts(['key1', 'key2'], 'en', { key1: 'D1', key2: 'D2' });
            
            expect(results).toEqual({
                key1: 'Value 1',
                key2: 'Value 2'
            });
        });
    });

    describe('formatPrompt', () => {
        it('should replace variables', () => {
            const template = 'Hello {{name}}!';
            const result = formatPrompt(template, { name: 'World' });
            expect(result).toBe('Hello World!');
        });

        it('should keep placeholders if variable missing', () => {
            const template = 'Hello {{name}}!';
            const result = formatPrompt(template, {});
            expect(result).toBe('Hello {{name}}!');
        });
    });
});
