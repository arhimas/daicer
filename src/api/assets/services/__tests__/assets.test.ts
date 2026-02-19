import { describe, it, expect, vi, beforeEach } from 'vitest';
import assetsServiceFactory from '@/api/assets/services/assets';

// Mock LLM Image Util
vi.mock('@/utils/llm/image', () => ({
  generateImageGemini: vi.fn(),
}));
import { generateImageGemini } from '@/utils/llm/image';

describe('AssetsService', () => {
    let service: any;
    let mockStrapi: any;
    let mockQuery: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockQuery = { findOne: vi.fn() };
        mockStrapi = {
            log: { info: vi.fn() },
            db: {
                query: vi.fn(() => mockQuery)
            }
        };
        service = assetsServiceFactory({ strapi: mockStrapi });
    });

    describe('generatePortrait', () => {
        it('should generate portrait with prompts', async () => {
             mockQuery.findOne.mockResolvedValue({ text: 'Master Prompt' });
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,123' });

             const payload = { name: 'Hero', basePrompt: 'A warrior' };
             const result = await service.generatePortrait({ payload });

             expect(mockStrapi.db.query).toHaveBeenCalledWith('api::prompt.prompt');
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     prompt: expect.stringContaining('Master Prompt'),
                 }),
                 'gemini-3-pro-image-preview'
             );
             expect(result.data).toBe('123');
        });

        it('should use reference image', async () => {
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,123' });
             const payload = { name: 'Hero' };
             const referenceImage = 'data:image/png;base64,ref';
             
             await service.generatePortrait({ payload, referenceImage });
             
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     referenceImages: expect.arrayContaining([{ mimeType: 'image/png', data: 'ref' }])
                 }),
                 expect.anything()
             );
        });
    });

    describe('generateUpperBody', () => {
        it('should use portrait as reference', async () => {
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,456' });
             const payload = { name: 'Hero' };
             const portrait = { data: 'portrait-data' };
             
             await service.generateUpperBody({ payload, portrait });
             
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     referenceImages: [{ mimeType: 'image/png', data: 'portrait-data' }]
                 })
             );
        });

         it('should override with explicit reference', async () => {
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,456' });
             const payload = { name: 'Hero' };
             const portrait = { data: 'portrait-data' };
             const referenceImage = 'data:image/png;base64,override';
             
             await service.generateUpperBody({ payload, portrait, referenceImage });
             
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     referenceImages: [{ mimeType: 'image/png', data: 'override' }]
                 })
             );
        });
    });

    describe('generateFullBody', () => {
        it('should use upperBody as reference', async () => {
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,789' });
             const payload = { name: 'Hero' };
             const upperBody = { data: 'upper-data' };
             
             await service.generateFullBody({ payload, upperBody });
             
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     referenceImages: [{ mimeType: 'image/png', data: 'upper-data' }]
                 })
             );
        });

        it('should fallback to portrait', async () => {
             (generateImageGemini as any).mockResolvedValue({ url: 'data:image/png;base64,789' });
             const payload = { name: 'Hero' };
             const portrait = { data: 'portrait-data' };
             
             await service.generateFullBody({ payload, portrait });
             
             expect(generateImageGemini).toHaveBeenCalledWith(
                 expect.objectContaining({
                     referenceImages: [{ mimeType: 'image/png', data: 'portrait-data' }]
                 })
             );
        });
    });
});
