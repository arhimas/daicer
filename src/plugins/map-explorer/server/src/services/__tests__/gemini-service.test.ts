import { describe, it, expect, vi, beforeEach } from 'vitest';
import geminiServiceFactory from '../gemini-service';

// Mock LangChain
const { mockInvoke, mockWithStructuredOutput, mockChatGoogleGenerativeAI } = vi.hoisted(() => {
    const mockInvoke = vi.fn();
    const mockWithStructuredOutput = vi.fn().mockReturnValue({ invoke: mockInvoke });
    const mockChatGoogleGenerativeAI = vi.fn(function() {
        return { withStructuredOutput: mockWithStructuredOutput };
    });
    return { mockInvoke, mockWithStructuredOutput, mockChatGoogleGenerativeAI };
});

vi.mock('@langchain/google-genai', () => ({
    ChatGoogleGenerativeAI: mockChatGoogleGenerativeAI
}));

describe('GeminiService', () => {
  let service: ReturnType<typeof geminiServiceFactory>;
  
  // Mock Strapi DB for Prompts
  const mockFindOne = vi.fn();
  const mockStrapi = {
    log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    db: {
        query: vi.fn().mockReturnValue({
            findOne: mockFindOne
        })
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    service = geminiServiceFactory({ strapi: mockStrapi });
    
    // Default Prompt Mock
    mockFindOne.mockResolvedValue({
        key: 'test-prompt',
        text: 'System Prompt: {{width}}x{{height}} {{specificInstruction}}'
    });
  });

  describe('generatePixelData', () => {
    it('should call LangChain and return processed data', async () => {
      // Mock Response from LangChain
      mockInvoke.mockResolvedValueOnce({
        pixelData: Array(32).fill(Array(32).fill('#FF0000'))
      });

      const config = {
        prompt: 'Test Dragon',
        type: 'Monster',
        archetype: 'Dragon',
        blueprint: [],
        model: 'gemini-3-flash-preview',
        width: 32,
        height: 32
      };

      // @ts-expect-error - Mock config
      const result = await service.generatePixelData(config);
      
      expect(mockChatGoogleGenerativeAI).toHaveBeenCalled();
      expect(mockWithStructuredOutput).toHaveBeenCalled();
      expect(mockInvoke).toHaveBeenCalled();
      
      expect(result.pixelData.length).toBe(32);
      expect(result.pixelData[0][0]).toBe('#FF0000');
    });

    it('should throw error if API key missing', async () => {
      delete process.env.GEMINI_API_KEY;
      const config = { prompt: 'Test', type: 'Monster', archetype: 'Humanoid', blueprint: [] };
      // @ts-expect-error - Mock config
      await expect(service.generatePixelData(config)).rejects.toThrow('GEMINI_API_KEY not configured');
    });
    
    it('should fail if Prompt Template is missing', async () => {
        mockFindOne.mockResolvedValueOnce(null); // Simulate missing prompt

        const config = {
            prompt: 'Test',
            type: 'Monster',
            archetype: 'Humanoid',
            blueprint: []
        };
        // @ts-expect-error - Mock config
        await expect(service.generatePixelData(config)).rejects.toThrow();
    });
  });

  describe('validateAndRepairGrid', () => {
    it('should return empty 32x32 if input is invalid', () => {
      const result = service.validateAndRepairGrid(null);
      expect(result.length).toBe(32);
      expect(result[0].length).toBe(32);
      expect(result[0][0]).toBe('transparent');
    });

    // Flattened array test removed as strict 2D is enforced
    it('should handle invalid rows gracefully', () => {
        const invalid = ['not-an-array'];
        const result = service.validateAndRepairGrid(invalid);
        expect(result[0][0]).toBe('transparent');
    });

    it('should truncate oversized grids', () => {
        const bigGrid = Array(40).fill(Array(40).fill('#000'));
        const result = service.validateAndRepairGrid(bigGrid);
        expect(result.length).toBe(32);
        expect(result[0].length).toBe(32);
    });
  });
});
