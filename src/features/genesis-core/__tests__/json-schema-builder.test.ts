import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JsonSchemaBuilder } from '@/features/genesis-core/json-schema-builder';
import { SchemaLoader } from '@/features/genesis-core/schema-loader';

const mockLoadSchema = vi.fn();

const mockLoader = {
  loadSchema: mockLoadSchema,
  listSchemas: vi.fn(),
} as unknown as SchemaLoader;

describe('JsonSchemaBuilder', () => {
  let builder: JsonSchemaBuilder;

  beforeEach(() => {
    builder = new JsonSchemaBuilder(mockLoader);
    vi.clearAllMocks();
  });

  it('should build simple schema with primitives', async () => {
    mockLoadSchema.mockResolvedValue({
      uid: 'test.user',
      attributes: {
        name: { type: 'string', required: true },
        age: { type: 'integer' },
        active: { type: 'boolean' },
        role: { type: 'enumeration', enum: ['admin', 'guest'] },
      },
    });

    const schema = await builder.build('test.user');

    expect(schema.type).toBe('object');
    expect(schema.required).toContain('name');
    expect(schema.properties?.name.type).toBe('string');
    expect(schema.properties?.age.type).toBe('integer');
    expect(schema.properties?.active.type).toBe('boolean');
    expect(schema.properties?.role.enum).toEqual(['admin', 'guest']);
  });

  it('should handle nested components (inlined)', async () => {
    mockLoadSchema.mockImplementation(async (uid) => {
      if (uid === 'api::page.page') {
        return {
          attributes: {
            seo: { type: 'component', component: 'shared.seo' },
          },
        };
      }
      if (uid === 'shared.seo') {
        return {
          attributes: {
            title: { type: 'string' },
          },
        };
      }
      return null;
    });

    const schema = await builder.build('api::page.page');

    expect(schema.properties?.seo.type).toBe('object');
    expect(schema.properties?.seo.properties?.title.type).toBe('string');
  });

  it('should handle circular component references via depth limit', async () => {
    // Circular: A -> B -> A
    mockLoadSchema.mockImplementation(async (uid) => {
      if (uid === 'comp.a') return { attributes: { link: { type: 'component', component: 'comp.b' } } };
      if (uid === 'comp.b') return { attributes: { back: { type: 'component', component: 'comp.a' } } };
      return null;
    });

    const schema = await builder.build('comp.a');

    // A -> B
    expect(schema.properties?.link.type).toBe('object');
    // B -> A
    expect(schema.properties?.link.properties?.back.type).toBe('object');
    // A -> B (Recursion)
    expect(schema.properties?.link.properties?.back.properties?.link.type).toBe('object');
  });

  it('should handle dynamic zones (inlined choices)', async () => {
    mockLoadSchema.mockImplementation(async (uid) => {
      if (uid === 'api::layout.layout') {
        return {
          attributes: {
            sections: {
              type: 'dynamiczone',
              components: ['comp.hero'],
            },
          },
        };
      }
      if (uid === 'comp.hero') return { attributes: { title: { type: 'string' } } };
      return null;
    });

    const schema = await builder.build('api::layout.layout');

    const sections = schema.properties?.sections;
    expect(sections?.type).toBe('array');
    expect(sections?.items?.anyOf).toHaveLength(1);

    const heroInline = sections?.items?.anyOf![0];
    if (!heroInline) throw new Error('Hero inline schema not found');
    expect(heroInline.properties?.__component.enum).toEqual(['comp.hero']);
    expect(heroInline.properties?.title.type).toBe('string');
  });
});
