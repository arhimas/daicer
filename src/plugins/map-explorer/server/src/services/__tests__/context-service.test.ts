
import { describe, it, expect, vi, beforeEach } from 'vitest';
import contextServiceFactory from '../context-service';

const mockFindOne = vi.fn();
const mockGetModel = vi.fn();

const mockStrapi: any = {
  documents: vi.fn(() => ({
    findOne: mockFindOne
  })),
  getModel: mockGetModel,
  log: { error: vi.fn() }
};

describe('Context Service', () => {
    let service: any;

    beforeEach(() => {
        vi.clearAllMocks();
        service = contextServiceFactory({ strapi: mockStrapi });
    });

    describe('getDeepPopulate', () => {
        it('should stop recursion at depth 0', () => {
            const res = service.getDeepPopulate('uid', 0);
            expect(res).toBe('*');
        });

        it('should handle circular dependencies', () => {
            const visited = new Set(['uid']);
            const res = service.getDeepPopulate('uid', 3, visited);
            expect(res).toBe('*');
        });

        it('should populate relations and components', () => {
             mockGetModel.mockReturnValue({
                 attributes: {
                     rel: { type: 'relation', target: 'other-uid' },
                     comp: { type: 'component', component: 'comp-uid' },
                     simple: { type: 'string' }
                 }
             });
             // Recursive call mocks
             // First call
             const res = service.getDeepPopulate('uid', 2);
             
             expect(res).toHaveProperty('rel');
             expect(res).toHaveProperty('comp');
             expect(res).not.toHaveProperty('simple');
        });
        
         it('should return wildcard if no relations', () => {
             mockGetModel.mockReturnValue({ attributes: { name: { type: 'string' } } });
             const res = service.getDeepPopulate('uid', 2);
             expect(res).toBe('*');
        });
    });

    describe('fetchDeepContext', () => {
        it('should fetch and sanitize', async () => {
            mockGetModel.mockReturnValue({ attributes: {} }); // Mock for populate generation
            mockFindOne.mockResolvedValueOnce({ 
                id: 1, 
                password: 'secret', 
                child: { createdBy: 'admin', name: 'child' } 
            });
            
            const res = await service.fetchDeepContext('uid', 'doc1');
            
            expect(res.password).toBeUndefined();
            expect(res.child.createdBy).toBeUndefined();
            expect(res.child.name).toBe('child');
        });

        it('should return null if not found', async () => {
            mockGetModel.mockReturnValue({ attributes: {} }); 
            mockFindOne.mockResolvedValueOnce(null);
            const res = await service.fetchDeepContext('uid', 'doc1');
            expect(res).toBeNull();
        });

        it('should handle errors', async () => {
             mockGetModel.mockImplementation(() => { throw new Error('Model error'); });
             await expect(service.fetchDeepContext('uid', 'doc1'))
                .rejects.toThrow('Model error');
             expect(mockStrapi.log.error).toHaveBeenCalled();
        });
    });
});
