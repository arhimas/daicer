import { test, expect, vi } from 'vitest';
import createGeminiService from '@daicer/llm-core/services/gemini';

test('generatePixelDataV2 executes without formatting crash', async () => {
  const mockAdapter: any = {
    log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    db: { query: vi.fn().mockReturnValue({ findOne: vi.fn(), findMany: vi.fn().mockResolvedValue([]) }) }
  };
  
  const mockConfig: any = {
    contentTypes: { prompt: 'prompt', zone: 'zone', blueprint: 'blueprint' }
  };

  const service = createGeminiService({ adapter: mockAdapter, config: mockConfig });
  
  // Create a spy to bypass actual LLM invocation, but test Zod schemas
  service.getModel = vi.fn().mockResolvedValue({
      withStructuredOutput: vi.fn().mockReturnValue({
          invoke: vi.fn().mockResolvedValue({
              palette: { 'x': 'f00f', '#': '0f0f' },
              asciiGrid: [
                  'x # x',
                  '  #  ',
                  'x # x'
              ]
          })
      }),
      temperature: 0.1,
      topP: 0.1,
  });

  service.formatPrompt = vi.fn().mockResolvedValue('MOCK SYSTEM PROMPT');

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
