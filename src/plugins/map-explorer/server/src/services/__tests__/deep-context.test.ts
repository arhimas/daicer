import { describe, it, expect, vi, beforeEach } from 'vitest';
import contextServiceFactory from '../context-service';

// Mock Strapi Global
const mockFindOne = vi.fn();
const mockGetModel = vi.fn();

const mockStrapi = {
  log: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
  documents: (_uid: string) => ({
    findOne: mockFindOne,
  }),
  getModel: mockGetModel,
} as any;

describe('Context Service (Deep Fetch)', () => {
  const service = contextServiceFactory({ strapi: mockStrapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDeepPopulate', () => {
    it('should return true if depth is 0', () => {
      const result = service.getDeepPopulate('api::test.test', 0);
      expect(result).toBe('*');
    });

    it('should return true if no relations found', () => {
      mockGetModel.mockReturnValue({ attributes: { name: { type: 'string' } } });
      const result = service.getDeepPopulate('api::leaf.leaf', 3);
      expect(result).toBe('*');
    });

    it('should build nested populate for relations', () => {
      // Mock Schema A -> B -> C
      mockGetModel.mockImplementation((uid) => {
        if (uid === 'api::a.a')
          return { attributes: { b: { type: 'relation', target: 'api::b.b' } } };
        if (uid === 'api::b.b')
          return { attributes: { c: { type: 'relation', target: 'api::c.c' } } };
        if (uid === 'api::c.c') return { attributes: { name: { type: 'string' } } };
        return { attributes: {} };
      });

      const result = service.getDeepPopulate('api::a.a', 3);

      expect(result).toEqual({
        b: {
          populate: {
            c: {
              populate: '*',
            },
          },
        },
      });
    });

    it('should handle circular dependencies (A -> B -> A) by stopping recursion', () => {
      mockGetModel.mockImplementation((uid) => {
        if (uid === 'api::cycle-a.cycle-a')
          return { attributes: { b: { type: 'relation', target: 'api::cycle-b.cycle-b' } } };
        if (uid === 'api::cycle-b.cycle-b')
          return { attributes: { a: { type: 'relation', target: 'api::cycle-a.cycle-a' } } };
        return { attributes: {} };
      });

      const result = service.getDeepPopulate('api::cycle-a.cycle-a', 5);

      // Expected: A -> B -> True (A is visited)
      expect(result).toEqual({
        b: {
          populate: {
            a: {
              populate: '*',
            },
          },
        },
      });
    });
  });

  describe('sanitizeDeep', () => {
    it('should remove system fields', () => {
      const raw = {
        id: 1,
        password: 'secret',
        createdAt: 'date',
        nested: {
          updatedBy: 'user',
          data: 'keep',
        },
      };

      const clean = service.sanitizeDeep(raw) as any;
      expect(clean.password).toBeUndefined();
      expect(clean.createdAt).toBeUndefined();
      expect(clean.nested.updatedBy).toBeUndefined();
      expect(clean.nested.data).toBe('keep');
    });
  });
});
