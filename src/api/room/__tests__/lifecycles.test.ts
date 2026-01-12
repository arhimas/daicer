import { describe, it, expect, vi, beforeEach } from 'vitest';
import roomLifecycles from '../content-types/room/lifecycles';

// Mock Strapi
const mockUpdate = vi.fn();
const mockLogError = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    update: mockUpdate,
  }),
  log: {
    error: mockLogError,
  },
});

describe('Room Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('afterCreate', () => {
    const { afterCreate } = roomLifecycles;

    it('should generate rune code for new room with numeric ID', async () => {
      const event = {
        result: {
          id: 12345,
          documentId: 'doc-123',
          code: null,
        },
      };

      await afterCreate(event as unknown);

      expect(mockUpdate).toHaveBeenCalledWith({
        documentId: 'doc-123',
        data: expect.objectContaining({
          code: expect.any(String),
        }),
      });
    });

    it('should skip if code already exists', async () => {
      const event = {
        result: {
          id: 12345,
          documentId: 'doc-123',
          code: 'EXISTING',
        },
      };

      await afterCreate(event as unknown);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle update error gracefully', async () => {
      mockUpdate.mockRejectedValue(new Error('DB Error'));
      const event = {
        result: {
          id: 12345,
          documentId: 'doc-123',
        },
      };

      await afterCreate(event as unknown);

      expect(mockLogError).toHaveBeenCalledWith(expect.stringContaining('Failed to generate rune'), expect.any(Error));
    });

    it('should do nothing if no ID present (e.g. strange DB state)', async () => {
      const event = {
        result: {
          documentId: 'doc-no-id',
        },
      };

      await afterCreate(event as unknown);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
