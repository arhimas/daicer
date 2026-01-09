import { useRef, useEffect } from 'react';
import type { GameEvent } from '@/types/contracts';
import clsx from 'clsx';

interface GameEventsPanelProps {
  events: GameEvent[];
}

function EventCard({ event }: { event: GameEvent }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isError = event.type === 'ERROR' || (event.payload && (event.payload as any).error);

  return (
    <div
      className={clsx(
        'p-2 rounded border break-words transition-colors hover:bg-opacity-50',
        isError ? 'bg-red-900/20 border-red-500/50 text-red-200' : 'bg-midnight-900 border-midnight-800 text-slate-300'
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={clsx('font-bold', isError ? 'text-red-400' : 'text-aurora-400')}>{event.type}</span>
        <span className="text-[10px] opacity-50">{new Date(Number(event.timestamp)).toLocaleTimeString()}</span>
      </div>
      <pre className="whitespace-pre-wrap text-[10px] overflow-x-auto bg-black/30 p-1.5 rounded text-zinc-400">
        {typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload, null, 2)}
      </pre>
    </div>
  );
}

export function GameEventsPanel({ events }: GameEventsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="flex-1 min-w-0 flex-shrink-0 bg-midnight-950 border-r border-midnight-800 flex flex-col z-10 shadow-2xl">
      <div className="p-3 bg-midnight-900 border-b border-midnight-800 font-bold text-xs uppercase tracking-wider text-shadow-300 flex justify-between items-center">
        <span>GAME EVENTS</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">{events.length}</span>
          <button
            type="button"
            onClick={() => {
              const logText = JSON.stringify(events, null, 2);
              navigator.clipboard.writeText(logText);
            }}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors"
            title="Copy All Events"
          >
            📋
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs custom-scrollbar">
        {events.length === 0 && <div className="text-zinc-600 text-center italic mt-10">No events received...</div>}
        {events.map((event, i) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <EventCard key={(event as any).id || i} event={event} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
