import { useState, useEffect } from 'react';

export interface StreamEvent {
  streamId: string;
  roomId: string;
  type: 'text' | 'tool_start' | 'tool_end' | 'reasoning' | 'error' | 'done';
  content?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface StreamState {
  id: string;
  roomId: string;
  content: string;
  reasoning: string;
  status: 'active' | 'completed' | 'error';
  tools: Array<{
    name: string;
    input?: any;
    output?: any;
    status: 'running' | 'completed';
  }>;
  error?: string;
}

/**
 * Hook to consume unified LLM streaming events
 * (Refactored to No-Op as Sockets are removed. Logic will be moved to Polling/GraphQL in future)
 */
export function useLLMStream(filterStreamId?: string, socketInstance?: any) {
  const [streams, setStreams] = useState<Record<string, StreamState>>({});

  // No-op effect
  useEffect(() => {
    // LLM Streaming via sockets is disabled.
    // Future implementation will likely use polling or subscription via GraphQL.
  }, [filterStreamId]);

  return streams;
}
