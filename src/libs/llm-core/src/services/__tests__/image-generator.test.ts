import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from '@daicer/llm-core/services/image-generator';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent
    };
  }
}));

describe('ImageGenerator', () =>
  {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test_key';
  });

  it('should formulate the correct scale context and default text prompt based on targetSize', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      candidates: [{
        content: { parts: [{ inlineData: { data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } }] }
      }]
    });

    await ImageGenerator.generate({
      prompt: 'A red dragon',
      size: 64, // Huge D&D Size
      contextData: 'Dragon Lore'
    });

    // Check what was sent to Gemini
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    
    expect(callArgs.model).toBe('gemini-3.1-flash-image-preview');
    expect(callArgs.contents.parts[0].text).toContain('rendered at 64x64 pixels');
    expect(callArgs.contents.parts[0].text).toContain('which is 2 feet by 2 feet');
    expect(callArgs.contents.parts[0].text).toContain('LORE / DETAILS: Dragon Lore');
  });

  it('should inject a Blueprint Matrix silhouette if provided', async () => {
     mockGenerateContent.mockResolvedValueOnce({
      candidates: [{
        content: { parts: [{ inlineData: { data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } }] }
      }]
    });

    await ImageGenerator.generate({
      prompt: 'A human knight',
      size: 32,
      blueprintMatrix: [['#000000FF']],
    });

    const callArgs = mockGenerateContent.mock.calls[0][0];
    
    // Assert 2 parts exist: The silhouette image, and the text prompt
    expect(callArgs.contents.parts.length).toBe(2);
    
    const imagePart = callArgs.contents.parts[0];
    const textPart = callArgs.contents.parts[1];

    expect(imagePart.inlineData.mimeType).toBe('image/png');
    expect(imagePart.inlineData.data).toBeDefined();

    expect(textPart.text).toContain('A human knight');
    expect(textPart.text).toContain('Use the provided image as a loose blueprint or silhouette');
  });

  it('should throw immediately if GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(ImageGenerator.generate({
      prompt: 'Test',
      size: 32
    })).rejects.toThrow('GEMINI_API_KEY not configured');
  });
});
