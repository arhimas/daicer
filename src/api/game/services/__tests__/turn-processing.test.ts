import { vi } from 'vitest';
import turnProcessingFactory from '../turn-processing';

// Mock Strapi Global
// @ts-expect-error: Mock
global.strapi = {
    documents: vi.fn(),
    service: vi.fn(),
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
};

describe('Turn Processing Service', () => {

    describe('executeDeterministicTurn', () => {
        it('processes valid moves', async () => {
            const mockRoom = {
                documentId: 'room-1',
                entity_sheets: [
                    { documentId: 'hero-1', position: { x: 0, y: 0, z: 0 }, name: 'Hero' }
                ],
                exploredTiles: []
            };

            // @ts-expect-error: Mock
            strapi.documents.mockReturnValue({
                findOne: vi.fn().mockResolvedValue(mockRoom),
                update: vi.fn() 
            });

            const updatePosMock = vi.fn();
            const persistTurnMock = vi.fn().mockResolvedValue({ turn: { documentId: 'turn-1' }, room: mockRoom });
            
            // @ts-expect-error: Mock
            strapi.service.mockImplementation((name) => {
                if (name === 'api::game.turn-persistence') return { 
                    updateCharacterPosition: updatePosMock,
                    persistTurn: persistTurnMock 
                };
                return {};
            });

            const service = turnProcessingFactory({ strapi });
            await service.executeDeterministicTurn('room-1', [
                { type: 'move', entityId: 'hero-1', payload: { x: 1, y: 1 } }
            ]);

            expect(updatePosMock).toHaveBeenCalledWith('hero-1', 1, 1, 0);
            expect(persistTurnMock).toHaveBeenCalled();
        });

        it('prevents collision', async () => {
            const mockRoom = {
                documentId: 'room-1',
                entity_sheets: [
                    { documentId: 'hero-1', position: { x: 0, y: 0, z: 0 } },
                    { documentId: 'wall-1', position: { x: 1, y: 1, z: 0 } }
                ]
            };

            // @ts-expect-error: Mock
            strapi.documents.mockReturnValue({ findOne: vi.fn().mockResolvedValue(mockRoom) });
            const updatePosMock = vi.fn();
            const persistTurnMock = vi.fn().mockResolvedValue({ turn: { documentId: 'turn-1' }, room: mockRoom });

            // @ts-expect-error: Mock
            strapi.service.mockImplementation((name) => {
                if (name === 'api::game.turn-persistence') return { updateCharacterPosition: updatePosMock, persistTurn: persistTurnMock };
                return {};
            });

            const service = turnProcessingFactory({ strapi });
             await service.executeDeterministicTurn('room-1', [
                { type: 'move', entityId: 'hero-1', payload: { x: 1, y: 1 } } // Moving into wall-1
            ]);

            expect(updatePosMock).not.toHaveBeenCalled(); // Should skip move
        });
    });
});
