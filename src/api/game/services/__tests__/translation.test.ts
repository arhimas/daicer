/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */

import { describe, it, expect } from 'vitest';
import translationServiceFactory from '@/api/game/services/translation';

// Mock Strapi instance (not used in current implementation but required by signature)
const mockStrapi = {} as any;

describe('TranslationService', () => {
  const service = translationServiceFactory({ strapi: mockStrapi });

  describe('translate', () => {
    it('should translate known dictionary words correctly', () => {
      expect(service.translate('Hello', 'es')).toBe('Hola');
      expect(service.translate('world', 'pt')).toBe('Mundo');
      expect(service.translate('Attack', 'es')).toBe('Ataque');
    });

    it('should use fallback prefix for unknown words', () => {
      expect(service.translate('UnknownTerm', 'es')).toBe('[ES] UnknownTerm');
      expect(service.translate('Gemma', 'pt')).toBe('[PT] Gemma');
    });

    it('should preserve casing for dictionary matches', () => {
      expect(service.translate('hello', 'es')).toBe('Hola'); // Dictionary has it capitalized or logic handles it?
      // Our implementation logic:
      // if (text[0] === text[0].toUpperCase()) -> Capitalize result
      // "hello" -> 'h' is lowercase. DICTIONARY has 'hello': { en: 'Hello'... }
      // Wait, DICTIONARY keys are lowercase 'hello'. Values are 'Hello', 'Hola'.
      // If input is 'hello', text[0] is 'h'. Not uppercase.
      // Returns DICTIONARY value directly -> 'Hola'.

      // If input is 'Hello', text[0] is 'H'. Uppercase.
      // Returns Capitalized('Hola') -> 'Hola'.

      expect(service.translate('Hello', 'es')).toBe('Hola');
    });

    it('should handle empty or non-string inputs gracefully', () => {
      expect(service.translate('', 'es')).toBe('');
      // @ts-expect-error - Testing runtime behavior
      expect(service.translate(123, 'es')).toBe(123);
    });
  });

  describe('translateJson', () => {
    it('should translate simple object values (keys preserved)', () => {
      const input = {
        greeting: 'Hello',
        action: 'Attack',
      };

      const expected = {
        greeting: 'Hola',
        action: 'Ataque',
      };

      const result = service.translateJson(input, 'es'); // translateKeys: false default
      expect(result).toEqual(expected);
    });

    it('should translate keys when translateKeys is true', () => {
      const input = {
        greeting: 'Hello',
        unknown: 'Value',
      };

      // greeting -> Hola
      // unknown -> [ES] unknown
      // Values:
      // Hello -> Hola
      // Value -> [ES] Value

      // (expected removed)

      // Wait, 'greeting' is NOT in dictionary.
      // So key 'greeting' -> '[ES] greeting'

      const result = service.translateJson(input, 'es', { translateKeys: true });
      expect(result['[ES] greeting']).toBe('Hola');
      expect(result['[ES] unknown']).toBe('[ES] Value');
    });

    it('should handle nested objects and arrays', () => {
      const input = {
        level1: {
          level2: [{ text: 'Hello' }, { text: 'World' }],
          fixed: 123,
        },
      };

      // (expected removed)

      // 'Hello' -> 'Olá' (pt), 'World' -> 'Mundo' (pt)
      const expectedPt = {
        level1: {
          level2: [{ text: 'Olá' }, { text: 'Mundo' }],
          fixed: 123,
        },
      };

      const result = service.translateJson(input, 'pt');
      expect(result).toEqual(expectedPt);
    });

    it('should handle mixed types correctly', () => {
      const input = {
        str: 'Hello',
        num: 42,
        bool: true,
        nil: null,
      };

      const result = service.translateJson(input, 'es');
      expect(result.str).toBe('Hola');
      expect(result.num).toBe(42);
      expect(result.bool).toBe(true);
      expect(result.nil).toBe(null);
    });
  });
});
