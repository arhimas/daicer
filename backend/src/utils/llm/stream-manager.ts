/**
 * Stream Manager Service
 * Centralized handling of events (Formerly LLM streaming).
 * NOW: Sockets are removed. This service acts as an event logger or simple pass-through.
 * Future: Could hook into a Notification Service or Database Log.
 */

// Socket.IO dependency REMOVED per user request.

export interface StreamEvent {
  streamId: string;
  roomId: string;
  type: 'text' | 'tool_start' | 'tool_end' | 'reasoning' | 'error' | 'done';
  content?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

class StreamManager {
  private static instance: StreamManager;
  // private io: Server | null = null; // REMOVED
  private activeStreams = new Map<string, { roomId: string; userId: string }>();

  private constructor() {}

  public static getInstance(): StreamManager {
    if (!StreamManager.instance) {
      StreamManager.instance = new StreamManager();
    }
    return StreamManager.instance;
  }

  // Deprecated/No-op
  public setSocketServer(_io: unknown) {
    // this.io = io;
    console.log('[StreamManager] Socket server setup ignored (Sockets Disabled)');
  }

  public broadcast(roomId: string, event: string, payload: unknown) {
    // No-op or Log
    console.log(`[StreamManager] Broadcast to ${roomId} [${event}]:`, JSON.stringify(payload).slice(0, 100));
  }

  public broadcastPrivate(userId: string, event: string, payload: unknown) {
    console.log(`[StreamManager] Private msg to user:${userId} [${event}]`);
  }

  public startStream(streamId: string, roomId: string, userId: string) {
    this.activeStreams.set(streamId, { roomId, userId });
    this.emitEvent({
      streamId,
      roomId,
      type: 'text', // Initial event
      content: '',
      timestamp: Date.now(),
      metadata: { status: 'started' },
    });
  }

  public endStream(streamId: string) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      this.emitEvent({
        streamId,
        roomId: stream.roomId,
        type: 'done',
        timestamp: Date.now(),
      });
      this.activeStreams.delete(streamId);
    }
  }

  public emitText(streamId: string, text: string, userId?: string) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      const targetUserId = userId || stream.userId;
      this.emitEvent(
        {
          streamId,
          roomId: stream.roomId,
          type: 'text',
          content: text, // Chunk? Sockets gone means no real-time stream.
          // We assume logic calling this might need refactor or we just log.
          timestamp: Date.now(),
        },
        targetUserId
      );
    }
  }

  public emitToolStart(streamId: string, toolName: string, input: unknown) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      this.emitEvent({
        streamId,
        roomId: stream.roomId,
        type: 'tool_start',
        metadata: { toolName, input },
        timestamp: Date.now(),
      });
    }
  }

  public emitToolEnd(streamId: string, toolName: string, output: unknown) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      this.emitEvent({
        streamId,
        roomId: stream.roomId,
        type: 'tool_end',
        metadata: { toolName, output },
        timestamp: Date.now(),
      });
    }
  }

  public emitReasoning(streamId: string, reasoning: string) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      this.emitEvent({
        streamId,
        roomId: stream.roomId,
        type: 'reasoning',
        content: reasoning,
        timestamp: Date.now(),
      });
    }
  }

  public emitError(streamId: string, error: string) {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      this.emitEvent({
        streamId,
        roomId: stream.roomId,
        type: 'error',
        content: error,
        timestamp: Date.now(),
      });
      this.activeStreams.delete(streamId);
    }
  }

  private emitEvent(event: StreamEvent, targetUserId?: string) {
    // No socket emit. Just log.
    // console.log(`[StreamManager] Event: ${event.type} to ${targetUserId || event.roomId}`);
  }
}

export const streamManager = StreamManager.getInstance();
