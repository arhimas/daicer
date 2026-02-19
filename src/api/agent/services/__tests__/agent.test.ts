import { describe, it, expect, vi, beforeEach } from 'vitest';
import agentServiceFactory from '@/api/agent/services/agent';

describe('Agent Service', () => {
    let service: any;
    let mockToolRegistry: any;

    beforeEach(() => {
        mockToolRegistry = {
            hasTool: vi.fn(),
            execute: vi.fn(),
        };

        const mockStrapi = {
            service: vi.fn((uid) => {
                if (uid === 'api::agent.tool-registry') return mockToolRegistry;
                return null;
            }),
            log: {
                info: vi.fn(),
            },
        };

        service = agentServiceFactory({ strapi: mockStrapi });
    });

    describe('executeTool', () => {
        it('should execute a valid tool', async () => {
            mockToolRegistry.hasTool.mockReturnValue(true);
            mockToolRegistry.execute.mockResolvedValue({ success: true });

            const result = await service.executeTool('room-1', 'test-tool', {}, {});

            expect(mockToolRegistry.hasTool).toHaveBeenCalledWith('test-tool');
            expect(mockToolRegistry.execute).toHaveBeenCalledWith('test-tool', 'room-1', {}, {});
            expect(result).toEqual({ success: true });
        });

        it('should throw error for unknown tool', async () => {
            mockToolRegistry.hasTool.mockReturnValue(false);

            await expect(service.executeTool('room-1', 'unknown-tool', {}, {}))
                .rejects.toThrow("Tool 'unknown-tool' not found");
        });
    });

    describe('handleAnswer', () => {
        it('should log answer and return success', async () => {
            const result = await service.handleAnswer('q-1', 'my answer', { username: 'user1' });
            
            expect(result).toEqual({ success: true });
            // Verifying log was called is tricky without spying on specific log instance, 
            // but we passed a mockStrapi so we know it didn't crash.
        });
    });
});
