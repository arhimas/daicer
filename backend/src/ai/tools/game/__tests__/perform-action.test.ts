import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performActionTool } from '../perform-action';
import { z } from 'zod';

// Mock the Strapi global
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
const mockEmit = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    findMany: mockFindMany,
    findOne: mockFindMany, // Reuse findMany since we override return values per test
    update: mockUpdate,
  }),
  io: {
    to: () => ({
      emit: mockEmit,
    }),
  },
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
});

// Hoist the dispatch mock so it can be used in the factory
const { mockDispatch } = vi.hoisted(() => ({
  mockDispatch: vi.fn(() => ({ success: true, events: [], message: 'ok' })),
}));

// Mock the Engine's processTurn (since it's imported)
vi.mock('@daicer/engine', () => ({
  processTurn: vi.fn(() => ({
    type: 'movement',
    entityId: 'ent-123',
    from: { x: 0, y: 0, z: 0 },
    to: { x: 1, y: 0, z: 0 },
  })),
  EntityDeriver: {
    derive: vi.fn(() => ({
      id: 'ent-123',
      conversational_state: {},
    })),
  },
  ActionDispatcher: class {
    dispatch(state: any, command: any) {
      return mockDispatch(state, command);
    }
  },
}));

describe('performActionTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(performActionTool).toBeDefined();
  });

  it('should have a valid schema', () => {
    const mockContext = {
      strapi: (globalThis as unknown as { strapi: unknown }).strapi,
      roomDocumentId: 'room-123',
    };

    const tool = performActionTool(mockContext as any);
    const schema = tool.schema;
    expect(schema).toBeInstanceOf(z.ZodObject);

    const validInput = {
      commandType: 'ATTACK',
      payload: JSON.stringify({ targetId: 't1' }),
    };

    expect(schema!.safeParse(validInput).success).toBe(true);
  });

  it('should normalize skill check payload keys (skill/stat -> attribute)', async () => {
    const mockContext = {
      strapi: (globalThis as unknown as { strapi: any }).strapi,
      roomDocumentId: 'room-123',
    };

    // 1. Mock Room Find setup
    // We expect finding players/entities to return something valid so the tool proceeds
    mockFindMany.mockImplementation((query) => {
      // If searching for entities with filters, return match
      return [];
    });
    // findOne for room
    mockFindMany.mockResolvedValueOnce({
      documentId: 'room-123',
      entity_sheets: [],
      players: [],
      config: {},
    });

    // 2. Execute Tool
    const tool = performActionTool(mockContext as any);

    // Simulate Agent sending 'skill' instead of 'attribute'
    await tool.func(
      {
        commandType: 'SKILL_CHECK',
        payload: JSON.stringify({ actorId: 'hero-1', skill: 'acrobatics' }),
      },
      mockContext as any
    );

    // 3. Verify Dispatcher Call
    // The second argument to dispatch should be the Command object.
    // We expect: type: 'SKILL_CHECK', actorId: 'hero-1', attribute: 'acrobatics'
    expect(mockDispatch).toHaveBeenCalled();
    const callArgs = mockDispatch.mock.calls[0];
    const command = callArgs[1];

    expect(command).toMatchObject({
      type: 'SKILL_CHECK',
      payload: {
        actorId: 'hero-1',
        attribute: 'acrobatics', // Normalized from 'skill'
      },
    });
  });
});
