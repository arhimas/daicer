import { vi } from 'vitest';

// Mock Strapi Factory System
vi.mock('@strapi/strapi', () => ({
    factories: {
        createCoreService: (uid: string, cfg: (ops: any) => any) => cfg
    }
}));

import roomServiceFactory from '../room';

// Mock Strapi Global
// @ts-ignore
global.strapi = {
    entityService: {
        create: vi.fn(),
        update: vi.fn()
    },
    db: {
        query: vi.fn()
    },
    log: { error: vi.fn() },
    contentType: vi.fn()
};

// Start Date.now() mock
const NOW = 10000;
vi.setSystemTime(NOW);

describe('Room Service', () => {
    
    describe('createRoom', () => {
        it('creates a room with an owner and generated code', async () => {
            const user = { id: 1, documentId: 'u-1', username: 'Tester' };
            const payload = { worldDescription: 'A Test World' };

            const createMock = vi.fn().mockResolvedValue({ id: 12345, documentId: 'r-1' });
            const updateMock = vi.fn().mockResolvedValue({ id: 12345, documentId: 'r-1', code: 'CODE' });

            // @ts-ignore
            strapi.entityService.create = createMock;
            // @ts-ignore
            strapi.entityService.update = updateMock;

            const service = roomServiceFactory({ strapi });
            await service.createRoom(user, payload);

            expect(createMock).toHaveBeenCalled();
            const createArgs = createMock.mock.calls[0][1].data;
            expect(createArgs.worldDescription).toBe('A Test World');
            expect(createArgs.owner).toBe('u-1');
            expect(createArgs.players[0].name).toBe('Tester');

            expect(updateMock).toHaveBeenCalled(); // Should update with code
        });
    });

    describe('joinRoom', () => {
         it('adds user to room if not joined', async () => {
             const user = { id: 2, documentId: 'u-2', username: 'Joiner' };
             const existingRoom = { 
                 id: 1, documentId: 'r-1', 
                 players: [{ userId: 'u-1', name: 'Owner' }] 
             };

             // @ts-ignore
             strapi.db.query.mockReturnValue({ findOne: vi.fn().mockResolvedValue(existingRoom) });
             const updateMock = vi.fn().mockResolvedValue({ ...existingRoom, players: [...existingRoom.players, {}] });
             // @ts-ignore
             strapi.entityService.update = updateMock;

             const service = roomServiceFactory({ strapi });
             const result = await service.joinRoom('CODE', user);

             expect(result.joined).toBe(true);
             expect(updateMock).toHaveBeenCalled();
         });

         it('returns existing room if already joined', async () => {
             const user = { id: 1, documentId: 'u-1', username: 'Owner' }; // Already in
             const existingRoom = { 
                 id: 1, documentId: 'r-1', 
                 players: [{ userId: 'u-1', name: 'Owner' }] 
             };

             // @ts-ignore
             strapi.db.query.mockReturnValue({ findOne: vi.fn().mockResolvedValue(existingRoom) });
             const updateMock = vi.fn();
             // @ts-ignore
             strapi.entityService.update = updateMock;

             const service = roomServiceFactory({ strapi });
             const result = await service.joinRoom('CODE', user);

             expect(result.joined).toBe(false);
             expect(result.message).toBe('Already joined');
             expect(updateMock).not.toHaveBeenCalled();
         });
    });
});
