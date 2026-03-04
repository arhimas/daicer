 

import { describe, it, expect, vi, beforeEach } from 'vitest';
import geminiServiceFactory from '../gemini-service';

// Mock Dependencies
vi.mock('@daicer/llm-core', () => ({
  GeminiService: vi.fn(() => ({ generate: vi.fn() })),
}));

import { GeminiService } from '@daicer/llm-core';

// const mockFindOne = vi.fn();
const mockFetchContext = vi.fn();

const mockStrapi: any = {
  log: { info: vi.fn() },
  db: {},
  getModel: vi.fn(),
  plugin: vi.fn(() => ({
    service: vi.fn((name) => {
      if (name === 'contextService') return { fetchDeepContext: mockFetchContext };
      return {};
    }),
    config: vi.fn(() => ({ types: [] })),
  })),
};

describe('Gemini Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = geminiServiceFactory({ strapi: mockStrapi });
  });

  it('should initialize LLM Core with adapter', () => {
    expect(GeminiService).toHaveBeenCalled();
    const callArgs = vi.mocked(GeminiService).mock.calls[0][0];
    expect(callArgs.adapter).toBeDefined();
    expect(callArgs.config).toBeDefined();
  });

  it('should wire up fetchContext in adapter', async () => {
    const callArgs = vi.mocked(GeminiService).mock.calls[0][0];
    const adapter = callArgs.adapter;

    mockFetchContext.mockResolvedValue({ id: 1 });
    const res = await adapter.fetchContext('uid', 'doc1');

    expect(mockFetchContext).toHaveBeenCalledWith('uid', 'doc1');
    expect(res).toEqual({ id: 1 });
  });

  describe('generatePixelDataV2 with Media Library Upload (PNG)', () => {
    let mockUploadService: any;
    let mockDocumentsUpdate: any;
    let mockCoreServiceGen: any;

    beforeEach(() => {
      mockUploadService = {
        upload: vi.fn(),
      };
      
      mockDocumentsUpdate = vi.fn();
      
      mockStrapi.plugin.mockImplementation((name: string) => {
        if (name === 'upload') return { service: () => mockUploadService };
        if (name === 'map-explorer') return { 
          service: () => ({ fetchDeepContext: mockFetchContext }),
          config: () => ({ types: [] }) 
        };
        return { service: vi.fn(), config: vi.fn() };
      });

      mockStrapi.documents = vi.fn(() => ({
        update: mockDocumentsUpdate,
      }));

      // Mock the llm-core GeminiService to return our specific processed base64
      mockCoreServiceGen = vi.fn().mockResolvedValue({
        pixelData: [['#ffffff']],
        base64Processed: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        base64Original: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      });

      vi.mocked(GeminiService).mockImplementation(() => ({
        generatePixelDataV2: mockCoreServiceGen,
        generateBlueprint: vi.fn(),
      } as any));

      // Re-init with mock changes
      service = geminiServiceFactory({ strapi: mockStrapi });
    });

    it('should save the processed PNG into the Strapi Media Library and update the sprite relation', async () => {
      // Mock the upload return with an ID
      mockUploadService.upload.mockResolvedValue([{ id: 999 }]);

      const genConfig = {
        type: 'Entity',
        archetype: 'goblin',
        size: 'small',
        blueprint: [['#000']],
        entityContext: {
          uid: 'api::entity.entity',
          documentId: 'doc-123'
        }
      };

      // We need to mock fs and os inline or rely on the actual filesystem (tmpdir) since it's just writing a tiny file.
      // Because we didn't mock fs at the top, it will actually write to OS temp dir and delete it.
      await service.generatePixelDataV2(genConfig);

      // Verify that core service was called
      expect(mockCoreServiceGen).toHaveBeenCalled();

      // Verify upload was called ONCE (since we deleted the original upload logic to strictly enforce 1 field)
      expect(mockUploadService.upload).toHaveBeenCalledTimes(1);

      const uploadArgs = mockUploadService.upload.mock.calls[0][0];
      expect(uploadArgs.data.fileInfo.name).toBe('entity_goblin_sprite');
      expect(uploadArgs.files.mimetype).toBe('image/png');

      // Verify the document was updated with the sprite
      expect(mockDocumentsUpdate).toHaveBeenCalledWith({
        documentId: 'doc-123',
        data: {
          sprite: 999, // Our mocked upload ID
          spriteData: ['#ffffff'], // The flattened pixel array
        },
        status: 'draft',
      });
    });


  });
});
