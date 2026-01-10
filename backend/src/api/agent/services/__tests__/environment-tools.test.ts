import { describe, it, expect, vi, beforeEach } from 'vitest';
import toolRegistryFactory from '../tool-registry';

// Mock Strapi
const mockUpdate = vi.fn();
const mockFindOne = vi.fn();

const mockStrapi = {
  service: vi.fn(),
  documents: vi.fn(() => ({
    findOne: mockFindOne,
    update: mockUpdate,
  })),
};

describe('ToolRegistry - Environment Tools', () => {
  let toolRegistry: any;

  beforeEach(() => {
    vi.clearAllMocks();
    toolRegistry = toolRegistryFactory({ strapi: mockStrapi as any });
  });

  const roomId = 'room-123';

  describe('Time Tools', () => {
    it('set_time should update time using number', async () => {
      mockFindOne.mockResolvedValueOnce({ world: { time: 0 } }); // Initial fetch inside set_time

      const result = await toolRegistry.execute('set_time', roomId, { time: 3600 }, {});

      expect(mockUpdate).toHaveBeenCalledWith({
        documentId: roomId,
        data: {
          world: { time: 3600 },
        },
      });
      expect(result).toEqual({ success: true, time: 3600 });
    });

    it('set_time should parse "7pm" correctly', async () => {
      // Setup: current time 0 -> day 0
      mockFindOne.mockResolvedValueOnce({ world: { time: 0 } });

      const result = await toolRegistry.execute('set_time', roomId, { time: '7pm' }, {});

      // 7pm = 19:00 = 19 * 3600 = 68400 seconds
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: roomId,
          data: expect.objectContaining({
            world: expect.objectContaining({ time: 68400 }),
          }),
        })
      );
      expect(result).toEqual({ success: true, time: 68400 });
    });

    it('get_time should return formatted time', async () => {
      // 10:30 AM = 10 * 3600 + 30 * 60 = 36000 + 1800 = 37800
      mockFindOne.mockResolvedValueOnce({ world: { time: 37800 } });

      const result = await toolRegistry.execute('get_time', roomId, {}, {});

      expect(result).toEqual({
        time: 37800,
        day: 0,
        formatted: '10:30',
      });
    });
  });

  describe('Entropy Tools', () => {
    const mockState = {
      conditions: [
        { key: 'Local Weather', currentValue: 'Clear', lastUpdatedTurn: 0 },
        { key: 'Politics', currentValue: 'Peaceful', lastUpdatedTurn: 0 },
      ],
    };

    it('set_entropy should update condition', async () => {
      mockFindOne.mockResolvedValueOnce({ entropyState: structuredClone(mockState) });

      const result = await toolRegistry.execute('set_entropy', roomId, { key: 'Politics', value: 'War' }, {});

      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      const updatedState = updateCall.data.entropyState;
      const condition = updatedState.conditions.find((c: any) => c.key === 'Politics');

      expect(condition.currentValue).toBe('War');
      expect(result).toMatchObject({ success: true });
    });

    it('get_entropy should return state', async () => {
      mockFindOne.mockResolvedValueOnce({ entropyState: mockState });

      const result = await toolRegistry.execute('get_entropy', roomId, {}, {});
      expect(result).toEqual(mockState);
    });
  });

  describe('Weather Tools', () => {
    const mockState = {
      conditions: [{ key: 'Local Weather', currentValue: 'Clear', lastUpdatedTurn: 0 }],
    };

    it('set_weather should update Local Weather condition', async () => {
      mockFindOne.mockResolvedValueOnce({ entropyState: structuredClone(mockState) }); // For inner set_entropy

      await toolRegistry.execute('set_weather', roomId, { weather: 'Storm' }, {});

      expect(mockUpdate).toHaveBeenCalled();
      const updateCall = mockUpdate.mock.calls[0][0];
      const updatedState = updateCall.data.entropyState;
      const condition = updatedState.conditions.find((c: any) => c.key === 'Local Weather');

      expect(condition.currentValue).toBe('Storm');
    });

    it('get_weather should return Local Weather condition', async () => {
      mockFindOne.mockResolvedValueOnce({ entropyState: mockState }); // For inner get_entropy

      const result = await toolRegistry.execute('get_weather', roomId, {}, {});

      expect(result).toEqual({ key: 'Local Weather', currentValue: 'Clear', lastUpdatedTurn: 0 });
    });
  });
});
