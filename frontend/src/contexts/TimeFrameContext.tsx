import React, { createContext, useContext, useState, useEffect } from 'react';
import { TimeFrame, Room } from '@/types/contracts';

interface TimeFrameContextType {
  currentTimeFrame: TimeFrame | null;
  history: TimeFrame[];
  isLive: boolean; // True if showing current Live State (Socket)
  isReplay: boolean; // True if showing an AD-HOC replay state (not a snapshot)

  jumpToFrame: (frameId: string) => void;
  injectState: (state: any) => void; // For granular replay
  goLive: () => void;
  isLoading: boolean;
}

const TimeFrameContext = createContext<TimeFrameContextType | undefined>(undefined);

export const TimeFrameProvider: React.FC<{
  room: Room | null;
  children: React.ReactNode;
}> = ({ room, children }) => {
  const [localFrameId, setLocalFrameId] = useState<string | null>(null);
  const [injectedState, setInjectedState] = useState<any | null>(null);
  const [history, setHistory] = useState<TimeFrame[]>([]);

  useEffect(() => {
    // If room has timeFrames populated from GraphQL, use them as history
    if (room && room.timeFrames && Array.isArray(room.timeFrames)) {
      const backendHistory = room.timeFrames;
      // Sort by turn number
      const sorted = [...backendHistory].sort((a: TimeFrame, b: TimeFrame) => a.turnNumber - b.turnNumber);
      setHistory(sorted);
    }
  }, [room]);

  // If injectedState is present, it takes precedence (Granular Replay)
  // Else if localFrameId is present, we look up snapshot
  // Else we are Live (null)

  const currentTimeFrame = injectedState || (localFrameId
      ? history.find((f) => f.id === localFrameId || f.documentId === localFrameId) || null
      : history[history.length - 1] || null); // Fallback to last snapshot for "Live Base"? No, Live is socket.

  // "Live" means we are NOT looking at history OR replay.
  // Actually, usually "Live" means we render from Room/Socket.
  // `currentTimeFrame` being null usually signals "Use Socket Data".
  // But here we assign it to last snapshot?
  // Line 34 in original file: `: history[history.length - 1] || null;`
  // Wait, if I am live, `currentTimeFrame` should be NULL so GameDebugView uses `socketCreatures`.
  // The original logic was:
  /*
  const currentTimeFrame = localFrameId
    ? history.find(...) || null
    : history[history.length - 1] || null; 
  */
  // This means by default it shows the LAST FRAME?
  // And `isLive = !localFrameId`.
  // So if `localFrameId` is null (default), `isLive` is true.
  // BUT `currentTimeFrame` is set to last snapshot?
  // GameDebugView logic:
  /*
    if (isLive) {
       // use socket
    } else if (currentTimeFrame) {
       // use frame
    }
  */
  // So `isLive` check takes precedence.

  const isLive = !localFrameId && !injectedState;
  const isReplay = !!injectedState;

  const jumpToFrame = (frameId: string) => {
    setLocalFrameId(frameId);
    setInjectedState(null);
  };

  const injectState = (state: any) => {
    setInjectedState(state);
    setLocalFrameId(null); // Clear frame ID to indicate we are off-track
  };

  const goLive = () => {
    setLocalFrameId(null);
    setInjectedState(null);
  };

  return (
    <TimeFrameContext.Provider
      value={{
        currentTimeFrame,
        history,
        isLive,
        isReplay,
        jumpToFrame,
        injectState,
        goLive,
        isLoading: false,
      }}
    >
      {children}
    </TimeFrameContext.Provider>
  );
};

export const useTimeFrame = () => {
  const context = useContext(TimeFrameContext);
  if (!context) {
    throw new Error('useTimeFrame must be used within a TimeFrameProvider');
  }
  return context;
};
