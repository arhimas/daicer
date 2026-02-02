"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const context_service_1 = __importDefault(require("../context-service"));
// Mock Strapi Global
const mockFindOne = vitest_1.vi.fn();
const mockGetModel = vitest_1.vi.fn();
const mockStrapi = {
    log: { error: vitest_1.vi.fn(), info: vitest_1.vi.fn(), warn: vitest_1.vi.fn() },
    documents: (_uid) => ({
        findOne: mockFindOne
    }),
    getModel: mockGetModel
};
(0, vitest_1.describe)('Context Service (Deep Fetch)', () => {
    const service = (0, context_service_1.default)({ strapi: mockStrapi });
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('getDeepPopulate', () => {
        (0, vitest_1.it)('should return true if depth is 0', () => {
            const result = service.getDeepPopulate('api::test.test', 0);
            (0, vitest_1.expect)(result).toBe('*');
        });
        (0, vitest_1.it)('should return true if no relations found', () => {
            mockGetModel.mockReturnValue({ attributes: { name: { type: 'string' } } });
            const result = service.getDeepPopulate('api::leaf.leaf', 3);
            (0, vitest_1.expect)(result).toBe('*');
        });
        (0, vitest_1.it)('should build nested populate for relations', () => {
            // Mock Schema A -> B -> C
            mockGetModel.mockImplementation((uid) => {
                if (uid === 'api::a.a')
                    return { attributes: { b: { type: 'relation', target: 'api::b.b' } } };
                if (uid === 'api::b.b')
                    return { attributes: { c: { type: 'relation', target: 'api::c.c' } } };
                if (uid === 'api::c.c')
                    return { attributes: { name: { type: 'string' } } };
                return { attributes: {} };
            });
            const result = service.getDeepPopulate('api::a.a', 3);
            (0, vitest_1.expect)(result).toEqual({
                b: {
                    populate: {
                        c: {
                            populate: '*'
                        }
                    }
                }
            });
        });
        (0, vitest_1.it)('should handle circular dependencies (A -> B -> A) by stopping recursion', () => {
            mockGetModel.mockImplementation((uid) => {
                if (uid === 'api::cycle-a.cycle-a')
                    return { attributes: { b: { type: 'relation', target: 'api::cycle-b.cycle-b' } } };
                if (uid === 'api::cycle-b.cycle-b')
                    return { attributes: { a: { type: 'relation', target: 'api::cycle-a.cycle-a' } } };
                return { attributes: {} };
            });
            const result = service.getDeepPopulate('api::cycle-a.cycle-a', 5);
            // Expected: A -> B -> True (A is visited)
            (0, vitest_1.expect)(result).toEqual({
                b: {
                    populate: {
                        a: {
                            populate: '*'
                        }
                    }
                }
            });
        });
    });
    (0, vitest_1.describe)('sanitizeDeep', () => {
        (0, vitest_1.it)('should remove system fields', () => {
            const raw = {
                id: 1,
                password: 'secret',
                createdAt: 'date',
                nested: {
                    updatedBy: 'user',
                    data: 'keep'
                }
            };
            const clean = service.sanitizeDeep(raw);
            (0, vitest_1.expect)(clean.password).toBeUndefined();
            (0, vitest_1.expect)(clean.createdAt).toBeUndefined();
            (0, vitest_1.expect)(clean.nested.updatedBy).toBeUndefined();
            (0, vitest_1.expect)(clean.nested.data).toBe('keep');
        });
    });
});
