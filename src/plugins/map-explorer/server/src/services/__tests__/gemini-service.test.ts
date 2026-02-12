import { describe, it, expect, vi, beforeEach } from 'vitest';
import geminiServiceFactory from '@/plugins/map-explorer/server/src/services/gemini-service';
import { GeminiService } from '@daicer/llm-core';

// Mock @daicer/llm-core
vi.mock('@daicer/llm-core', () => ({
  GeminiService: vi.fn(() => ({
    generate: vi.fn(),
    dispatch: vi.fn(),
  })),
}));

describe('Map Explorer - Gemini Service', () => {
  let mockStrapi: any;
  let mockContextService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContextService = {
      fetchDeepContext: vi.fn().mockResolvedValue({ context: 'deep' }),
    };

    const mockPlugin = {
      service: vi.fn((name) => {
        if (name === 'contextService') return mockContextService;
        return {};
      }),
      config: vi.fn((key) => {
        if (key === 'contentTypes') return ['api::test.test'];
        return {};
      }),
    };

    mockStrapi = {
      log: { info: vi.fn(), error: vi.fn() },
      db: {},
      getModel: vi.fn(),
      plugin: vi.fn(() => mockPlugin),
    };
  });

  it('should initialize GeminiService with correct adapter and config', () => {
    geminiServiceFactory({ strapi: mockStrapi });

    expect(GeminiService).toHaveBeenCalledTimes(1);

    const callArgs = (GeminiService as any).mock.calls[0][0];

    // Check Adapter
    expect(callArgs.adapter).toBeDefined();
    expect(callArgs.adapter.log).toBe(mockStrapi.log);
    expect(callArgs.adapter.db).toBe(mockStrapi.db);

    // Check Config
    expect(callArgs.config).toBeDefined();
    expect(callArgs.config.contentTypes).toEqual(['api::test.test']);
    expect(mockStrapi.plugin).toHaveBeenCalledWith('map-explorer');
  });

  it('adapter.fetchContext should delegate to contextService.fetchDeepContext', async () => {
    geminiServiceFactory({ strapi: mockStrapi });
    const callArgs = (GeminiService as any).mock.calls[0][0];
    const fetchContext = callArgs.adapter.fetchContext;

    const result = await fetchContext('api::test.uid', 'doc-123');

    expect(mockStrapi.plugin).toHaveBeenCalledWith('map-explorer');
    expect(mockStrapi.plugin('map-explorer').service).toHaveBeenCalledWith('contextService');
    expect(mockContextService.fetchDeepContext).toHaveBeenCalledWith('api::test.uid', 'doc-123');
    expect(result).toEqual({ context: 'deep' });
  });

  it('adapter.getModel should call strapi.getModel', async () => {
    geminiServiceFactory({ strapi: mockStrapi });
    const callArgs = (GeminiService as any).mock.calls[0][0];
    const getModel = callArgs.adapter.getModel;

    getModel('api::test.uid');
    expect(mockStrapi.getModel).toHaveBeenCalledWith('api::test.uid');
  });
});
