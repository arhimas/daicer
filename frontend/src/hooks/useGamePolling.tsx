import { useState, useEffect } from 'react';
import type { Room, Player, Message, Creature } from '@/types/contracts';
import { useQuery } from '@apollo/client/react';
import { GAME_VIEW_QUERY } from '../graphql/queries';

interface SocketState {
  connected: boolean;
  error: string | null;
  room: Room | null;
  players: Player[];
  messages: Message[];
  creatures: Creature[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolCalls: any[];
  isProcessing: boolean;
  streamingMessages: Map<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presence: any[];
  sseHealthWarning: boolean;
  lastSSEEvent: number;
}

/**
 * GraphQL Polling Hook for Game State
 * Replaces legacy Socket.IO streaming with Apollo polling.
 * Uses GameView for Server-Side Fog of War.
 */
export default function useGamePolling(roomId?: string, initialMessages?: Message[]) {
  const [state, setState] = useState<SocketState>(() => ({
    connected: true, // Always "connected" in polling mode
    error: null,
    room: null,
    players: [],
    messages: initialMessages || [],
    creatures: [],
    toolCalls: [],
    isProcessing: false,
    streamingMessages: new Map(),
    presence: [],
    sseHealthWarning: false,
    lastSSEEvent: Date.now(),
  }));

  // Polling Interval (2s)
  const POLL_INTERVAL = 2000;

  const { data, error } = useQuery(GAME_VIEW_QUERY, {
    variables: { roomId },
    skip: !roomId,
    pollInterval: POLL_INTERVAL,
    fetchPolicy: 'network-only',
  });

  // Handle Updates
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((data as any)?.gameView) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = (data as any).gameView;
      const roomData = view.room;

      if (!roomData) return;

      // Map Room Data to State
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedPlayers = (roomData.players || []).map((p: any) => ({
        ...p,
        userId: p.user?.documentId || p.user?.id || p.id,
        action: p.action, // Ensure action status is synced
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedMessages = ((view.messages || []) as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((msg: any) => ({
          id: msg.documentId || msg.id,
          content: msg.content,
          text: msg.content,
          sender: msg.senderName,
          senderName: msg.senderName,
          senderType: msg.senderType,
          timestamp: Number(msg.timestamp),
          type: (msg.senderType === 'dm' ? 'narration' : 'chat') as Message['type'],
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      // Entities mapping (Visible Entities from Server)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedCreatures = (view.visibleEntities || []).map((s: any) => ({
        id: s.documentId,
        name: s.name,
        type: s.type || 'monster',
        position: s.position || { x: 0, y: 0, z: 0 },
        currentHp: s.currentHp,
        maxHp: s.maxHp,
        availableActions: s.availableActions,
        stats: s.stats,
        inventory: s.inventory,
      }));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({
        ...prev,
        room: roomData as unknown as Room,
        players: mappedPlayers,
        messages: mappedMessages,
        creatures: mappedCreatures, // Filtered by VisibilityService on Server
        isProcessing: roomData.isProcessing || false, // Use direct flag from backend
        connected: true,
      }));
    }
  }, [data]);

  // Compatibility stubs
  const socket = {
    connected: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit: (event: string, payload: any) => console.log('[Poller] Emit ignored:', event, payload),
    on: () => {},
    off: () => {},
  };

  return {
    connected: state.connected,
    error: error?.message || state.error,
    room: state.room,
    players: state.players,
    messages: state.messages,
    creatures: state.creatures,
    toolCalls: state.toolCalls,
    socket, // Mock socket for compatibility
    isProcessing: state.isProcessing,
    streamingMessages: state.streamingMessages,
    presence: state.presence,
    sseHealthWarning: state.sseHealthWarning,
  };
}
