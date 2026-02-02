import React from 'react';
import { Box, Typography, Flex } from '@strapi/design-system';

export interface TimelineEvent {
  type: 'event' | 'snapshot';
  id: string;
  sequenceId: string; // BigInt string
  timestamp: number;
  summary: string;
  eventType?: string;
  payload?: unknown;
}

interface EventListProps {
  events: TimelineEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const EventList = ({ events, selectedId, onSelect }: EventListProps) => {
  return (
    <Box
      background="neutral0"
      hasRadius
      shadow="tableShadow"
      style={{ height: '100%', overflowY: 'auto' }}
    >
      {events.length === 0 ? (
        <Box padding={4}>
          <Typography variant="pi" textColor="neutral600">
            No events found.
          </Typography>
        </Box>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelect(evt.id)}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selectedId === evt.id ? '#e6f7ff' : 'transparent',
                borderLeft: evt.type === 'snapshot' ? '4px solid #7b61ff' : '4px solid transparent',
              }}
            >
              <Flex justifyContent="space-between">
                <Typography fontWeight="bold" variant="pi">
                  {evt.eventType || 'SNAPSHOT'}
                </Typography>
                <Typography variant="sigma" textColor="neutral600">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </Typography>
              </Flex>
              <Typography variant="pi" textColor="neutral600" ellipsis>
                {evt.summary}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};
