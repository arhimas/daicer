import { vi } from 'vitest';
import engineControllerFactory from '../engine';

// Mock Global Strapi
// @ts-expect-error: Mock
global.strapi = {
    service: vi.fn(),
    log: { error: vi.fn() }
};

describe('Engine Controller', () => {

    describe('spawn', () => {
         it('validates required fields', async () => {
             const ctx = {
                 request: { body: {} }, // Missing fields
                 badRequest: vi.fn()
             };
             
             const controller = engineControllerFactory({ strapi });
             await controller.spawn(ctx);

             expect(ctx.badRequest).toHaveBeenCalledWith(expect.stringContaining('Missing required fields'));
         });

         it('delegates to spawn service', async () => {
             const ctx = {
                 request: { body: { roomId: 'r1', type: 'monster', entityId: 'e1', position: {x:0,y:0} } },
                 body: null
             };
             const spawnMonster = vi.fn().mockResolvedValue({ id: 'spawned-1' });
             
             // @ts-expect-error: Mock
             strapi.service.mockReturnValue({ spawnMonster });

             const controller = engineControllerFactory({ strapi });
             await controller.spawn(ctx);

             expect(spawnMonster).toHaveBeenCalledWith('r1', 'e1', {x:0,y:0});
             expect(ctx.body).toEqual({ id: 'spawned-1' });
         });
    });

    describe('execute', () => {
         it('delegates to turn processing', async () => {
             const ctx = {
                 request: { body: { roomId: 'r1', actions: [] } },
                 state: { user: { id: 1 } },
                 body: null
             };
             const executeDeterministicTurn = vi.fn().mockResolvedValue({ success: true });
             
             // @ts-expect-error: Mock
             strapi.service.mockReturnValue({ executeDeterministicTurn });

             const controller = engineControllerFactory({ strapi });
             await controller.execute(ctx);

             expect(executeDeterministicTurn).toHaveBeenCalledWith('r1', [], { id: 1 });
             expect(ctx.body).toEqual({ success: true });
         });
    });
});
