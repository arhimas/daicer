/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock factories BEFORE importing the service
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, factoryFn: any) => factoryFn,
  },
}));

import lockServiceFactory from '../lock-service';

// Mock dependencies
const mockStrapi = {
  documents: vi.fn(),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

// Create the service
const lockService = lockServiceFactory({ strapi: mockStrapi as any });

const mockDocumentReturn = (returnValue: any) => {
  return {
    findMany: vi.fn().mockResolvedValue(returnValue),
    create: vi.fn().mockResolvedValue({ documentId: 'lock-123' }),
    delete: vi.fn().mockResolvedValue({}),
  };
};

describe('LockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('acquire', () => {
    it('should acquire a lock if no locks exist', async () => {
      mockStrapi.documents.mockReturnValue(mockDocumentReturn([]));

      const result = await lockService.acquire('room-1', 'holder-a', 5);

      expect(result).toBe(true);
      expect(mockStrapi.documents).toHaveBeenCalledWith('api::turn-lock.turn-lock');
    });

    it('should acquire a lock if existing lock is expired', async () => {
      const expiredLock = {
        documentId: 'old-lock',
        expires_at: new Date(Date.now() - 1000).toISOString(),
        holder_id: 'holder-old',
      };

      mockStrapi.documents.mockReturnValue(mockDocumentReturn([expiredLock]));

      const result = await lockService.acquire('room-1', 'holder-b', 5);

      // Should delete the old one first
      // Note: In our implementation we call findMany then delete.
      // The mockDocumentReturn returns an object where 'delete' is mocked.
      // We can verify calls order implicitly or just success.
      expect(result).toBe(true);
    });

    it('should REJECT a lock if existing lock is valid', async () => {
      const validLock = {
        documentId: 'current-lock',
        expires_at: new Date(Date.now() + 5000).toISOString(),
        holder_id: 'holder-current',
      };

      mockStrapi.documents.mockReturnValue(mockDocumentReturn([validLock]));

      const result = await lockService.acquire('room-1', 'holder-b', 5);

      expect(result).toBe(false);
    });
  });

  describe('release', () => {
    it('should release the lock if holder matches', async () => {
      const myLock = {
        documentId: 'lock-123',
        holder_id: 'me',
        room: 'room-1',
      };

      const docMock = mockDocumentReturn([myLock]);
      mockStrapi.documents.mockReturnValue(docMock);

      await lockService.release('room-1', 'me');

      expect(docMock.delete).toHaveBeenCalledWith({ documentId: 'lock-123' });
    });
  });
});
