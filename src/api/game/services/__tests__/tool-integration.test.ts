/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import toolExecutorFactory from '../tool-executor';

// Mock Strapi
const mockExecute = vi.fn();
const mockHasTool = vi.fn();

const mockStrapi = {
  log: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  service: vi.fn((name) => {
    if (name === 'api::agent.tool-registry') {
      return {
        hasTool: mockHasTool,
        execute: mockExecute,
      };
    }
    return {};
  }),
};

describe('ToolExecutor Integration', () => {
  let toolExecutor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    toolExecutor = toolExecutorFactory({ strapi: mockStrapi as any });
  });

  it('should parse simple string arguments and delegate to registry', async () => {
    mockHasTool.mockReturnValue(true);
    mockExecute.mockResolvedValue({ success: true });

    const toolString = 'set_weather(weather="Storm")';
    await toolExecutor.execute('room-1', toolString);

    expect(mockHasTool).toHaveBeenCalledWith('set_weather');
    expect(mockExecute).toHaveBeenCalledWith(
      'set_weather',
      'room-1',
      { weather: 'Storm' },
      expect.objectContaining({ id: 'system-executor' })
    );
  });

  it('should parse number arguments', async () => {
    mockHasTool.mockReturnValue(true);
    mockExecute.mockResolvedValue({ success: true });

    const toolString = 'set_time(time=12345)';
    await toolExecutor.execute('room-1', toolString);

    expect(mockExecute).toHaveBeenCalledWith('set_time', 'room-1', { time: 12345 }, expect.anything());
  });

  it('should parse mixed arguments', async () => {
    mockHasTool.mockReturnValue(true);
    mockExecute.mockResolvedValue({ success: true });

    // spawn_entity(blueprintId="goblin", type="monster", position={x:10, y:10})
    const toolString = 'spawn_entity(blueprintId="goblin", type="monster", position={"x":10, "y":10})';
    await toolExecutor.execute('room-1', toolString);

    expect(mockExecute).toHaveBeenCalledWith(
      'spawn_entity',
      'room-1',
      expect.objectContaining({
        blueprintId: 'goblin',
        type: 'monster',
        position: { x: 10, y: 10 },
      }),
      expect.anything()
    );
  });

  it('should throw error if tool is not registered', async () => {
    mockHasTool.mockReturnValue(false);

    const toolString = 'unknown_tool(arg=1)';
    await expect(toolExecutor.execute('room-1', toolString)).rejects.toThrow(/not registered/);
  });
});
