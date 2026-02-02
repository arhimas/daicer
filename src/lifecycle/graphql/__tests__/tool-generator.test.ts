import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { generateToolGraphQL } from '../tool-generator';

const mockGetTools = vi.fn();

const mockStrapi = {
  service: vi.fn((uid) => {
    if (uid === 'api::agent.tool-registry') {
      return {
        getTools: mockGetTools,
      };
    }
    return null;
  }),
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
} as any;

describe('generateToolGraphQL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTools.mockReturnValue([]);
  });

  it('should return empty definitions if no tools are registered', () => {
    const { typeDefs, resolvers } = generateToolGraphQL(mockStrapi);
    expect(typeDefs).toContain('type AgentToolParameter');
    expect(typeDefs).toContain('extend type Query');
    expect(resolvers.Mutation).toEqual({});
  });

  it('should generate SDL and resolvers for registered tools', () => {
    const mockTool = {
      name: 'test_tool',
      description: 'A test tool',
      schema: z.object({
        targetId: z.string(),
        amount: z.number().optional(),
      }),
      execute: vi.fn(),
    };
    mockGetTools.mockReturnValue([mockTool]);

    const { typeDefs, resolvers } = generateToolGraphQL(mockStrapi);

    // Verify SDL
    expect(typeDefs).toContain('input ToolTestToolInput');
    expect(typeDefs).toContain('targetId: String');
    expect(typeDefs).toContain('amount: Float');
    expect(typeDefs).toContain('testTool(roomId: String!, input: ToolTestToolInput!): JSON');

    // Verify Resolver
    expect(resolvers.Mutation).toHaveProperty('testTool');
    expect(typeof resolvers.Mutation.testTool).toBe('function');
  });

  it('should generate validation logic in resolvers (placeholder check)', async () => {
    // Currently the resolver throws error as per code "Tool Execution via GraphQL requires..."
    const mockTool = {
      name: 'failing_tool',
      description: 'A failing tool',
      schema: z.object({}),
    };
    mockGetTools.mockReturnValue([mockTool]);
    const { resolvers } = generateToolGraphQL(mockStrapi);

    // Check if calling it throws
    await expect(async () => {
      await resolvers.Mutation.failingTool({}, { roomId: '123', input: {} }, {});
    }).rejects.toThrow('Tool Execution via GraphQL requires specific RoomID handling logic');
  });

  it('should handle complex Zod schemas gracefully in SDL', () => {
    const mockTool = {
      name: 'complex_tool',
      description: 'Complex',
      schema: z.object({
        tags: z.array(z.string()),
        meta: z.object({ foo: z.string() }),
      }),
    };
    mockGetTools.mockReturnValue([mockTool]);

    const { typeDefs } = generateToolGraphQL(mockStrapi);
    expect(typeDefs).toContain('tags: [JSON]'); // or whatever current implementation does
    expect(typeDefs).toContain('meta: JSON');
  });
});
