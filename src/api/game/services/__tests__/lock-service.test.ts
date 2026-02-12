
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import service from '../lock-service';

describe('Lock Service', () => {
    let lockService: any;
    let mockStrapi: any;
    let mockDocuments: any;

    beforeEach(() => {
        // Mock Strapi Documents API
        mockDocuments = {
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        };

        mockStrapi = {
            documents: vi.fn(() => mockDocuments),
            log: {
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            },
        };

        lockService = service({ strapi: mockStrapi });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('acquire', () => {
        it('should acquire lock if no existing locks', async () => {
            mockDocuments.findMany.mockResolvedValue([]);
            mockDocuments.create.mockResolvedValue({ documentId: 'lock-1' });

            const result = await lockService.acquire('room-1', 'holder-1');

            expect(result).toBe(true);
            expect(mockDocuments.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    room: 'room-1',
                    holder_id: 'holder-1'
                })
            });
        });

        it('should reject if valid lock exists', async () => {
            const future = new Date(Date.now() + 10000).toISOString();
            mockDocuments.findMany.mockResolvedValue([
                { documentId: 'lock-1', expires_at: future, holder_id: 'holder-2' }
            ]);

            const result = await lockService.acquire('room-1', 'holder-1');

            expect(result).toBe(false);
            expect(mockDocuments.create).not.toHaveBeenCalled();
            expect(mockStrapi.log.warn).toHaveBeenCalled();
        });

        it('should cleanup and acquire if lock expired', async () => {
            const past = new Date(Date.now() - 10000).toISOString();
            mockDocuments.findMany.mockResolvedValue([
                { documentId: 'lock-1', expires_at: past, holder_id: 'holder-2' }
            ]);
            mockDocuments.create.mockResolvedValue({ documentId: 'lock-2' });

            const result = await lockService.acquire('room-1', 'holder-1');

            expect(result).toBe(true);
            expect(mockDocuments.delete).toHaveBeenCalledWith({ documentId: 'lock-1' });
            expect(mockDocuments.create).toHaveBeenCalled();
        });

        it('should return false on creation error', async () => {
            mockDocuments.findMany.mockResolvedValue([]);
            mockDocuments.create.mockRejectedValue(new Error('DB Error'));

            const result = await lockService.acquire('room-1', 'holder-1');

            expect(result).toBe(false);
            expect(mockStrapi.log.error).toHaveBeenCalled();
        });
    });

    describe('release', () => {
        it('should release lock if held by holder', async () => {
            mockDocuments.findMany.mockResolvedValue([
                { documentId: 'lock-1' }
            ]);

            await lockService.release('room-1', 'holder-1');

            expect(mockDocuments.delete).toHaveBeenCalledWith({ documentId: 'lock-1' });
        });

        it('should do nothing if no lock found for holder', async () => {
            mockDocuments.findMany.mockResolvedValue([]);

            await lockService.release('room-1', 'holder-1');

            expect(mockDocuments.delete).not.toHaveBeenCalled();
        });
    });

    describe('forceRelease', () => {
        it('should delete all locks for room', async () => {
            mockDocuments.findMany.mockResolvedValue([
                { documentId: 'lock-1' },
                { documentId: 'lock-2' }
            ]);

            await lockService.forceRelease('room-1');

            expect(mockDocuments.delete).toHaveBeenCalledTimes(2);
        });
    });

    describe('isLocked', () => {
        it('should return true if active lock exists', async () => {
            mockDocuments.findMany.mockResolvedValue([{ documentId: 'lock-1' }]);
            const result = await lockService.isLocked('room-1');
            expect(result).toBe(true);
        });

        it('should return false if no active lock', async () => {
            mockDocuments.findMany.mockResolvedValue([]);
            const result = await lockService.isLocked('room-1');
            expect(result).toBe(false);
        });
    });
});
