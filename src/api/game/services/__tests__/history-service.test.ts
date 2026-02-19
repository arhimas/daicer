
import { describe, it, expect, vi, beforeEach } from 'vitest';
import historyService from '../history-service';
import { DeterministicTurnProcessor } from '@daicer/engine/core/deterministic-turn-processor';

// Mock DeterministicTurnProcessor
vi.mock('@daicer/engine/core/deterministic-turn-processor', () => {
    const MockProcessor = vi.fn();
    MockProcessor.prototype.process = vi.fn((state) => state); // Pass-through for simplicity
    return {
        DeterministicTurnProcessor: MockProcessor,
    };
});

describe('History Service', () => {
    let service: ReturnType<typeof historyService>;
    let mockStrapi: any;
    let mockDocuments: any;

    beforeEach(() => {
        mockDocuments = {
            findMany: vi.fn(),
        };
        mockStrapi = {
            documents: vi.fn(() => mockDocuments),
        };
        
        // Reset mocks
        vi.clearAllMocks();
        
        service = historyService({ strapi: mockStrapi });
    });

    it('should replayTo using a snapshot', async () => {
        const roomId = 'room-1';
        const targetTime = 100;
        
        // Mock snapshot
        const mockSnapshot = {
            documentId: 'snap-1',
            timestamp: 50,
            gameState: { entities: [{ id: 'e1', position: {x:0,y:0,z:0} }], exploredTiles: [] }
        };
        
        // Mock events
        const mockEvents = [
            { type: 'MOVE', actorId: 'e1', payload: { x:1, y:0 }, timestamp: 60 }
        ];

        // findMany call 1: Snapshot
        mockDocuments.findMany.mockResolvedValueOnce([mockSnapshot]);
        // findMany call 2: Events
        mockDocuments.findMany.mockResolvedValueOnce(mockEvents);

        const result = await service.replayTo(roomId, targetTime);

        expect(mockDocuments.findMany).toHaveBeenCalledTimes(2);
        // Verify snapshot filter
        expect(mockDocuments.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
            filters: expect.objectContaining({ timestamp: { $lte: targetTime } })
        }));
        
        // Verify processor usage
        // Since we mocked process to be pass-through, result should match hydrated base state (roughly)
        // In real logic, process would change state.
        // We verify DeterministicTurnProcessor was instantiated and process called.
        const mockProcessorInstance = vi.mocked(DeterministicTurnProcessor).mock.instances[0];
        expect(mockProcessorInstance.process).toHaveBeenCalled();
    });

    it('should replayTo from zero state if no snapshot found', async () => {
        const roomId = 'room-1';
        
        // findMany call 1: No Snapshot
        mockDocuments.findMany.mockResolvedValueOnce([]);
        // findMany call 2: Events
        mockDocuments.findMany.mockResolvedValueOnce([]);

        await service.replayTo(roomId, 100);

        // Should use default empty state
        const mockProcessorInstance = vi.mocked(DeterministicTurnProcessor).mock.instances[0];
        expect(mockProcessorInstance.process).not.toHaveBeenCalled(); // No events to process
    });

    it('should getTimelineData', async () => {
        const roomId = 'room-1';
        
        mockDocuments.findMany.mockResolvedValueOnce([{ documentId: 'ev-1', type: 'MOVE', payload: {} }]); // Events
        mockDocuments.findMany.mockResolvedValueOnce([{ documentId: 'snap-1', timestamp: 100 }]); // Snapshots

        const result = await service.getTimelineData(roomId);

        expect(result.events).toHaveLength(1);
        expect(result.snapshots).toHaveLength(1);
        expect(result.events[0].type).toBe('event');
        expect(result.snapshots[0].type).toBe('snapshot');
    });

    it('should hydrateState correctly', async () => {
        const json = {
            entities: [{ documentId: 'e1', position: {x:1,y:1,z:1}, stats: { hp: 20, maxHp: 20 } }],
            room: { exploredTiles: ['0,0,0'] }
        };
        
        const state = service.hydrateState(json);
        
        expect(state.entities).toHaveLength(1);
        expect(state.entities[0].id).toBe('e1');
        expect(state.exploredTiles.has('0,0,0')).toBe(true);
    });
});
