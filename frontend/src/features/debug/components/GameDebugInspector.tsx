import clsx from 'clsx';
import { AgentToolPalette } from './AgentToolPalette';
import { DebugEntitySheet } from './DebugEntitySheet';
import { DebugEntity } from '../utils/types';

import { EntropyDebugPanel } from './EntropyDebugPanel';

interface GameDebugInspectorProps {
  activeTab: 'inspector' | 'tools' | 'entropy';
  setActiveTab: (tab: 'inspector' | 'tools' | 'entropy') => void;
  isLive: boolean;
  entities: DebugEntity[];
  activeEntityId: string | null;
  setActiveEntityId: (id: string | null) => void;
  activeEntity: DebugEntity | null;
  activeLocation: { label: string; x: number; y: number; z: number } | null;
  onGodModeCommand: (message: string, mode?: 'chat' | 'direct') => Promise<void>;
  entropyState?: unknown; // Passed from parent
  roomId: string;
}

export function GameDebugInspector({
  activeTab,
  setActiveTab,
  isLive,
  entities,
  activeEntityId,
  setActiveEntityId,
  activeEntity,
  activeLocation,
  onGodModeCommand,
  entropyState,
  roomId,
}: GameDebugInspectorProps) {
  return (
    <div className="flex-1 min-w-0 flex-shrink-0 bg-midnight-900 border-r border-midnight-800 flex flex-col z-10">
      <div className="p-3 bg-midnight-900 border-b border-midnight-800 font-bold text-xs uppercase tracking-wider text-shadow-300 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={clsx(
              'transition-colors',
              activeTab === 'tools' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            )}
          >
            TOOLS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={clsx(
              'transition-colors',
              activeTab === 'inspector' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            )}
          >
            INSPECTOR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('entropy')}
            className={clsx(
              'transition-colors',
              activeTab === 'entropy' ? 'text-aurora-300' : 'text-gray-500 hover:text-gray-400'
            )}
          >
            ENTROPY
          </button>
        </div>

        {/* Global Eye / Reset Selection */}
        <div className="flex items-center gap-2">
          {activeEntityId && (
            <button
              type="button"
              onClick={() => setActiveEntityId(null)}
              className="text-gray-500 hover:text-white transition-colors"
              title="Reset Selection (God Mode)"
            >
              👁️
            </button>
          )}
          {activeTab === 'inspector' && !isLive && <span className="text-cyan-400">HISTORICAL</span>}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'inspector' ? (
          <div className="absolute inset-0 overflow-y-auto p-2 space-y-2">
            {/* ENTITY LIST vs SHEET */}
            {activeEntity && activeEntityId ? (
              <div className="h-full overflow-hidden">
                <DebugEntitySheet entity={activeEntity} onBack={() => setActiveEntityId(null)} />
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {activeTab === 'inspector' &&
                  entities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() => setActiveEntityId(entity.id)}
                      className={clsx(
                        'group p-2 rounded border transition-colors cursor-pointer',
                        activeEntity?.id === entity.id
                          ? 'bg-midnight-800 border-aurora-500/50'
                          : 'bg-midnight-950/40 border-midnight-800 hover:bg-midnight-800/60'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-midnight-950 flex items-center justify-center text-lg shadow-inner">
                          {entity.type === 'player' ? '👤' : '👾'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-shadow-200 text-sm truncate group-hover:text-white transition-colors">
                            {entity.name || entity.id}
                          </div>
                          <div className="text-[10px] text-shadow-400 font-mono flex gap-2">
                            <span>
                              {entity.position.x}, {entity.position.y}, {entity.position.z}
                            </span>
                            {entity.currentHp !== undefined && (
                              <span className={clsx(entity.currentHp <= 0 ? 'text-red-500' : 'text-emerald-400')}>
                                HP: {entity.currentHp}/{entity.maxHp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {entities.length === 0 && (
                  <div className="text-center text-shadow-500 text-xs py-8">
                    {isLive ? 'No entities in room.' : 'No entities in this snapshot.'}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'entropy' ? (
          <div className="absolute inset-0 overflow-y-auto p-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <EntropyDebugPanel state={entropyState as any} roomId={roomId} />
          </div>
        ) : (
          <div className="absolute inset-0">
            <AgentToolPalette
              onCommand={onGodModeCommand}
              activeEntity={activeEntity}
              activeLocation={activeLocation}
              roomEntities={entities}
            />
          </div>
        )}
      </div>
    </div>
  );
}
