import { vi } from 'vitest';
import localesControllerFactory from '@/api/game/controllers/locales';
import { QueueManager } from '@/queues/queue-manager';
import { QueueName } from '@/queues/contract';

// Mock QueueManager
vi.mock('../../../../queues/queue-manager', () => ({
  QueueManager: {
    get: vi.fn().mockReturnValue({
      add: vi.fn().mockResolvedValue(true),
    }),
  },
}));

// Mock Strapi Global
// @ts-expect-error: Mock
global.strapi = {};

describe('Locales Controller', () => {
  describe('generateLocales', () => {
    it('validates payload', async () => {
      const ctx = {
        request: { body: {} },
        badRequest: vi.fn(),
      };

      const controller = localesControllerFactory({ strapi });
      await controller.generateLocales(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Invalid payload'));
    });

    it('enqueues jobs for documents', async () => {
      const ctx = {
        request: { body: { contentType: 'api::test', documentIds: ['doc-1', 'doc-2'] } },
        badRequest: vi.fn(),
      };

      const queueMock = QueueManager.get();

      const controller = localesControllerFactory({ strapi });
      const result = await controller.generateLocales(ctx);

      expect(queueMock.add).toHaveBeenCalledTimes(2);
      expect(queueMock.add).toHaveBeenCalledWith(
        QueueName.TRANSLATE_ENTITY,
        expect.stringContaining('translate-api::test-doc-1'),
        expect.objectContaining({ documentId: 'doc-1' })
      );
      expect(result.report.enqueued).toBe(2);
    });
  });
});
