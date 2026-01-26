import { describe, it, expect, vi, beforeEach } from 'vitest';
import geminiServiceFactory from '../gemini-service';

// Mock dependencies
const { mockGenerateContent } = vi.hoisted(() => ({
    mockGenerateContent: vi.fn()
}));

vi.mock('@google/genai', () => {
    class MockGoogleGenAI {
        models = { generateContent: mockGenerateContent };
        getGenerativeModel = vi.fn();
    }
    
    return {
        GoogleGenAI: MockGoogleGenAI,
        Type: { ARRAY: 'ARRAY', STRING: 'STRING' },
    };
});

describe('GeminiService', () => {
  let service: ReturnType<typeof geminiServiceFactory>;
  const mockStrapi = {
    log: { error: vi.fn(), info: vi.fn() },
    config: { get: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    service = geminiServiceFactory({ strapi: mockStrapi });
  });

  describe('enhancePrompt', () => {
    it('should enhance Terrain prompts with tiling context', () => {
      const prompt = service.enhancePrompt('Grass', 'Terrain', 'Landscape/Floor');
      expect(prompt).toContain('seamless, tiling texture');
      expect(prompt).toContain('Top-down RPG map tile');
    });

    it('should enhance Item prompts with inventory context', () => {
      const prompt = service.enhancePrompt('Sword', 'Item', 'Sword');
      expect(prompt).toContain('iconic inventory sprite');
      expect(prompt).toContain('Legendary RPG item');
    });

    it('should enhance Creature prompts with battle sprite context', () => {
      const prompt = service.enhancePrompt('Goblin', 'Monster', 'Humanoid');
      expect(prompt).toContain('character sprite');
      expect(prompt).toContain('Dynamic top-down/isometric perspective');
    });
  });

  describe('gridToAscii', () => {
    it('should convert blueprint to ASCII', () => {
      const blueprint = [
        ['none', 'head'],
        ['core', 'weapon']
      ];
      // @ts-expect-error - Mocking internal method access
      const ascii = service.gridToAscii(blueprint);
      expect(ascii).toBe('.O\n#X');
    });
  });

  describe('validateAndRepairGrid', () => {
    it('should return empty 32x32 if input is invalid', () => {
      const result = service.validateAndRepairGrid(null);
      expect(result.length).toBe(32);
      expect(result[0].length).toBe(32);
      expect(result[0][0]).toBe('transparent');
    });

    it('should repair flattened array', () => {
        const flat = Array(1024).fill('#FFFFFF');
        const result = service.validateAndRepairGrid(flat);
        expect(result.length).toBe(32);
        expect(result[0].length).toBe(32);
        expect(result[0][0]).toBe('#FFFFFF');
    });

    it('should truncate oversized grids', () => {
        const bigGrid = Array(40).fill(Array(40).fill('#000'));
        const result = service.validateAndRepairGrid(bigGrid);
        expect(result.length).toBe(32);
        expect(result[0].length).toBe(32);
    });
  });

  describe('cleanJson', () => {
    it('should clean markdown blocks', () => {
      const raw = "```json\n[[\"#FFF\"]]\n```";
      const clean = service.cleanJson(raw);
      expect(clean).toBe('[["#FFF"]]');
    });

    it('should fix single quotes', () => {
      const raw = "[['#FFF']]";
      const clean = service.cleanJson(raw);
      expect(clean).toBe('[["#FFF"]]');
    });
  });

  describe('generatePixelData', () => {
    it('should call Gemini API and return processed data', async () => {
      const mockPixelData = Array(32).fill(Array(32).fill('#FF0000'));
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockPixelData)
      });

      const config = {
        prompt: 'Test',
        type: 'Monster',
        archetype: 'Humanoid',
        blueprint: Array(32).fill(Array(32).fill('none')),
        model: 'gemini-test'
      };

      // @ts-expect-error - Mock generation config
      const result = await service.generatePixelData(config);
      
      // Removed mockGoogleGenAI check as it is now internal to the factory
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(result.pixelData.length).toBe(32);
      expect(result.enhancedPrompt).toBeDefined();
    });

    it('should throw error if API key missing', async () => {
      delete process.env.GEMINI_API_KEY;
      const config = { prompt: 'Test', type: 'Monster', archetype: 'Humanoid', blueprint: [] };
      // @ts-expect-error - Mock generation config
      await expect(service.generatePixelData(config)).rejects.toThrow('GEMINI_API_KEY not configured');
    });
  });
});
