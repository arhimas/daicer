import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summonCharacterTool } from '../summon-character';
import { StrapiContext } from '../../../tools/tool-factory';

const mockSpawnCharacter = vi.fn();
const mockBroadcast = vi.fn();
const mockLogEvent = vi.fn();
const mockFindOne = vi.fn();

vi.stubGlobal('strapi', {
  service: (uid: string) => {
    if (uid === 'api::game.spawn-service') return { spawnCharacter: mockSpawnCharacter };
    if (uid === 'api::game.game-broadcaster') return { broadcastRoomEntities: mockBroadcast };
    if (uid === 'api::game-event.game-event') return { logEvent: mockLogEvent };
    return {};
  },
  documents: () => ({
    findOne: mockFindOne,
  }),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
});

describe('summonCharacterTool', () => {
  const mockContext = {
    strapi: (globalThis as unknown as { strapi: unknown }).strapi,
    roomDocumentId: 'room-123',
    // Simulate user context if needed, but tool signature usually takes context.
    // The current tool factory might use context.state.user?
    // Usually tool-factory passes { strapi, roomDocumentId, ... }
    // Let's assume the tool uses context correctly.
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should summon NPC (no owner) when no user in context', async () => {
    mockFindOne.mockResolvedValue({ documentId: 'tpl-1', name: 'Guard' });
    mockSpawnCharacter.mockResolvedValue({ documentId: 'inst-1', name: 'Guard', type: 'npc' });

    const tool = summonCharacterTool(mockContext as unknown as StrapiContext);
    const result = await tool.func(
      { templateId: 'tpl-1', x: 10, y: 10, z: 0 },
      mockContext as unknown as StrapiContext
    );

    expect(mockSpawnCharacter).toHaveBeenCalledWith('room-123', 'tpl-1', { x: 10, y: 10, z: 0 }, undefined);
    expect(result).toContain('Successfully summoned "Guard"');
  });

  it('should summon Player Character when user is in context', async () => {
    const userContext = {
      ...mockContext,
      user: { documentId: 'user-123' },
    };

    mockFindOne.mockResolvedValue({ documentId: 'tpl-hero', name: 'Hero' });
    // Service should return player type if ownerId passed
    mockSpawnCharacter.mockResolvedValue({ documentId: 'inst-hero', name: 'Hero', type: 'player' });

    const tool = summonCharacterTool(userContext as unknown as StrapiContext);
    await tool.func({ templateId: 'tpl-hero', x: 20, y: 20, z: 0 }, userContext as unknown as StrapiContext);

    expect(mockSpawnCharacter).toHaveBeenCalledWith('room-123', 'tpl-hero', { x: 20, y: 20, z: 0 }, 'user-123');
  });

  it('should broadcast event after summon', async () => {
    mockFindOne.mockResolvedValue({ documentId: 'tpl-1', name: 'Guard' });
    mockSpawnCharacter.mockResolvedValue({ documentId: 'inst-1', name: 'Guard', type: 'npc' });

    const tool = summonCharacterTool(mockContext as unknown as StrapiContext);
    await tool.func({ templateId: 'tpl-1', x: 10, y: 10, z: 0 }, mockContext as unknown as StrapiContext);

    expect(mockBroadcast).toHaveBeenCalledWith('room-123');
    expect(mockLogEvent).toHaveBeenCalledWith('room-123', 'SPAWN_ENTITY', expect.any(Object));
  });

  // Note: The concept of "Owner" (Player vs NPC) is currently handled inside `spawn-service`
  // or primarily determined by the template type.
  // The tool interface just passes templateId.
  // If we want to test "Player Owner", we need to check if spawnCharacter assigns it.
  // But spawnCharacter is mocked here. So we are testing the Tool's orchestration.
  // We should verify `spawn-service.ts` logic separately if we want to confirm ownership assignment.
});
