import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSocket from '../useSocket';

// Mock the socket service with hoisting
const mocks = vi.hoisted(() => ({
  initSocket: vi.fn(),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
  emit: vi.fn(),
}));

vi.mock('../../services/socket', () => ({
  initSocket: (...args: any[]) => mocks.initSocket(...args),
  disconnectSocket: () => mocks.disconnectSocket(),
  getSocket: () => ({ emit: mocks.emit }),
}));

describe('useSocket Hook', () => {
  let callbacks: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
    callbacks = {};
    // Capture callbacks passed to initSocket
    mocks.initSocket.mockImplementation(async (config: any) => {
      callbacks = config;
      // Simulate immediate connect for convenience in checking connected state
      if (config.onConnect) config.onConnect();
    });
  });

  it('should initialize connected state', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));

    await act(async () => {});

    expect(mocks.initSocket).toHaveBeenCalled();
    expect(result.current.connected).toBe(true);
  });

  it('should handle incoming messages with deduplication', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    const msg1 = { id: 'm1', content: 'Hello', timestamp: 100 };

    act(() => {
      callbacks.onMessageNew(msg1);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(msg1);

    // Send duplicate
    act(() => {
      callbacks.onMessageNew(msg1);
    });

    expect(result.current.messages).toHaveLength(1); // Should still be 1
  });

  it('should handle game events with deduplication', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    const event1 = { id: 'e1', type: 'ATTACK', timestamp: 200, payload: {} };

    act(() => {
      callbacks.onGameEvents({ events: [event1] });
    });

    expect(result.current.gameEvents).toHaveLength(1);
    expect(result.current.gameEvents[0]).toMatchObject({ id: 'e1' });

    // Send duplicate event (same ID)
    act(() => {
      callbacks.onGameEvents({ events: [event1] });
    });

    expect(result.current.gameEvents).toHaveLength(1);
  });

  it('should handle batch game events with partial overlap', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    const e1 = { id: 'e1', type: 'A' };
    const e2 = { id: 'e2', type: 'B' };
    const e3 = { id: 'e3', type: 'C' };

    act(() => {
      callbacks.onGameEvents({ events: [e1, e2] });
    });
    expect(result.current.gameEvents).toHaveLength(2);

    act(() => {
      callbacks.onGameEvents({ events: [e2, e3] });
    });

    expect(result.current.gameEvents).toHaveLength(3);
    const ids = result.current.gameEvents.map((e: any) => e.id);
    expect(ids).toEqual(['e1', 'e2', 'e3']);
  });

  it('should update entities from onEntitiesUpdate', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    const entities = [{ id: 'ent-1', name: 'Orc' }];
    act(() => {
      callbacks.onEntitiesUpdate({ entities });
    });

    expect(result.current.creatures).toEqual(entities);
  });

  it('should handle player ready updates', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    act(() => {
      callbacks.onGameState({
        players: [
          { userId: 'u1', isReady: false },
          { userId: 'u2', isReady: false },
        ],
      });
    });

    act(() => {
      callbacks.onPlayerReadyUpdated({ userId: 'u1', isReady: true });
    });

    const p1 = result.current.players.find((p) => p.userId === 'u1');
    const p2 = result.current.players.find((p) => p.userId === 'u2');
    expect(p1?.isReady).toBe(true);
    expect(p2?.isReady).toBe(false);
  });
  it('should update room phase', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    act(() => {
      callbacks.onGameState({ room: { phase: 'lobby' } });
    });

    act(() => {
      callbacks.onPhaseChanged({ phase: 'combat' });
    });

    expect(result.current.room?.phase).toBe('combat');
  });

  it('should handle turn processing lifecycle', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    expect(result.current.isProcessing).toBe(false);

    act(() => {
      callbacks.onTurnProcessing();
    });
    expect(result.current.isProcessing).toBe(true);

    act(() => {
      callbacks.onTurnComplete();
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it('should aggregate tool calls', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    const t1 = { id: 't1', tool: 'attack' };
    const t2 = { id: 't2', tool: 'move' };

    act(() => {
      callbacks.onToolCalls([t1]);
    });
    expect(result.current.toolCalls).toHaveLength(1);

    act(() => {
      callbacks.onToolCalls([t2]);
    });
    expect(result.current.toolCalls).toHaveLength(2);
    expect(result.current.toolCalls[1]).toEqual(t2);
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    act(() => {
      callbacks.onError({ message: 'Auth failed' });
    });
    expect(result.current.error).toBe('Auth failed');
  });

  it('should disconnect on unmount', async () => {
    const { unmount } = renderHook(() => useSocket('room-1', 'user-1'));
    await act(async () => {});

    unmount();
    expect(mocks.disconnectSocket).toHaveBeenCalled();
  });
});
