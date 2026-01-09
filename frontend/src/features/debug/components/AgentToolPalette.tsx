import { useState } from 'react';
import { ChatActionToolbar } from '@/components/chat/ChatActionToolbar';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface AgentToolPaletteProps {
  onCommand: (command: string, mode: 'chat' | 'direct') => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeEntity?: any;
  activeLocation?: { x: number; y: number; z: number; label: string } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roomEntities?: any[];
}

export function AgentToolPalette({ onCommand, activeEntity, activeLocation, roomEntities }: AgentToolPaletteProps) {
  const [directMode, setDirectMode] = useState(true);

  return (
    <div className="h-full bg-midnight-950 flex flex-col">
      <div className="p-2 border-b border-midnight-800 flex justify-between items-center bg-black/20">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tool Execution</span>
        <button
          type="button"
          onClick={() => setDirectMode(!directMode)}
          className="flex items-center gap-2 text-xs font-bold transition-colors hover:text-white"
          title={directMode ? 'Direct Execution (Bypass LLM)' : 'Natural Language (Via LLM)'}
        >
          <span className={directMode ? 'text-green-400' : 'text-gray-600'}>DIRECT</span>
          {directMode ? (
            <ToggleRight className="text-green-400 w-5 h-5" />
          ) : (
            <ToggleLeft className="text-gray-600 w-5 h-5" />
          )}
          <span className={!directMode ? 'text-aurora-400' : 'text-gray-600'}>LLM</span>
        </button>
      </div>

      <div className="flex-1 p-2">
        <ChatActionToolbar
          orientation="vertical"
          activeEntity={activeEntity}
          activeLocation={activeLocation}
          roomEntities={roomEntities}
          onCommandSelect={(cmd) => {
            onCommand(cmd.prefix, directMode ? 'direct' : 'chat');
          }}
        />
      </div>
    </div>
  );
}
