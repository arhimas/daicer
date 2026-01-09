import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimeFrame, Room } from '@/types/contracts';

interface TimeFrameContextType {
  currentTimeFrame: TimeFrame | null;
  history: TimeFrame[];
  isLive: boolean; // True if showing current Live State (Socket)
  isReplay: boolean; // True if showing an AD-HOC replay state (not a snapshot)

  jumpToFrame: (frameId: string) => void;
  injectState: (state: unknown) => void; // For granular replay
  goLive: () => void;
  isLoading: boolean;
}

const TimeFrameContext = createContext<TimeFrameContextType | undefined>(undefined);

export function TimeFrameProvider({ room, children }: { room: Room | null; children: React.ReactNode }) {
  const [localFrameId, setLocalFrameId] = useState<string | null>(null);
  const [injectedState, setInjectedState] = useState<unknown | null>(null);
  const [history, setHistory] = useState<TimeFrame[]>([]);

  useEffect(() => {
    // If room has timeFrames populated from GraphQL, use them as history
    if (room && room.timeFrames && Array.isArray(room.timeFrames)) {
      const backendHistory = room.timeFrames;
      // Sort by turn number
      const sorted = [...backendHistory].sort((a: TimeFrame, b: TimeFrame) => a.turnNumber - b.turnNumber);
      setTimeout(() => setHistory(sorted), 0);
    }
  }, [room]);

  // If injectedState is present, it takes precedence (Granular Replay)
  // Else if localFrameId is present, we look up snapshot
  // Else we are Live (null)

  const currentTimeFrame: unknown =
    injectedState ||
    (localFrameId
      ? history.find((f) => f.id === localFrameId || f.documentId === localFrameId) || null
      : history[history.length - 1] || null);

  const isLive = !localFrameId && !injectedState;
  const isReplay = !!injectedState;

  const jumpToFrame = (frameId: string) => {
    setLocalFrameId(frameId);
    setInjectedState(null);
  };

  const injectState = (state: unknown) => {
    setInjectedState(state);
    setLocalFrameId(null); // Clear frame ID to indicate we are off-track
  };

  const goLive = () => {
    setLocalFrameId(null);
    setInjectedState(null);
  };

  const contextValue = React.useMemo(
    () => ({
      currentTimeFrame: currentTimeFrame as TimeFrame | null,
      history,
      isLive,
      isReplay,
      jumpToFrame,
      injectState,
      goLive,
      isLoading: false,
    }),
    [currentTimeFrame, history, isLive, isReplay]
  );

  return <TimeFrameContext.Provider value={contextValue}>{children}</TimeFrameContext.Provider>;
}

export const useTimeFrame = () => {
  const context = useContext(TimeFrameContext);
  if (!context) {
    throw new Error('useTimeFrame must be used within a TimeFrameProvider');
  }
  return context;
};
