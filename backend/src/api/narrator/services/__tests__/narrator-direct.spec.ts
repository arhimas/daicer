import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Core } from '@strapi/strapi';

// Mocks
const mockToolFunc = vi.fn(() => Promise.resolve({ success: true, message: 'Tool executed' }));
const mockTools = [{ name: 'test_tool', description: 'Test Tool', func: mockToolFunc, schema: {} }];

vi.mock('../tool-registry', () => ({
  getRegistryTools: vi.fn(() => mockTools),
}));

const mockStrapi = {
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
  documents: vi.fn(() => ({
    findMany: vi.fn(() => [{ documentId: 'room1' }]), // Room found
    findOne: vi.fn(() => ({ username: 'user1' })), // User found
    create: vi.fn(() => ({ documentId: 'msg1' })), // Message created
  })),
};

// Mock Stream Manager
vi.mock('../../../utils/llm/stream-manager', () => ({
  streamManager: { broadcast: vi.fn() },
}));

// Mock LangChain (should NOT be called in direct mode)
const mockCreateAgent = vi.fn();
vi.mock('langchain', () => ({
  createAgent: mockCreateAgent,
  todoListMiddleware: vi.fn(),
  llmToolSelectorMiddleware: vi.fn(),
}));

describe('Narrator Service: Direct Execution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute tool directly when direct flag is true', async () => {
    const narratorServiceFactory = (await import('../narrator')).default;
    const narratorService = narratorServiceFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    const input = { tool: 'test_tool', args: { foo: 'bar' } };

    const result = await narratorService.processAction({
      roomId: 'room1',
      input: JSON.stringify(input),
      mode: 'debug',
      direct: true,
    });

    // Expect tool to be called
    expect(mockToolFunc).toHaveBeenCalledWith({ foo: 'bar' });

    // Expect Agent NOT to be created
    expect(mockCreateAgent).not.toHaveBeenCalled();

    // Expect proper response structure
    expect(result.thought_process).toContain('Direct Execution');
    expect(result.narration).toContain("Tool 'test_tool' executed successfully");
  });

  it('should handle direct execution errors gracefully', async () => {
    const errorToolFunc = vi.fn(() => Promise.reject(new Error('Tool failed')));
    const errorTools = [{ name: 'fail_tool', func: errorToolFunc }];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked((await import('../tool-registry')).getRegistryTools).mockReturnValueOnce(errorTools as unknown as any[]);

    const narratorServiceFactory = (await import('../narrator')).default;
    const narratorService = narratorServiceFactory({ strapi: mockStrapi as unknown as Core.Strapi });

    const input = { tool: 'fail_tool', args: {} };

    const result = await narratorService.processAction({
      roomId: 'room1',
      input: JSON.stringify(input),
      mode: 'debug',
      direct: true,
    });

    expect(result.thought_process).toBe('Direct Execution Failed');
    expect(result.narration).toContain('Error: Tool failed');
  });
});
