import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { knowledgeCommand } from '../commands/knowledge';
import { client } from '../utils/client';

// Mock Client
vi.mock('../utils/client', () => ({
  client: {
    fetch: vi.fn(),
    collection: vi.fn(() => ({ find: vi.fn() })),
  },
}));

// Mock Console
const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`Process Exit ${code}`);
});

describe('CLI: knowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // afterEach(() => {
  //   vi.restoreAllMocks(); // Removed to persist console spy across tests
  // });

  it('should output correct JSON structure for manual search', async () => {
    // Mock API Response
    const mockResponse = [
      {
        id: 'snip-1',
        title: 'Manual Source',
        score: 0.9,
        kind: 'knowledge',
        sourceName: 'Source 1',
        tags: ['manual'],
      },
    ];

    (client.fetch as any).mockResolvedValue({
      json: async () => ({
        data: mockResponse,
        meta: { count: 1 },
      }),
    });

    // Execute Action Handler directly to avoid Commander parsing complexity if we want pure unit test
    // But testing via parsing is better integration.
    // knowledgeCommand is a Commander instance.
    // We can call .parseAsync with args.

    // We need to suppress 'clean' exit? Commander calls process.exit?
    // We configure commander to throw instead of exit if possible, but knowledgeCommand is exported instance.
    // Let's call the action handler?
    // knowledgeCommand._actionHandler gets it?
    // Easier: invoke the action function exported? It's not exported.
    // We will simulate .parseAsync

    try {
      await knowledgeCommand.parseAsync(['node', 'cli', '-q', 'test', '-t', 'manual', '--json']);
    } catch (e) {
      // catch process exit throw
      if (!e.message.includes('Process Exit')) throw e;
    }

    // Assert fetch called correctly (POST to semantic-search)
    expect(client.fetch).toHaveBeenCalledWith(
      '/semantic-search/search',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"query":"test"'),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Assert Console Output
    const lastCallArgs = mockLog.mock.lastCall;
    const jsonOutput = JSON.parse(lastCallArgs[0]);
    // The CLI extracts result.data now.
    // My mockResponse above was [ ... ].
    // The CLI expects client.fetch(...).json() to return { data: [...] }.
    // So I need to update the MOCK response structure in the test setup.

    expect(jsonOutput.meta.targets).toContain('manual');
    expect(jsonOutput.data).toHaveLength(1);
    expect(jsonOutput.data[0].title).toBe('Manual Source');
  });

  it('should output correct JSON structure for granular entity search (-t spell)', async () => {
    (client.fetch as any).mockResolvedValue({
      json: async () => ({ data: [], meta: { count: 0 } }),
    });

    try {
      await knowledgeCommand.parseAsync(['node', 'cli', '-q', 'fireball', '-t', 'spell', '--json']);
    } catch (e) {}

    expect(client.fetch).toHaveBeenCalledWith(
      '/semantic-search/search',
      expect.objectContaining({
        body: expect.stringContaining('"targets":["spell"]'),
      })
    );

    // Debug
    console.warn('Mock Log Calls:', mockLog.mock.calls.length);
    console.warn('Mock Error Calls:', mockError.mock.calls.length);

    if (mockLog.mock.calls.length > 0) {
      const lastCallArgs = mockLog.mock.lastCall;
      const jsonOutput = JSON.parse(lastCallArgs[0]);
      expect(jsonOutput.meta.targets).toContain('spell');
    } else {
      // Fallback or fail
      // If error occurred?
      if (mockError.mock.calls.length > 0) {
        console.error('Captured Error:', mockError.mock.lastCall[0]);
      }
      throw new Error('Console log never called');
    }
  });
});
