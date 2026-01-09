import React, { useState } from 'react';
import { replayHistory } from '@/services/api';
import { useTimeFrame } from '../../../contexts/TimeFrameContext';

interface TimeControlsProps {
  roomId?: string; // Passed down or retrieved from context if available?
  // TimeFrameContext doesn't expose RoomId.
  // Ideally we pass it. But for now, we assume we need to get it.
  // NOTE: GameDebugView has roomId. We should update GameDebugView to pass it.
}

export function TimeControls({ roomId }: TimeControlsProps) {
  const { history, currentTimeFrame, jumpToFrame, goLive, isLive, injectState, isReplay } = useTimeFrame();
  const [replayTime, setReplayTime] = useState<string>('');
  const [isReplaying, setIsReplaying] = useState(false);

  if (!history || history.length === 0) {
    return <div className="text-white/50 text-xs p-2">No History Available</div>;
  }

  // Determine current index (Snapshots)
  const currentIndex = isLive
    ? history.length - 1
    : isReplay
      ? -1 // Custom state
      : currentTimeFrame
        ? history.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (f) => (f as any).documentId === (currentTimeFrame as any).documentId || f.id === currentTimeFrame.id
          )
        : history.length - 1;

  const total = history.length;

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx >= history.length - 1) {
      goLive();
    } else {
      const frame = history[idx];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jumpToFrame((frame as any)?.documentId || frame?.id);
    }
  };

  const handleGranularReplay = async () => {
    if (!replayTime || !roomId) return;
    const timestamp = parseInt(replayTime, 10); // Or parse date string
    if (isNaN(timestamp)) {
      // eslint-disable-next-line no-alert
      alert('Invalid Timestamp');
      return;
    }

    setIsReplaying(true);
    try {
      const state = await replayHistory(roomId, timestamp);
      // Transform backend State to TimeFrame format
      const adHocFrame = {
        id: 'replay-adhoc',
        documentId: 'replay-adhoc',
        turnNumber: -1, // Indicates interpolated
        timestamp,
        gameState: state,
        events: [],
      };
      injectState(adHocFrame);
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      alert('Replay Failed');
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-gray-900 border-t border-white/10 p-3 h-14">
      <div className="text-xs font-mono text-cyan-400 w-24">
        {isLive ? 'LIVE' : isReplay ? 'REPLAY' : `HIST: T${currentTimeFrame?.turnNumber || 0}`}
      </div>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-white/50">START</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={currentIndex === -1 ? 0 : Math.max(0, currentIndex)} // If replaying, maybe disable slider or show phantom position?
          onChange={handleScrub}
          disabled={isReplay}
          className={`flex-1 accent-cyan-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer ${isReplay ? 'opacity-50' : ''}`}
        />
        <span className="text-xs text-white/50">NOW ({total})</span>
      </div>

      {/* Granular Replay Control */}
      <div className="flex items-center gap-1 border-l border-white/10 pl-4">
        <input
          type="text"
          placeholder="Timestamp"
          className="w-24 bg-black/50 border border-white/20 text-xs p-1 text-white rounded"
          value={replayTime}
          onChange={(e) => setReplayTime(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGranularReplay}
          disabled={!roomId || isReplaying}
          className="px-2 py-1 text-xs bg-purple-900 text-purple-200 rounded hover:bg-purple-800 disabled:opacity-50"
        >
          {isReplaying ? '...' : 'SEEK'}
        </button>
      </div>

      <button
        type="button"
        onClick={goLive}
        disabled={isLive}
        className={`px-3 py-1 text-xs rounded border border-cyan-500/50 ${isLive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-transparent text-cyan-500 hover:bg-cyan-900'}`}
      >
        GO LIVE
      </button>
    </div>
  );
}
