import { describe, it, expect, vi, beforeEach } from 'vitest';
import translationServiceFactory from '../translation';

// Mock Strapi global for contentTypes
const mockStrapi = {
    contentTypes: {
        'api::test.test': {
            attributes: {
                title: { type: 'string' },
                description: { type: 'text' },
                content: { type: 'richtext' },
                slug: { type: 'uid' }, // Should be skipped
                tags: { type: 'json' }, // Should be skipped (default)
                related: { type: 'relation' }, // Should be skipped
                meta: { type: 'component', repeat: false, component: 'meta.seo' },
                sections: { type: 'dynamiczone', components: ['section.hero'] },
                gallery: { type: 'component', repeatable: true, component: 'media.image' }
            }
        },
        'meta.seo': {
            attributes: {
                title: { type: 'string' },
                keyword: { type: 'string' }
            }
        },
        'section.hero': {
            attributes: {
                headline: { type: 'string' }
            }
        },
        'media.image': {
             attributes: {
                 alt: { type: 'string' }
             }
        }
    },
    components: {
        // Fallback or alias if needed, but service checks contentTypes first or both
         'meta.seo': { attributes: { title: { type: 'string' } } },
         'section.hero': { attributes: { headline: { type: 'string' } } },
         'media.image': { attributes: { alt: { type: 'string' } } }
    }
};

global.strapi = mockStrapi as any;

describe('TranslationService', () => {
    let service: any;

    beforeEach(() => {
        service = translationServiceFactory({ strapi: mockStrapi as any });
    });

    describe('translate', () => {
        it('should translate known words', () => {
            expect(service.translate('Hello', 'es')).toBe('Hola');
            expect(service.translate('world', 'pt')).toBe('Mundo');
        });

        it('should preserve capitalization', () => {
             expect(service.translate('Hello', 'es')).toBe('Hola');
             expect(service.translate('hello', 'es')).toBe('Hola'); // Dictionary has it capitalized? No, let's check
             // Dictionary: hello -> Hola
             // Code: if (text[0] === text[0].toUpperCase()) -> Capitalize
             expect(service.translate('Attack', 'pt')).toBe('Ataque'); 
        });

        it('should fallback key if unknown', () => {
             expect(service.translate('Unknown', 'es')).toBe('[ES] Unknown');
        });

        it('should return non-strings as is', () => {
             expect(service.translate(123 as any, 'es')).toBe(123);
             expect(service.translate(null as any, 'es')).toBe(null);
        });
    });

    describe('translateJson', () => {
        it('should translate object values', () => {
             const input = { key: 'Hello', sub: { val: 'World' } };
             const result = service.translateJson(input, 'es');
             expect(result).toEqual({ key: 'Hola', sub: { val: 'Mundo' } });
        });

        it('should translate array', () => {
             const input = ['Hello', 'World'];
             const result = service.translateJson(input, 'pt');
             expect(result).toEqual(['Olá', 'Mundo']);
        });

        it('should translate keys if requested', () => {
             const input = { hello: 'world' };
             // hello -> Hola (if dict matches key)
             // The dict has "hello", so key "hello" -> "Hola"??
             // Dictionary: hello: {es: 'Hola'}
             const result = service.translateJson(input, 'es', { translateKeys: true });
             expect(result).toEqual({ Hola: 'Mundo' }); 
        });

        it('should handle primtives', () => {
             expect(service.translateJson(123, 'es')).toBe(123);
             expect(service.translateJson('Hello', 'es')).toBe('Hola');
        });
    });

    describe('translateEntity', () => {
        it('should translate based on schema', () => {
             const entity = {
                 id: 1,
                 title: 'Hello',
                 description: 'World',
                 slug: 'hello-world', // UID: Skip
                 tags: { some: 'json' }, // JSON: Skip
             };
             const result = service.translateEntity(entity, 'api::test.test', 'es');
             
             expect(result).toEqual({
                 id: 1,
                 title: 'Hola',
                 description: 'Mundo',
                 slug: 'hello-world',
                 tags: { some: 'json' }
             });
        });

        it('should handle components', () => {
             const entity = {
                 meta: { title: 'Hello', keyword: 'seo' }
             };
             const result = service.translateEntity(entity, 'api::test.test', 'es');
             expect(result.meta).toEqual({ title: 'Hola', keyword: '[ES] seo' });
        });

        it('should handle repeatable components', () => {
             const entity = {
                 gallery: [{ alt: 'Hello' }, { alt: 'World' }]
             };
             const result = service.translateEntity(entity, 'api::test.test', 'es');
             expect(result.gallery).toHaveLength(2);
             expect(result.gallery[0].alt).toBe('Hola');
             expect(result.gallery[1].alt).toBe('Mundo');
        });

        it('should handle dynamic zones', () => {
             const entity = {
                 sections: [
                     { __component: 'section.hero', headline: 'Hello' },
                     { __component: 'unknown', text: 'Skip' }
                 ]
             };
             const result = service.translateEntity(entity, 'api::test.test', 'es');
             expect(result.sections[0].headline).toBe('Hola');
             expect(result.sections[1].text).toBe('[ES] Skip');
        });

        it('should fallback if schema missing', () => {
             const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
             const entity = { title: 'Hello' };
             const result = service.translateEntity(entity, 'missing.schema', 'es');
             expect(result).toEqual({ title: 'Hola' });
             expect(consoleSpy).toHaveBeenCalled();
        });
    });
});
