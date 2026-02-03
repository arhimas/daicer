import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Typography, Button } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '@/plugins/map-explorer/admin/src/pluginId';
import { Scrubber } from '@/plugins/map-explorer/admin/src/components/TimelineDebugger/Scrubber';
import { EventList, TimelineEvent } from '@/plugins/map-explorer/admin/src/components/TimelineDebugger/EventList';
import { StateInspector } from '@/plugins/map-explorer/admin/src/components/TimelineDebugger/StateInspector';

import { ReplayGameState } from '@/plugins/map-explorer/admin/src/types';

interface TimelineDebuggerProps {
  roomId: string;
  onClose: () => void;
  onReplayState: (state: ReplayGameState) => void;
}

export const TimelineDebugger = ({ roomId, onClose, onReplayState }: TimelineDebuggerProps) => {
  const { get, post } = useFetchClient();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Playback timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTimeline();
    return () => stopPlayback();
  }, [roomId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await get(`/${PLUGIN_ID}/timeline?roomId=${roomId}`);
      // res.data = { events: [], snapshots: [] }
      // We flatten and sort strictly by sequence/timestamp
      const combined = [...res.data.events, ...res.data.snapshots].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      setEvents(combined);
      setCurrentIndex(combined.length - 1); // Jump to end by default
    } catch (err) {
      console.error('Failed to fetch timeline', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrub = async (index: number) => {
    setCurrentIndex(index);
    const evt = events[index];
    if (evt) {
      setSelectedId(evt.id);
      // If it's an event, we might want to fetch the Full State at that point for the Map
      // Optimisation: Debounce this or only do it on mouse-up?
      // For V1, let's just do it.
      try {
        const state = await post(`/${PLUGIN_ID}/replay`, {
          roomId,
          timestamp: evt.timestamp,
        });
        onReplayState(state.data);
      } catch (e) {
        console.error('Replay failed', e);
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= events.length - 1) {
          stopPlayback();
          return prev;
        }
        const next = prev + 1;
        handleScrub(next); // This triggers the async replay... might lag.
        // Future Optimization: Prefetch or Local State Replay
        return next;
      });
    }, 1000); // 1 tick per second
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const currentEvent = events[currentIndex];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="400px"
      background="neutral100"
      shadow="filterShadow"
      zIndex={100}
      padding={4}
      style={{ borderTop: '1px solid #dcdce4' }}
    >
      <Box paddingBottom={4} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="beta">Timeline Debugger</Typography>
        <Button onClick={onClose} variant="tertiary" startIcon={<Cross />}>
          Close
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading History...</Typography>
      ) : (
        <Grid.Root gap={4} style={{ height: 'calc(100% - 60px)' }}>
          <Grid.Item
            col={8}
            s={12}
            direction="column"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Box paddingBottom={4}>
              <Scrubber
                min={0}
                max={events.length - 1}
                current={currentIndex}
                onChange={handleScrub}
                isPlaying={isPlaying}
                onPlayPause={togglePlay}
              />
            </Box>
            <Box style={{ flex: 1, overflow: 'hidden' }}>
              <EventList
                events={events}
                selectedId={selectedId}
                onSelect={(id) => {
                  const idx = events.findIndex((e) => e.id === id);
                  if (idx !== -1) handleScrub(idx);
                }}
              />
            </Box>
          </Grid.Item>

          <Grid.Item col={4} s={12} style={{ height: '100%' }}>
            <StateInspector data={currentEvent} />
          </Grid.Item>
        </Grid.Root>
      )}
    </Box>
  );
};
