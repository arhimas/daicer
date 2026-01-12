import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { AgentLog } from '@/types/contracts';

const GET_AGENT_LOGS = gql`
  query GetAgentLogs($roomId: ID!) {
    getAgentLogs(roomId: $roomId) {
      id
      type
      payload
      actorId
      sequenceId
      timestamp
    }
  }
`;

export interface StreamState {
  id: string;
  roomId: string;
  content: string;
  reasoning: string;
  status: 'active' | 'completed' | 'error';
  tools: Array<{
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output?: any;
    status: 'running' | 'completed';
  }>;
  error?: string;
}

/**
 * Hook to consume Agent Activity via GraphQL Polling
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAgentActivity(roomId?: string, _socketInstance?: any) {
  // Poll for agent logs every 2 seconds
  const { data } = useQuery(GET_AGENT_LOGS, {
    variables: { roomId },
    skip: !roomId,
    pollInterval: 2000,
    fetchPolicy: 'network-only',
  });

  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((data as any)?.getAgentLogs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logs = (data as any).getAgentLogs as AgentLog[];

      // Simple aggregation logic to convert flat logs into "Streams"
      // Note: In this polling model, we might just show the raw logs or
      // aggregate them if we want to simulate the old stream view.
      // For now, let's just expose a single "system" stream that shows the latest activity.

      const latestLogs = logs.slice(0, 10); // Check last 10

      const newStreams: Record<string, StreamState> = {};

      // Group by "Turn" or just show a rolling log?
      // Let's create a synthetic stream for the "Room Activity"
      if (roomId) {
        newStreams[roomId] = {
          id: 'activity-feed',
          roomId,
          content: latestLogs.map((l) => `[${l.type}] ${JSON.stringify(l.payload)}`).join('\n'),
          reasoning: '',
          status: 'completed',
          tools: latestLogs
            .filter((l) => l.type === 'TOOL_EXECUTION')
            .map((l) => ({
              name: l.payload?.tool || 'unknown',
              input: l.payload?.args,
              status: 'completed',
            })),
        };
      }

      return newStreams;
    }
    return {};
  }, [data, roomId]);
}
