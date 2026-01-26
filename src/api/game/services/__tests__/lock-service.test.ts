import { vi } from 'vitest';
import lockServiceFactory from '../lock-service';

// Mock Global Strapi
// @ts-expect-error: Mock
global.strapi = {
    documents: vi.fn(),
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
};

describe('Lock Service', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('acquire', () => {
        it('acquires lock when no lock exists', async () => {
            // @ts-expect-error: Mock
            strapi.documents.mockReturnValue({
                findMany: vi.fn().mockResolvedValue([]),
                create: vi.fn().mockResolvedValue({ id: 1 })
            });

            const service = lockServiceFactory({ strapi });
            const result = await service.acquire('room-1', 'proc-1');
            
            expect(result).toBe(true);
            // @ts-expect-error: Mock
            expect(strapi.documents('api::turn-lock.turn-lock').create).toHaveBeenCalled();
        });

        it('rejects acquisition if valid lock exists', async () => {
             const future = new Date(Date.now() + 10000).toISOString();
             // @ts-expect-error: Mock
            strapi.documents.mockReturnValue({
                findMany: vi.fn().mockResolvedValue([{ documentId: 'lock-1', holder_id: 'proc-2', expires_at: future }]),
                create: vi.fn()
            });

            const service = lockServiceFactory({ strapi });
            const result = await service.acquire('room-1', 'proc-1');
            
            expect(result).toBe(false);
        });

        it('steals lock if expired', async () => {
             const past = new Date(Date.now() - 10000).toISOString();
             const deleteMock = vi.fn();
             const createMock = vi.fn();
             
             // @ts-expect-error: Mock
            strapi.documents.mockReturnValue({
                findMany: vi.fn().mockResolvedValue([{ documentId: 'lock-1', holder_id: 'proc-2', expires_at: past }]),
                delete: deleteMock,
                create: createMock
            });

            const service = lockServiceFactory({ strapi });
            const result = await service.acquire('room-1', 'proc-1');
            
            expect(result).toBe(true);
            expect(deleteMock).toHaveBeenCalledWith({ documentId: 'lock-1' });
            expect(createMock).toHaveBeenCalled();
        });
    });
});
