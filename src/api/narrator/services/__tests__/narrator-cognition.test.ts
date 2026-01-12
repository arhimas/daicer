import { describe, it, expect, vi, beforeEach } from 'vitest';
import narratorService from '../narrator';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { Core } from '@strapi/strapi';
type StrapiInterface = Core.Strapi;

// Mock Dependencies
vi.mock('langchain', () => ({
  createAgent: vi.fn(),
  todoListMiddleware: vi.fn(),
  llmToolSelectorMiddleware: vi.fn(),
}));

vi.mock('../../../utils/llm/gemini', () => ({
  getGeminiModel: vi.fn(),
}));

vi.mock('../../../utils/llm/stream-manager', () => ({
  streamManager: { broadcast: vi.fn() },
}));

vi.mock('./tool-registry', () => ({
  getRegistryTools: vi.fn(() => [{ name: 'mock_tool' }]),
}));

const mockAgent = {
  invoke: vi.fn(),
};

import { createAgent } from 'langchain';

describe('Narrator Service: Agent Cognition', () => {
  let strapi: StrapiInterface;
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    (createAgent as unknown as vi.Mock).mockResolvedValue(mockAgent);

    strapi = {
      log: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
      documents: vi.fn((uid: string) => ({
        findOne: vi.fn().mockResolvedValue({ username: 'Tester' }),
        findMany: vi.fn().mockResolvedValue(uid === 'api::room.room' ? [{ documentId: 'r1' }] : []),
        create: vi.fn().mockResolvedValue({ documentId: 'msg1' }),
      })) as unknown as StrapiInterface['documents'],
      service: vi.fn((name: string) => {
        if (name === 'api::agent.tool-registry') {
          return {
            getTools: vi
              .fn()
              .mockReturnValue([{ name: 'mock_tool', description: 'desc', schema: {}, handler: vi.fn() }]),
          };
        }
        return {};
      }),
    } as StrapiInterface;
    service = narratorService({ strapi });
  });

  it('should inject correct system prompt (Persona Constraints)', async () => {
    // Mock Prompt DB return
    const promptText = 'You are the DM. {senderName}';
    (strapi.documents as unknown as vi.Mock).mockImplementation((uid: string) => ({
      findMany: vi
        .fn()
        .mockResolvedValue(uid === 'api::prompt.prompt' ? [{ text: promptText }] : [{ documentId: 'r1' }]),
      findOne: vi.fn().mockResolvedValue({ username: 'Tester' }),
      create: vi.fn().mockResolvedValue({ documentId: 'm1' }),
    }));

    await service.processAction({ roomId: 'r1', input: 'Hello', mode: 'game', userId: 'u1' });

    expect(createAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining('You are the DM. Tester'),
      })
    );
  });

  it('should parse valid JSON output (Format Constraints)', async () => {
    const jsonOutput = JSON.stringify({
      thought_process: 'Thinking...',
      narration: 'Hello World',
      topics: [],
    });

    mockAgent.invoke.mockResolvedValue({
      messages: [new HumanMessage('Hello'), new AIMessage({ content: `\`\`\`json\n${jsonOutput}\n\`\`\`` })],
    });

    const result = await service.processAction({ roomId: 'r1', input: 'Hello', mode: 'game' });

    expect(result.narration).toBe('Hello World');
    expect(result.thought_process).toBe('Thinking...');
  });

  it('should handle malformed output gracefully', async () => {
    mockAgent.invoke.mockResolvedValue({
      messages: [new HumanMessage('Hello'), new AIMessage({ content: 'I am not returning JSON today.' })],
    });

    const result = await service.processAction({ roomId: 'r1', input: 'Hello', mode: 'game' });

    // It converts plain text to narration
    expect(result.narration).toBe('I am not returning JSON today.');
    expect(result.thought_process).toBe('Unstructured Response');
  });

  it('should handle tool calls logic (Tool Chains)', async () => {
    mockAgent.invoke.mockResolvedValue({
      messages: [
        new HumanMessage('Summon an Orc'),
        // Intermediate messages skipped in this simplified mock response,
        // but we simulate the agent returning FINAL json after tools.
        // Actually the service logs tools but returns the FINAL message content.
        // To verify tool calling was logged/processed, we verify SIDE EFFECTS.
        // The service reads `result.messages` and logs them.
        // It also checks for `shouldBroadcastEntities` if `summon_entity` usage is detected in `tool_calls`.

        new AIMessage({
          content: '',
          tool_calls: [{ name: 'summon_entity', args: {}, id: '1' }],
        }),
        new AIMessage({
          content: JSON.stringify({ narration: 'Summoned.' }),
        }),
      ],
    });

    // We need to mock findMany returning sheets to trigger broadcast properly
    (strapi.documents as unknown as vi.Mock).mockImplementation((uid: string) => {
      if (uid === 'api::room.room') return { findMany: vi.fn().mockResolvedValue([{ documentId: 'r1' }]) };
      if (uid === 'api::entity-sheet.entity-sheet') return { findMany: vi.fn().mockResolvedValue([{ name: 'Orc' }]) };
      return {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        findOne: vi.fn().mockResolvedValue({}),
      };
    });

    const result = await service.processAction({ roomId: 'r1', input: 'Summon', mode: 'game' });

    // Logic check: shouldBroadcastEntities = true because of 'summon_entity' tool call
    // This triggers `api::time-frame.time-frame`.create
    expect(strapi.documents).toHaveBeenCalledWith('api::time-frame.time-frame');
    expect(result.narration).toBe('Summoned.');
  });
});
