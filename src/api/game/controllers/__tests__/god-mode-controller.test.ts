import { vi } from 'vitest';
import godModeControllerFactory from '@/api/game/controllers/god-mode';

// Mock Strapi Global
// @ts-expect-error: Mock
global.strapi = {
  service: vi.fn(),
  log: { error: vi.fn() },
};

describe('God Mode Controller', () => {
  describe('godModeExecute', () => {
    it('validates payload structure', async () => {
      const ctx = {
        request: { body: {} }, // Invalid
        badRequest: vi.fn(),
      };

      const controller = godModeControllerFactory({ strapi });
      await controller.godModeExecute(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Invalid payload'));
    });

    it('validates command schema', async () => {
      const ctx = {
        request: { body: { roomId: 'r1', commands: [{ type: 'INVALID' }] } },
        badRequest: vi.fn(),
      };

      const controller = godModeControllerFactory({ strapi });
      await controller.godModeExecute(ctx);

      expect(ctx.badRequest).toHaveBeenCalledWith(
        expect.stringContaining('Invalid Command Schema'),
        expect.any(Object)
      );
    });

    it('delegates valid commands to pipeline', async () => {
      const cmd = { type: 'MOVE', payload: { actorId: 'a1', targetPosition: { x: 0, y: 0, z: 0 } } };
      const ctx = {
        request: { body: { roomId: 'r1', commands: [cmd] } },
        send: vi.fn(),
      };

      const processTurn = vi.fn().mockResolvedValue({ success: true });
      // @ts-expect-error: Mock
      strapi.service.mockReturnValue({ processTurn });

      const controller = godModeControllerFactory({ strapi });
      await controller.godModeExecute(ctx);

      expect(processTurn).toHaveBeenCalled();
      expect(ctx.send).toHaveBeenCalledWith({ success: true });
    });
  });
});
