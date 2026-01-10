import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Player, Message, Creature } from '@/types/contracts';
import { useQuery } from '@apollo/client/react/hooks';
import { GET_ROOM_QUERY } from '../graphql/queries';

interface SocketState {
  connected: boolean;
  error: string | null;
  room: Room | null;
  players: Player[];
  messages: Message[];
  creatures: Creature[];
  toolCalls: any[];
  isProcessing: boolean;
  streamingMessages: Map<string, string>;
  presence: any[];
  sseHealthWarning: boolean;
  lastSSEEvent: number;
}

/**
 * GraphQL Polling Hook for Game State
 * Replaces legacy Socket.IO streaming with Apollo polling.
 */
export default function useGamePolling(roomId?: string, initialMessages?: Message[]) {
  const [state, setState] = useState<SocketState>({
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
  });

  // Polling Interval (3s)
  const POLL_INTERVAL = 3000;

  const { data, error } = useQuery(GET_ROOM_QUERY, {
    variables: { filters: { documentId: { eq: roomId } } },
    skip: !roomId,
    pollInterval: POLL_INTERVAL,
    fetchPolicy: 'network-only',
  });

  // Handle Updates
  useEffect(() => {
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      return;
    }

    if (data?.rooms?.[0]) {
      const roomData = data.rooms[0];

      // Map Room Data to State
      const mappedPlayers = (roomData.players || []).map((p: any) => ({
        ...p,
        userId: p.user?.documentId || p.user?.id || p.id,
        action: p.action, // Ensure action status is synced
      }));

      const mappedMessages = ((roomData.messages || []) as any[])
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

      // Entities mapping (Simple version)
      const mappedCreatures = (roomData.entity_sheets || []).map((s: any) => ({
        id: s.documentId,
        name: s.name,
        type: s.type || 'monster',
        position: s.position || { x: 0, y: 0, z: 0 },
        // ... other mapping
      }));

      setState((prev) => ({
        ...prev,
        room: roomData as unknown as Room,
        players: mappedPlayers,
        messages: mappedMessages,
        creatures: mappedCreatures, // Update creatures/entities
        isProcessing: roomData.phase === 'processing', // Infer processing from phase if backend sets it
        connected: true,
      }));
    }
  }, [data, error]);

  // Compatibility stubs
  const socket = {
    connected: true,
    emit: (event: string, data: any) => console.log('[Poller] Emit ignored:', event, data),
    on: () => {},
    off: () => {},
  };

  return {
    connected: state.connected,
    error: state.error,
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
