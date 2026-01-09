import { useState } from 'react';
import { ArrowLeft, Braces, Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { EntitySheet } from '@/types/contracts';
import cn from '@/lib/utils';
import type { DebugEntity } from '../utils/types';
import { UniversalEntitySheetContent } from '../../../components/game/UniversalEntitySheet';

interface DebugEntitySheetProps {
  entity: DebugEntity & { raw?: unknown };
  onBack: () => void;
}

// ----------------------------------------------------------------------------
// 1. JSON Tree Viewer (Simple Recursive)
// ----------------------------------------------------------------------------
function JsonTree({ data, label, level = 0 }: { data: unknown; label?: string; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 1); // Expand top level only
  const isObject = data && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  if (!isObject) {
    return (
      <div className="font-mono text-xs flex gap-2 hover:bg-white/5 py-0.5 px-2 rounded">
        {label && <span className="text-purple-300 opacity-70">{label}:</span>}
        <span
          className={cn(
            typeof data === 'string'
              ? 'text-emerald-300'
              : typeof data === 'number'
                ? 'text-orange-300'
                : typeof data === 'boolean'
                  ? 'text-pink-400'
                  : 'text-gray-400'
          )}
        >
          {String(data)}
        </span>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs">
      <div
        className="flex items-center gap-1 cursor-pointer hover:bg-white/5 py-0.5 px-2 rounded select-none group"
        onClick={() => !isEmpty && setIsOpen(!isOpen)}
      >
        <span className="text-gray-500 w-4 flex justify-center">
          {isEmpty ? '' : isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </span>
        {label && <span className="text-purple-300 font-bold opacity-80">{label}</span>}
        <span className="text-gray-500 opacity-50 text-[10px]">
          {isArray ? `[${data.length}]` : `{${Object.keys(data).length}}`}
        </span>
      </div>

      {isOpen && !isEmpty && (
        <div className="pl-6 border-l border-white/10 ml-2">
          {Object.entries(data).map(([key, value]) => (
            <JsonTree key={key} data={value} label={isArray ? undefined : key} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. Main Component
// ----------------------------------------------------------------------------
export function DebugEntitySheet({ entity, onBack }: DebugEntitySheetProps) {
  const [tab, setTab] = useState<'sheet' | 'raw'>('sheet');
  const raw = (entity.raw as Record<string, unknown>) || {};

  // Cast raw data to EntitySheet for the universal viewer.
  // In debug mode, raw is usually the direct backend object which matches the schema.
  const sheetData = raw as unknown as EntitySheet;

  return (
    <div className="flex flex-col h-full bg-midnight-950 text-gray-300">
      {/* Header */}
      <div className="p-2 border-b border-midnight-800 flex items-center gap-2 bg-midnight-900/50 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white truncate">{entity.name}</div>
          <div className="text-[10px] font-mono text-gray-500 truncate flex gap-2">
            <span>{entity.id}</span>
            <span className="text-aurora-400">
              {String(raw.type || '?')} | Lvl {String(raw.level ?? '?')}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab('sheet')}
            className={cn(
              'p-1.5 rounded',
              tab === 'sheet' ? 'bg-aurora-500/20 text-aurora-300' : 'text-gray-500 hover:text-white'
            )}
            title="Universal Sheet View"
          >
            <Search size={14} />
          </button>
          <button
            type="button"
            onClick={() => setTab('raw')}
            className={cn(
              'p-1.5 rounded',
              tab === 'raw' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-white'
            )}
            title="Raw JSON View"
          >
            <Braces size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(entity, null, 2));
            }}
            className="p-1.5 rounded text-gray-500 hover:text-white"
            title="Copy JSON to Clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {/* Content Area */}
      {/* We use relative + min-h-0 to ensure flex children like UniversalEntitySheetContent can scroll internally */}
      <div className="flex-1 relative min-h-0 bg-midnight-950">
        {tab === 'sheet' && (
          // Universal Sheet expects to fill parent
          <div className="absolute inset-0 p-2">
            <UniversalEntitySheetContent entity={sheetData} />
          </div>
        )}

        {tab === 'raw' && (
          <div className="absolute inset-0 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-midnight-700">
            <JsonTree data={entity} label="DebugEntity (Wrapper)" />
          </div>
        )}
      </div>
    </div>
  );
}
