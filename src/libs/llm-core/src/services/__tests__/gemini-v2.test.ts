import { test, expect, vi } from 'vitest';
import createGeminiService from '@daicer/llm-core/services/gemini';
import { ImageGenerator } from '@daicer/llm-core/services/image-generator';

vi.mock('@daicer/llm-core/services/image-generator', () => ({
  ImageGenerator: {
    generate: vi.fn()
  }
}));

test('generatePixelDataV2 executes without formatting crash', async () => {
  const mockAdapter: any = {
    log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    db: { query: vi.fn().mockReturnValue({ findOne: vi.fn(), findMany: vi.fn().mockResolvedValue([]) }) }
  };
  
  const mockConfig: any = {
    contentTypes: { prompt: 'prompt', zone: 'zone', blueprint: 'blueprint' }
  };

  const service = createGeminiService({ adapter: mockAdapter, config: mockConfig });
  
  vi.mocked(ImageGenerator.generate).mockResolvedValue({
    base64Original: 'data:image/png;base64,mock',
    base64Processed: 'data:image/png;base64,mock2',
    hexArray: [
      ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
      ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
      ['transparent', 'transparent', '#00FF00FF', 'transparent', 'transparent'],
      ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
      ['transparent', 'transparent', 'transparent', 'transparent', 'transparent']
    ]
  });

  const configParams = {
      prompt: 'Test target prompt',
      type: 'Entity' as any,
      archetype: 'Humanoid',
      blueprint: [['none']] as any,
      width: 5,
      height: 5,
  };

  const result = await service.generatePixelDataV2(configParams);
  
  // It should parse this into a 5x5 colored grid mapped exactly by the Transformer
  expect(result.pixelData.length).toBe(5);
  expect(result.pixelData[0].length).toBe(5);
  expect(result.pixelData[2][2]).toBe('#00FF00FF'); // The center '#'
});
