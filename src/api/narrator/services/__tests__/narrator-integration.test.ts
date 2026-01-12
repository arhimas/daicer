import { describe, it, expect, vi, beforeEach } from 'vitest';
import narratorFactory from '../narrator';
import type { Core } from '@strapi/strapi';
type StrapiInterface = Core.Strapi;
import { getRegistryTools } from '../tool-registry';

// --- Mocks ---
const mockStrapi = {
  log: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  documents: vi.fn(),
};

// Mock Dependencies
vi.mock('../../../../utils/llm/gemini', () => ({
  getGeminiModel: vi.fn(() => ({})), // Mock LLM object
}));

vi.mock('../../../../utils/llm/stream-manager', () => ({
  streamManager: {
    broadcast: vi.fn(),
  },
}));

vi.mock('../tool-registry', () => ({
  getRegistryTools: vi.fn(() => [] as any[]), // Return empty list by default, override in tests
}));

vi.mock('langchain', () => ({
  createAgent: vi.fn(),
  todoListMiddleware: vi.fn(),
  llmToolSelectorMiddleware: vi.fn(),
}));

import { createAgent } from 'langchain';

describe('Narrator Service Integration', () => {
  let service: ReturnType<typeof narratorFactory>;
  let mockAgentInstance: { invoke: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    service = narratorFactory({ strapi: mockStrapi as unknown as StrapiInterface });

    // Setup Agent Mock
    mockAgentInstance = {
      invoke: vi.fn().mockResolvedValue({
        messages: [
          { _getType: () => 'human', content: 'Hello' },
          { _getType: () => 'ai', content: 'I am the DM.', tool_calls: [] },
        ],
      }),
    };
    (createAgent as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockAgentInstance);

    // Setup Strapi DB Mocks
    const findManyMock = vi.fn().mockResolvedValue([]);
    const findOneMock = vi.fn().mockResolvedValue({ documentId: 'u1', username: 'Tester' });
    const createMock = vi.fn().mockResolvedValue({ documentId: 'msg-1', content: 'Hello' });

    mockStrapi.documents.mockReturnValue({
      findMany: findManyMock,
      findOne: findOneMock,
      create: createMock,
    } as unknown);
  });

  // 1. Orchestration & Flow
  it('should initialize agent and invoke it with user input', async () => {
    // Setup Room
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1', roomId: 'ROOM-1' }]);

    await service.processAction({ roomId: 'room-1', input: 'Hello DM', userId: 'u1' });

    expect(createAgent).toHaveBeenCalled();
    expect(mockAgentInstance.invoke).toHaveBeenCalledWith({
      messages: [expect.objectContaining({ content: 'Hello DM' })],
    });
  });

  // 3. Response Processing (JSON parsing)
  it('should parse JSON output from LLM correctly', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1' }]);

    mockAgentInstance.invoke.mockResolvedValue({
      messages: [
        {
          _getType: () => 'ai',
          content: JSON.stringify({ narration: 'Parsed JSON', thought_process: 'Thinking' }),
        },
      ],
    });

    const result = await service.processAction({ roomId: 'room-1', input: 'Status', userId: 'u1' });

    expect(result.narration).toBe('Parsed JSON');
    expect(result.thought_process).toBe('Thinking');
  });

  // 4. Error Recovery
  it('should handle agent failures gracefully', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1' }]);

    // Force Error
    mockAgentInstance.invoke.mockRejectedValue(new Error('LLM Timeout'));

    const result = await service.processAction({ roomId: 'room-1', input: 'Fail me', userId: 'u1' });

    expect(result.thought_process).toBe('Agent Error');
    expect(result.narration).toContain('LLM Timeout');
    expect(mockStrapi.log.error).toHaveBeenCalled();
  });

  // 5. Tool Registry Injection
  it('should retrieve tools for the correct room and mode', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1' }]);

    await service.processAction({ roomId: 'room-1', input: 'Test', mode: 'debug' });

    expect(getRegistryTools).toHaveBeenCalledWith(expect.any(Object), 'room-1', 'debug');
  });

  // 6. Branching & Edge Cases
  it('should throw error if room is not found', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([]); // No room found

    await expect(service.processAction({ roomId: 'bad-room', input: 'Hi' })).rejects.toThrow(
      'Room not found for ID: bad-room'
    );
  });

  it('should fallback to default senderName if user not found', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1' }]); // Room found
    mockStrapi.documents().findOne.mockResolvedValueOnce(null); // User not found

    // We need to spy on createMessage to check senderName
    const createSpy = mockStrapi.documents().create;

    await service.processAction({ roomId: 'room-1', input: 'Hi', userId: 'bad-u1' });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ senderName: 'Player' }),
      })
    );
  });

  it('should use user username if found', async () => {
    mockStrapi.documents().findMany.mockResolvedValueOnce([{ documentId: 'room-1' }]);
    // findOne defaults to { username: 'Tester' } from beforeEach, but we can override or rely on it

    const createSpy = mockStrapi.documents().create;

    await service.processAction({ roomId: 'room-1', input: 'Hi', userId: 'u1' });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ senderName: 'Tester' }),
      })
    );
  });

  it('should load system prompt from DB if available', async () => {
    mockStrapi.documents.mockImplementation((uid) => ({
      findMany: vi
        .fn()
        .mockResolvedValue(
          uid === 'api::room.room'
            ? [{ documentId: 'room-1' }]
            : uid === 'api::prompt.prompt'
              ? [{ text: 'CUSTOM PROMPT FROM DB' }]
              : []
        ),
      create: vi.fn().mockResolvedValue({ documentId: 'msg-123', content: 'Hi' }),
      findOne: vi.fn(),
    }));

    await service.processAction({ roomId: 'room-1', input: 'Hi' });

    // We can't easily check the prompt passed to createAgent because it's inside the function closure
    // But createAgent is mocked!
    expect(createAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining('CUSTOM PROMPT FROM DB'),
      })
    );
  });
});
