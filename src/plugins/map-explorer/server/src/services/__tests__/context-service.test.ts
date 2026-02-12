import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../context-service';

describe('ContextService', () => {
    let strapi: any;
    let contextService: any;
    let mockDocuments: any;
    let mockGetModel: any;

    beforeEach(() => {
        mockDocuments = {
            findOne: vi.fn(),
        };

        mockGetModel = vi.fn();

        strapi = {
            getModel: mockGetModel,
            documents: vi.fn().mockReturnValue(mockDocuments),
            log: { error: vi.fn() },
        };

        contextService = service({ strapi });
    });

    describe('getDeepPopulate', () => {
        it('should return wildcard at depth 0', () => {
             const result = contextService.getDeepPopulate('api::test.test', 0);
             expect(result).toBe('*');
        });

        it('should handle relations and components recursively', () => {
             mockGetModel.mockImplementation((uid) => {
                 if (uid === 'api::parent.parent') {
                     return {
                         attributes: {
                             child: { type: 'relation', target: 'api::child.child' },
                             comp: { type: 'component', component: 'comp.example' },
                             simple: { type: 'string' }
                         }
                     };
                 }
                 if (uid === 'api::child.child') {
                     return { attributes: {} }; // leaf
                 }
                 if (uid === 'comp.example') {
                      return { attributes: {} }; // leaf
                 }
                 return { attributes: {} };
             });

             const result = contextService.getDeepPopulate('api::parent.parent', 2);
             
             expect(result).toHaveProperty('child');
             expect(result.child).toHaveProperty('populate');
             expect(result).toHaveProperty('comp');
             expect(result.comp).toHaveProperty('populate');
             expect(result).not.toHaveProperty('simple');
        });

        it('should stop recursion on cycles', () => {
             mockGetModel.mockImplementation((uid) => {
                 return {
                     attributes: {
                         self: { type: 'relation', target: 'api::recursive.recursive' }
                     }
                 };
             });

             const result = contextService.getDeepPopulate('api::recursive.recursive', 5);
             
             // First level populates
             expect(result).toHaveProperty('self');
             // Second level sees cycle and returns '*'
             expect(result.self.populate).toBe('*');
        });
    });

    describe('fetchDeepContext', () => {
        it('should fetch and sanitize entity', async () => {
             const mockEntity = {
                 id: 1,
                 password: 'secret',
                 name: 'Test',
                 nested: { createdBy: 'admin', value: 10 }
             };
             mockDocuments.findOne.mockResolvedValue(mockEntity);
             // Mock minimal model to avoid getDeepPopulate crash
             mockGetModel.mockReturnValue({ attributes: {} });

             const result = await contextService.fetchDeepContext('api::test.test', 'doc-1');
             
             expect(result).toEqual({
                 id: 1,
                 name: 'Test',
                 nested: { value: 10 }
             });
             expect(result).not.toHaveProperty('password');
             expect((result as any).nested).not.toHaveProperty('createdBy');
        });

        it('should return null if not found', async () => {
             mockDocuments.findOne.mockResolvedValue(null);
             mockGetModel.mockReturnValue({ attributes: {} });

             const result = await contextService.fetchDeepContext('api::test.test', 'doc-1');
             expect(result).toBeNull();
        });
    });
});
