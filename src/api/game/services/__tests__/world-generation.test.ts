
import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '@/api/game/services/world-generation';

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
    it('should format prompt if it contains {{theme}} placeholder', async () => {
        const mockTemplate = "World with {{theme}} and {{dmStyleSummary}}";
        // Mock getPrompt to return a template
        const { getPrompt } = await import('@/utils/prompt');
        (getPrompt as any).mockResolvedValue(mockTemplate);

        const mockData = {
            title: 'Template World',
            description: 'Generated from template.',
            atmosphere: 'Templated.',
            keyLocations: [],
            threats: [],
            hooks: []
        };
        (generateStructured as any).mockResolvedValue(mockData);

        const settings = {
            playerCount: 3,
            adventureLength: 'Long',
            difficulty: 'Hard',
            theme: 'Horror',
            setting: 'Castle',
            tone: 'Scary',
            dmStyle: { verbosity: 0, detail: 0, engagement: 0, narrative: 0 } // index 0 maps
        };

        const { formatPrompt } = await import('@/utils/prompt');
        
        await worldGenService.generateWorld(settings);

        expect(formatPrompt).toHaveBeenCalledWith(
            mockTemplate,
            expect.objectContaining({
                theme: 'Horror',
                dmStyleSummary: expect.stringContaining('Whisper'), // Verbosity 0
            })
        );
    });

    it('should handle optional DM style fields (specialMode, customDirectives)', async () => {
         const mockTemplate = "Style: {{dmStyleSummary}} {{theme}}";
         const { getPrompt } = await import('@/utils/prompt');
         (getPrompt as any).mockResolvedValue(mockTemplate);
         (generateStructured as any).mockResolvedValue({ title: 'T', description: 'D', atmosphere: 'A', keyLocations: [], threats: [], hooks: [] });

         const settings = {
             playerCount: 1,
             adventureLength: 'L',
             difficulty: 'D',
             theme: 'T',
             setting: 'S',
             tone: 'T',
             dmStyle: { 
                 verbosity: 1, detail: 1, engagement: 1, narrative: 1,
                 specialMode: 'Improv',
                 customDirectives: 'Be vague'
             }
         };

         const { formatPrompt } = await import('@/utils/prompt');
         await worldGenService.generateWorld(settings);

         expect(formatPrompt).toHaveBeenCalledWith(
             expect.anything(),
             expect.objectContaining({
                 dmStyleSummary: expect.stringContaining('Performance Mode: Improv')
             })
         );
    });
    
    it('should handle missing DM style gracefully', async () => {
         const mockTemplate = "Style: {{dmStyleSummary}} {{theme}}";
         const { getPrompt } = await import('@/utils/prompt');
         (getPrompt as any).mockResolvedValue(mockTemplate);
         (generateStructured as any).mockResolvedValue({ title: 'T', description: 'D', atmosphere: 'A', keyLocations: [], threats: [], hooks: [] });
         
         const settings = {
             playerCount: 1, adventureLength: 'L', difficulty: 'D', theme: 'T', setting: 'S', tone: 'T',
             dmStyle: undefined
         };
         
         const { formatPrompt } = await import('@/utils/prompt');
         await worldGenService.generateWorld(settings);
         
         expect(formatPrompt).toHaveBeenCalledWith(
             expect.anything(),
             expect.objectContaining({
                 dmStyleSummary: 'Standard DM Style'
             })
         );
    });
});
