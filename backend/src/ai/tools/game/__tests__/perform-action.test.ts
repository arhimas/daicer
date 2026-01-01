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
    dispatch() {
      return { success: true, events: [], message: 'ok' };
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

    const tool = performActionTool(mockContext);
    const schema = tool.schema;
    expect(schema).toBeInstanceOf(z.ZodObject);

    const validInput = {
      commandType: 'ATTACK',
      payload: JSON.stringify({ targetId: 't1' }),
    };

    expect(schema!.safeParse(validInput).success).toBe(true);
  });
});
