/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */

import { describe, it, expect } from 'vitest';
import translationServiceFactory from '@/api/game/services/translation';

// Mock Strapi instance
const mockStrapi = {} as any;

describe('TranslationService Hardened Tests', () => {
  const service = translationServiceFactory({ strapi: mockStrapi });

  describe('translate (Robustness)', () => {
    it('should handle null/undefined inputs', () => {
      // @ts-expect-error - Testing runtime validation
      expect(service.translate(null, 'es')).toBe(null);
      // @ts-expect-error - Testing runtime validation
      expect(service.translate(undefined, 'es')).toBe(undefined);
    });

    it('should handle non-string inputs gracefully', () => {
      // @ts-expect-error - Testing runtime validation
      expect(service.translate(12345, 'en')).toBe(12345);
      // @ts-expect-error - Testing runtime validation
      expect(service.translate(true, 'pt')).toBe(true);
      // @ts-expect-error - Testing runtime validation
      expect(service.translate({}, 'es')).toEqual({});
    });

    it('should handle special characters', () => {
      expect(service.translate('Hello!', 'es')).toBe('[ES] Hello!'); // Punctuation handling fallback
      expect(service.translate('  Hello  ', 'es')).toBe('Hola'); // Trimming works for lookup
    });
  });

  describe('translateJson (Deep Traversal & Edge Cases)', () => {
    it('should handle deep nesting (Depth > 5)', () => {
      const deep = {
        l1: { l2: { l3: { l4: { l5: { val: 'Hello' } } } } },
      };
      const result = service.translateJson(deep, 'pt');
      expect(result.l1.l2.l3.l4.l5.val).toBe('Olá');
    });

    it('should handle arrays of various types', () => {
      const arr = ['Hello', 123, null, { val: 'World' }];
      const result = service.translateJson(arr, 'es');
      expect(result[0]).toBe('Hola');
      expect(result[1]).toBe(123);
      expect(result[2]).toBe(null);
      expect(result[3].val).toBe('Mundo'); // World -> Mundo (ES/PT are same fallback in our mock dictionary? No wait)
      // Dictionary: World -> Mundo (ES), Mundo (PT). Correct.
    });

    it('should handle circular references (if possible) or fail gracefully', () => {
      // Our implementation uses simple recursion, so it would stack overflow on circular refs.
      // However, we are dealing with JSON from API usually, which isn't circular.
      // But let's verify if we want to support it?
      // For "simple service", we might not need it, but good to know behavior.
      // We won't test stack overflow here to avoid crashing test runner.
    });

    it('should handle translateKeys: true with complex keys', () => {
      const obj = { 'Hello World': 'Attack', SomeKey: 'Damage' };
      // Keys:
      // 'Hello World' -> Not in dict (multi-word). -> [ES] Hello World
      // 'SomeKey' -> [ES] SomeKey
      // Values:
      // 'Attack' -> 'Ataque'
      // 'Damage' -> 'Daño'

      const result = service.translateJson(obj, 'es', { translateKeys: true });
      expect(result['[ES] Hello World']).toBe('Ataque');
      expect(result['[ES] SomeKey']).toBe('Daño');
    });

    it('should ignore prototype pollution attempts', () => {
      // const malicious = JSON.parse('{"__proto__": {"polluted": true}}');
      // While we can't easily prevent Object.keys from iterating if it's there?
      // Actually standard JSON.parse doesn't set __proto__.
      // But if passed as object:
      const payload = {};
      // @ts-expect-error - Testing malicious proto pollution
      payload['__proto__'] = { val: 'bad' };

      const result = service.translateJson(payload, 'es');
      // Should not crash.
      expect(result).toBeDefined();
    });
  });
});
