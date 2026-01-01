import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moveEntityTool } from '../move-entity';
import { z } from 'zod';

const mockGetGameState = vi.fn();
const mockValidateMove = vi.fn();
const mockLogEvent = vi.fn();
const mockUpdate = vi.fn();
const mockBroadcast = vi.fn();

vi.stubGlobal('strapi', {
  service: (uid: string) => {
    if (uid === 'api::game-event.game-event') {
      return {
        getGameState: mockGetGameState,
        validateMove: mockValidateMove,
        logEvent: mockLogEvent,
      };
    }
    if (uid === 'api::game.game-broadcaster') return { broadcastRoomEntities: mockBroadcast };
    return {};
  },
  documents: () => ({
    update: mockUpdate,
  }),
  log: {
    warn: vi.fn(),
    error: vi.fn(),
  },
});

describe('moveEntityTool', () => {
  const mockContext = {
    strapi: (globalThis as any).strapi,
    roomDocumentId: 'room-123',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should move entity on valid input', async () => {
    mockGetGameState.mockResolvedValue({
      entities: { 'ent-1': { x: 0, y: 0, z: 0 } },
    });
    mockValidateMove.mockResolvedValue({ valid: true });

    const tool = moveEntityTool(mockContext);
    const result = await tool.func({ entityId: 'ent-1', x: 5, y: 5, z: 0 }, mockContext);

    expect(mockUpdate).toHaveBeenCalledWith({
      documentId: 'ent-1',
      data: { position: { x: 5, y: 5, z: 0 } },
    });
    expect(mockLogEvent).toHaveBeenCalled();
    expect(mockBroadcast).toHaveBeenCalled();
    expect(result).toContain('Moved entity ent-1');
  });

  it('should return error if entity not in room', async () => {
    mockGetGameState.mockResolvedValue({ entities: {} });

    const tool = moveEntityTool(mockContext);
    const result = await tool.func({ entityId: 'ent-missing', x: 5, y: 5, z: 0 }, mockContext);

    expect(result).toContain('not found active');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should return error if validation fails', async () => {
    mockGetGameState.mockResolvedValue({
      entities: { 'ent-1': { x: 0, y: 0, z: 0 } },
    });
    mockValidateMove.mockResolvedValue({ valid: false, reason: 'Collision' });

    const tool = moveEntityTool(mockContext);
    const result = await tool.func({ entityId: 'ent-1', x: 5, y: 5, z: 0 }, mockContext);

    expect(result).toContain('Failed to move: Collision');
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
