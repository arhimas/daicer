
import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../world-generation';

// Mock LLM Utils
vi.mock('@/utils/llm/structured', () => ({
    generateStructured: vi.fn(),
}));

vi.mock('@/utils/prompt', () => ({
    getPrompt: vi.fn((key, lang, def) => Promise.resolve(def)),
    formatPrompt: vi.fn((p) => p),
}));

import { generateStructured } from '@/utils/llm/structured';

describe('WorldGeneration Service', () => {
    let strapi: any;
    let worldGenService: any;

    beforeEach(() => {
        strapi = {
            log: { info: vi.fn(), error: vi.fn() },
        };
        (generateStructured as any).mockReset();
        worldGenService = service({ strapi });
    });

    it('should generate structured world description', async () => {
        const mockData = {
            title: 'Kingdom of Tests',
            description: 'A land of high coverage.',
            atmosphere: 'Tense and verified.',
            keyLocations: [{ name: 'Test Valley', description: 'A quiet place.' }],
            threats: ['Regressions', 'Lint Errors'],
            hooks: ['Find the missing semi-colon.']
        };

        (generateStructured as any).mockResolvedValue(mockData);

        const settings = {
            playerCount: 4,
            adventureLength: 'Short',
            difficulty: 'Normal',
            theme: 'Fantasy',
            setting: 'Medieval',
            tone: 'Dark'
        };

        const result = await worldGenService.generateWorld(settings, 'en');

        expect(generateStructured).toHaveBeenCalled();
        expect(result).toContain('# Kingdom of Tests');
        expect(result).toContain('A land of high coverage.');
        expect(result).toContain('**Test Valley**: A quiet place.');
    });

    it('should handle optional dm style', async () => {
         const mockData = {
            title: 'Style World',
            description: 'Stylish.',
            atmosphere: 'Cool.',
            keyLocations: [],
            threats: [],
            hooks: []
        };
        (generateStructured as any).mockResolvedValue(mockData);

        const settings = {
            playerCount: 1,
            adventureLength: 'One Shot',
            difficulty: 'Easy',
            theme: 'SciFi',
            setting: 'Space',
            tone: 'Fun',
            dmStyle: { verbosity: 5, detail: 5, engagement: 5, narrative: 5 }
        };

        await worldGenService.generateWorld(settings);
        
        // We verify that it runs without error even with complex settings object
        expect(generateStructured).toHaveBeenCalledWith(
            expect.anything(), 
            expect.anything(), 
            expect.anything(), 
            expect.anything(), 
            expect.objectContaining({
                metadata: expect.objectContaining({ settings })
            })
        );
    });
});
