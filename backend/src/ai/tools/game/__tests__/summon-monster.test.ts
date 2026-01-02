import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summonMonsterTool } from '../summon-monster';
import { z } from 'zod';

const mockSpawnMonster = vi.fn();
const mockBroadcast = vi.fn();
const mockFindOne = vi.fn();

vi.stubGlobal('strapi', {
  service: (uid: string) => {
    if (uid === 'api::game.spawn-service') return { spawnMonster: mockSpawnMonster };
    if (uid === 'api::game.game-broadcaster') return { broadcastRoomEntities: mockBroadcast };
    if (uid === 'api::game-event.game-event') return { logEvent: vi.fn() };
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

describe('summonMonsterTool', () => {
  const mockContext = {
    strapi: (globalThis as unknown as { strapi: unknown }).strapi,
    roomDocumentId: 'room-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct schema', () => {
    const tool = summonMonsterTool(mockContext);
    expect(tool.schema).toBeInstanceOf(z.ZodObject);
    expect(tool.name).toBe('summon_monster');
  });

  it('should summon monster successfully', async () => {
    mockFindOne.mockResolvedValue({ documentId: 'tpl-1', name: 'Goblin' });
    mockSpawnMonster.mockResolvedValue({ documentId: 'inst-1', name: 'Goblin' });

    const tool = summonMonsterTool(mockContext);
    const result = await tool.func({ templateId: 'tpl-1', x: 10, y: 10, z: 0 }, mockContext);

    expect(mockFindOne).toHaveBeenCalledWith({ documentId: 'tpl-1' });
    expect(mockSpawnMonster).toHaveBeenCalledWith('room-123', 'tpl-1', { x: 10, y: 10, z: 0 });
    expect(mockBroadcast).toHaveBeenCalledWith('room-123');
    expect(result).toContain('Successfully summoned "Goblin"');
  });

  it('should return error if template not found', async () => {
    mockFindOne.mockResolvedValue(null);

    const tool = summonMonsterTool(mockContext);
    const result = await tool.func({ templateId: 'missing', x: 0, y: 0, z: 0 }, mockContext);

    expect(result).toContain('not found');
    expect(mockSpawnMonster).not.toHaveBeenCalled();
  });

  it('should handle spawn errors gracefully', async () => {
    mockFindOne.mockResolvedValue({ documentId: 'tpl-1' });
    mockSpawnMonster.mockRejectedValue(new Error('Spawn failed'));

    const tool = summonMonsterTool(mockContext);
    const result = await tool.func({ templateId: 'tpl-1', x: 0, y: 0, z: 0 }, mockContext);

    expect(result).toContain('Failed to summon monster');
    expect(result).toContain('Spawn failed');
  });
});
