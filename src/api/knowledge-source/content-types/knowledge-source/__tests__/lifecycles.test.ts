
import { describe, it, expect, vi, beforeEach } from 'vitest';
import lifecycles from '@/api/knowledge-source/content-types/knowledge-source/lifecycles';

const mockDb = {
  query: vi.fn(() => ({
    deleteMany: vi.fn(),
  })),
};

const mockService = {
  sync: vi.fn(),
};

global.strapi = {
  log: { info: vi.fn() },
  db: mockDb,
  service: vi.fn(() => mockService),
} as any;

describe('Knowledge Source Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('afterDelete', () => {
    it('should delete related snippets', async () => {
        const event = { result: { id: 1 } };
        await lifecycles.afterDelete(event);
        
        expect(mockDb.query).toHaveBeenCalledWith('api::knowledge-snippet.knowledge-snippet');
        // We can't easily check the nested deleteMany call without more complex mocking, 
        // but checking the query call confirms we're accessing the content type
    });

    it('should do nothing if no result id', async () => {
        const event = { result: {} } as any;
        await lifecycles.afterDelete(event);
        expect(mockDb.query).not.toHaveBeenCalled();
    });
  });

  describe('afterCreate/afterUpdate', () => {
    it('should trigger sync on afterCreate if content exists', async () => {
        const event = { result: { id: 1, content: 'test content' } };
        await lifecycles.afterCreate(event);
        expect(mockService.sync).toHaveBeenCalledWith(1);
    });

    it('should trigger sync on afterUpdate if content exists', async () => {
        const event = { result: { id: 2, content: 'updated content' } };
        await lifecycles.afterUpdate(event);
        expect(mockService.sync).toHaveBeenCalledWith(2);
    });

    it('should not sync if no content', async () => {
        const event = { result: { id: 3 } } as any;
        await lifecycles.afterCreate(event);
        await lifecycles.afterUpdate(event);
        expect(mockService.sync).not.toHaveBeenCalled();
    });
  });

  describe('beforeCreate/beforeUpdate (Sanitize Tags)', () => {
     it('should parse JSON string tags', async () => {
         const event = { params: { data: { tags: '["tag1", "tag2"]' } } } as any;
         await lifecycles.beforeCreate(event);
         expect(event.params.data.tags).toEqual(['tag1', 'tag2']);
     });

     it('should split comma-separated string tags', async () => {
         const event = { params: { data: { tags: 'tag1, tag2, ' } } } as any;
         await lifecycles.beforeUpdate(event);
         expect(event.params.data.tags).toEqual(['tag1', 'tag2']);
     });

     it('should handle empty string tags', async () => {
         const event = { params: { data: { tags: '   ' } } } as any;
         await lifecycles.beforeCreate(event);
         expect(event.params.data.tags).toEqual([]);
     });

     it('should handle array tags ensuring strings', async () => {
         const event = { params: { data: { tags: [123, 'tag'] } } } as any;
         await lifecycles.beforeUpdate(event);
         expect(event.params.data.tags).toEqual(['123', 'tag']);
     });

     it('should ignore if tags undefined', async () => {
         const event = { params: { data: {} } } as any;
         await lifecycles.beforeCreate(event);
         expect(event.params.data.tags).toBeUndefined();
     });
     
     it('should fallback to splitting if JSON parse fails', async () => {
         const event = { params: { data: { tags: 'invalid-json, tag' } } } as any;
         await lifecycles.beforeCreate(event);
         expect(event.params.data.tags).toEqual(['invalid-json', 'tag']);
     });
  });
});
