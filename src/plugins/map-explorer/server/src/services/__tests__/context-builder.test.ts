
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextBuilder } from '../context-builder';
import { SNIPPETS } from '../snippets';

describe('ContextBuilder', () => {
  let builder: ContextBuilder;
  let mockStrapi: any;

  beforeEach(() => {
    mockStrapi = {
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      plugin: vi.fn().mockReturnValue({
        service: vi.fn().mockReturnValue({
          fetchDeepContext: vi.fn().mockResolvedValue({ id: 1, name: 'Deep Entity' }),
        }),
      }),
      getModel: vi.fn().mockReturnValue({ info: { displayName: 'Mock Entity' } }),
      db: {
        query: vi.fn().mockReturnValue({
          findMany: vi.fn().mockResolvedValue([
            { name: 'Head', slug: 'head', color: '#FF0000', description: 'The head.' },
            { name: 'Core', slug: 'core', color: '#FFFFFF', description: 'The body.' }
          ]),
        }),
      },
    };
    builder = new ContextBuilder(mockStrapi);
  });

  describe('buildEntityContext', () => {
    it('should build deep context from DB when ID is provided', async () => {
      const config = {
        entityContext: { uid: 'api::test.test', documentId: 'doc123' },
        width: 32,
        height: 32,
        size: 'Medium'
      };

      const result = await builder.buildEntityContext(config);
      
      expect(result).toContain('ENTITY TYPE: Mock Entity');
      expect(result).toContain('"name": "Deep Entity"');
      expect(mockStrapi.plugin).toHaveBeenCalledWith('map-explorer');
    });

    it('should merge draft data over deep data', async () => {
      const config = {
        entityContext: { uid: 'api::test.test', documentId: 'doc123' },
        entityData: { name: 'Draft Name' },
        width: 32,
        height: 32,
        size: 'Medium'
      };

      const result = await builder.buildEntityContext(config);
      
      expect(result).toContain('"name": "Draft Name"');
      expect(result).not.toContain('"name": "Deep Entity"'); // Should be overridden
    });

    it('should fallback to shallow context on error', async () => {
      mockStrapi.plugin.mockReturnValue({
         service: vi.fn().mockReturnValue({
             fetchDeepContext: vi.fn().mockRejectedValue(new Error('DB Down')),
         })
      });

      const config = {
         entityContext: { uid: 'api::test.test', documentId: 'doc123' },
         entityData: { simpleField: 'simple' },
         width: 32,
         height: 32,
         size: 'Medium'
      };

      const result = await builder.buildEntityContext(config);
      
      expect(result).toContain(SNIPPETS.SHALLOW_CONTEXT_HEADER);
      expect(result).toContain('simpleField: simple');
    });

    it('should inject prompt override warning if prompt provided', async () => {
         const config = {
             entityContext: { uid: 'api::test.test', documentId: 'doc123' },
             prompt: "Make it blue",
             width: 32,
             height: 32,
             size: 'Medium'
         };
         
         const result = await builder.buildEntityContext(config);
         expect(result).toContain('[IMPORTANT OVERRIDE]');
         expect(result).toContain('Make it blue');
    });
  });

  describe('buildVisionContext', () => {
      it('should return vision instruction and zone map', async () => {
          const { instruction, zoneMap } = await builder.buildVisionContext();
          
          expect(instruction).toContain(SNIPPETS.VISION_INSTRUCTION_PREFIX);
          expect(instruction).toContain('Head [#FF0000]');
          
          expect(zoneMap).toEqual({
              head: '#FF0000',
              core: '#FFFFFF'
          });
      });

      it('should handle empty zones gracefully', async () => {
          mockStrapi.db.query().findMany.mockResolvedValue([]);
          
          const { instruction, zoneMap } = await builder.buildVisionContext();
          
          expect(instruction).toBe(SNIPPETS.VISION_INSTRUCTION_PREFIX);
          expect(zoneMap).toEqual({});
      });
  });
});
