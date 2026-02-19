import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Strapi factories to bypass core logic
vi.mock('@strapi/strapi', () => ({
    factories: {
        createCoreService: vi.fn((uid, cb) => cb)
    }
}));

import knowledgeSourceServiceFactory from '@/api/knowledge-source/services/knowledge-source';

// Mock dependencies
vi.mock('@/shared', () => ({
    chunkMarkdown: vi.fn(),
}));

import { chunkMarkdown } from '@/shared';

describe('KnowledgeSource Service', () => {
    let strapi: any;
    let service: any;

    beforeEach(() => {
        strapi = {
            entityService: {
                findOne: vi.fn(),
                create: vi.fn(),
            },
            db: {
                query: vi.fn().mockReturnValue({
                    deleteMany: vi.fn(),
                }),
            },
            log: { info: vi.fn(), error: vi.fn() },
        };
        // Factory pattern for core service
        service = knowledgeSourceServiceFactory({ strapi });
    });

    describe('sync', () => {
        it('should throw if source not found', async () => {
            strapi.entityService.findOne.mockResolvedValue(null);
            await expect(service.sync(1)).rejects.toThrow('Knowledge Source 1 not found');
        });

        it('should process chunks and create snippets', async () => {
            strapi.entityService.findOne.mockResolvedValue({
                id: 1,
                name: 'Test Source',
                content: '# Header\nSome content here.',
                tags: [{ name: 'Rule' }]
            });

            (chunkMarkdown as any).mockResolvedValue([
                { title: 'Chunk 1', content: 'Valid content length > 10 chars.' },
                { title: 'Chunk 2', content: 'Short' } // Should be skipped (<10 chars)
            ]);

            await service.sync(1);

            // 1. Chunking called
            expect(chunkMarkdown).toHaveBeenCalledWith('# Header\nSome content here.');

            // 2. Delete old
            expect(strapi.db.query).toHaveBeenCalledWith('api::knowledge-snippet.knowledge-snippet');
            
            // 3. Create new (only valid chunks)
            expect(strapi.entityService.create).toHaveBeenCalledTimes(1);
            expect(strapi.entityService.create).toHaveBeenCalledWith('api::knowledge-snippet.knowledge-snippet', expect.objectContaining({
                data: expect.objectContaining({
                    title: 'Chunk 1',
                    content: '[Tags: Rule]\nValid content length > 10 chars.',
                    source: 1,
                    sourceType: 'manual'
                })
            }));
        });

        it('should handle errors gracefully', async () => {
            strapi.entityService.findOne.mockRejectedValue(new Error('DB Error'));
            await expect(service.sync(1)).rejects.toThrow('DB Error');
            expect(strapi.log.error).toHaveBeenCalled();
        });
    });
});
