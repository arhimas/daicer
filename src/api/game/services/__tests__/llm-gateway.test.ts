
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { llmGateway } from '../llm-gateway';
import { QueueManager } from '../../../../queues/queue-manager';
import { QueueName } from '../../../../queues/contract';

// Mock QueueManager
const mockAdd = vi.fn();
vi.mock('../../../../queues/queue-manager', () => ({
  QueueManager: {
    get: () => ({
      add: mockAdd
    })
  }
}));

// Mock Strapi global
global.strapi = {
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
} as any;

describe('LLM Gateway', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should route provider="local" to GENERATE_TEXT_LOCAL queue', async () => {
        await llmGateway.queue({
            prompt: 'Test prompt',
            targetUid: 'api::test',
            targetId: '1',
            field: 'content',
            provider: 'local'
        });

        expect(mockAdd).toHaveBeenCalledWith(
            QueueName.GENERATE_TEXT_LOCAL, 
            expect.stringContaining('local-gen-api::test-1'),
            expect.objectContaining({
                prompt: 'Test prompt'
            })
        );
    });

    it('should route provider="remote" to GENERATE_TEXT_REMOTE queue', async () => {
         await llmGateway.queue({
            prompt: 'Test prompt',
            targetUid: 'api::test',
            targetId: '1',
            field: 'content',
            provider: 'remote'
        });

        expect(mockAdd).toHaveBeenCalledWith(
            QueueName.GENERATE_TEXT_REMOTE, 
            expect.stringContaining('remote-gen-api::test-1'),
            expect.objectContaining({
                prompt: 'Test prompt'
            })
        );
    });
});
