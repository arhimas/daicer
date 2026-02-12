import { describe, it, expect, vi, beforeEach } from 'vitest';
import worldGenerationFactory from '../world-generation';

// Mock utils
vi.mock('@/utils/llm/structured', () => ({
  generateStructured: vi.fn(),
}));
import { generateStructured } from '@/utils/llm/structured';

vi.mock('@/utils/prompt', () => ({
  getPrompt: vi.fn(),
  formatPrompt: vi.fn((t) => t),
}));
import { getPrompt } from '@/utils/prompt';

describe('WorldGenerationService', () => {
    let service: any;
    let mockStrapi: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockStrapi = {
            log: { info: vi.fn() },
        };
        service = worldGenerationFactory({ strapi: mockStrapi });
    });

    describe('generateWorld', () => {
        it('should generate world description', async () => {
             const settings = {
                 playerCount: 4,
                 adventureLength: 'Short',
                 difficulty: 'Medium',
                 theme: 'Dark Fantasy',
                 setting: 'Urban',
                 tone: 'Gritty',
             };

             (getPrompt as any).mockResolvedValue('System Prompt');
             
             (generateStructured as any).mockResolvedValue({
                 title: 'The Dark City',
                 description: 'A gloomy place.',
                 atmosphere: 'Foggy and damp.',
                 keyLocations: [{ name: 'Tavern', description: 'Old' }],
                 threats: ['Rats'],
                 hooks: ['Find the cat'],
             });

             const result = await service.generateWorld(settings);

             expect(result).toContain('# The Dark City');
             expect(result).toContain('A gloomy place.');
             expect(result).toContain('**Tavern**: Old');
             expect(result).toContain('- Rats');
             expect(generateStructured).toHaveBeenCalledWith(
                 expect.anything(), // Schema
                 'System Prompt',
                 expect.stringContaining('Generate a campaign world'),
                 'en',
                 expect.objectContaining({
                     tags: expect.arrayContaining(['world-generation'])
                 })
             );
        });
    });
});
