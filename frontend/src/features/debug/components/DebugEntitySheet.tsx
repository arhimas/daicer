import { useState } from 'react';
import { ArrowLeft, Braces, Swords, Shield, Zap, Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { DebugEntity } from '../utils/types';
import type { ActionDefinition, EntityFeature } from '@daicer/engine';
import cn from '@/lib/utils';

interface DebugEntitySheetProps {
  entity: DebugEntity & { raw?: any };
  onBack: () => void;
}

// ----------------------------------------------------------------------------
// 1. JSON Tree Viewer (Simple Recursive)
// ----------------------------------------------------------------------------
function JsonTree({ data, label, level = 0 }: { data: any; label?: string; level?: number }) {
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
// 2. Action Debug Card
// ----------------------------------------------------------------------------
function ActionDebugCard({ action }: { action: ActionDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor =
    action.type === 'melee_attack'
      ? 'border-red-900/50 bg-red-950/10'
      : action.type === 'spell'
        ? 'border-purple-900/50 bg-purple-950/10'
        : 'border-blue-900/50 bg-blue-950/10';

  return (
    <div className={cn('border rounded p-2 text-xs mb-2', typeColor)}>
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {action.type === 'melee_attack' && <Swords size={12} className="text-red-400" />}
          {action.type === 'spell' && <Zap size={12} className="text-purple-400" />}
          {action.type !== 'melee_attack' && action.type !== 'spell' && <Shield size={12} className="text-blue-400" />}
          <span className="font-bold text-gray-200">{action.name}</span>
        </div>
        <div className="flex gap-2 text-[10px] text-gray-500 uppercase font-mono">
          <span>{action.activityType}</span>
          <span>{action.type}</span>
        </div>
      </div>

      {/* Summary Line */}
      <div className="mt-1 flex flex-wrap gap-2 text-gray-400 font-mono text-[10px] pl-5">
        {'range' in action && <span>Rng: {(action as any).range}</span>}
        {'toHit' in action && <span className="text-green-400">Hit: +{action.toHit}</span>}
        {'damage' in action &&
          action.damage?.map((d, i) => (
            <span key={i} className="text-orange-400">
              {d.dice}+{d.bonus} {d.type}
            </span>
          ))}
        {'save' in action && action.save && (
          <span className="text-yellow-400">
            DC {action.save.dc} {action.save.stat}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-white/10 pl-5">
          <p className="text-gray-400 italic mb-2">{action.description}</p>
          <JsonTree data={action} label="RAW ACTION" />
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. Main Component
// ----------------------------------------------------------------------------
export function DebugEntitySheet({ entity, onBack }: DebugEntitySheetProps) {
  const [tab, setTab] = useState<'main' | 'raw'>('main');
  // Use raw data if available, otherwise fallback to top-level debug entity props
  const raw = entity.raw || {};
  const actions = (raw.structuredActions || entity.structuredActions || []) as ActionDefinition[];
  const features = (raw.features || []) as EntityFeature[];
  const equipment = raw.equipment || [];

  return (
    <div className="flex flex-col h-full bg-midnight-950 text-gray-300">
      {/* Header */}
      <div className="p-2 border-b border-midnight-800 flex items-center gap-2 bg-midnight-900/50">
        <button
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
              {raw.race} {raw.characterClass} {raw.level ? `Lvl ${raw.level}` : ''}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('main')}
            className={cn(
              'p-1.5 rounded',
              tab === 'main' ? 'bg-aurora-500/20 text-aurora-300' : 'text-gray-500 hover:text-white'
            )}
            title="Visual View"
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => setTab('raw')}
            className={cn(
              'p-1.5 rounded',
              tab === 'raw' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-white'
            )}
            title="Raw JSON View"
          >
            <Braces size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-midnight-700">
        {/* MAIN TAB */}
        {tab === 'main' && (
          <div className="space-y-4">
            {/* IMAGE / AVATAR SECTION */}
            <div className="flex justify-center mb-4">
              {(() => {
                const charImg =
                  raw.character?.fullBody?.url || raw.character?.upperBody?.url || raw.character?.portrait?.url;
                const monsterImg = raw.monster?.image?.url;

                const finalImgUrl = charImg || monsterImg;

                if (!finalImgUrl)
                  return (
                    <div className="w-24 h-24 bg-midnight-900 rounded-full flex items-center justify-center border-2 border-midnight-800 text-midnight-700">
                      <span className="text-xs">No Image</span>
                    </div>
                  );

                // Strapi URLs might be relative
                const src = finalImgUrl.startsWith('http') ? finalImgUrl : `http://localhost:1337${finalImgUrl}`;

                return (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-t from-aurora-500/20 to-transparent rounded-lg blur-sm group-hover:bg-aurora-500/30 transition-all" />
                    <img
                      src={src}
                      alt="Entity"
                      className="relative w-48 h-auto max-h-64 object-contain rounded-lg border border-midnight-700 bg-black/20"
                    />
                    <div className="absolute bottom-1 right-1 px-1 bg-black/60 text-[9px] text-gray-500 rounded">
                      {charImg ? 'Character' : 'Monster'} Asset
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-midnight-900 border border-midnight-800 rounded p-1">
                <div className="text-[9px] uppercase text-gray-500">HP</div>
                <div className="text-sm font-bold text-green-400">{raw.hp ?? entity.currentHp ?? '?'}</div>
              </div>
              <div className="bg-midnight-900 border border-midnight-800 rounded p-1">
                <div className="text-[9px] uppercase text-gray-500">AC</div>
                <div className="text-sm font-bold text-blue-400">{raw.armorClass ?? '?'}</div>
              </div>
              <div className="bg-midnight-900 border border-midnight-800 rounded p-1">
                <div className="text-[9px] uppercase text-gray-500">SPD</div>
                <div className="text-sm font-bold text-orange-400">
                  {typeof raw.speed === 'number' ? raw.speed : (raw.speed?.walk ?? 30)}
                </div>
              </div>
              <div className="bg-midnight-900 border border-midnight-800 rounded p-1">
                <div className="text-[9px] uppercase text-gray-500">INIT</div>
                <div className="text-sm font-bold text-yellow-400">
                  {raw.initiative >= 0 ? `+${raw.initiative}` : raw.initiative}
                </div>
              </div>
            </div>

            {/* Attributes (Collapsed compact view) */}
            {raw.attributes && (
              <div className="flex justify-between px-2 py-1 bg-midnight-900/40 rounded text-[10px] font-mono border border-midnight-800/50">
                {Object.entries(raw.attributes).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center">
                    <span className="text-gray-600 uppercase">{key.slice(0, 3)}</span>
                    <span className="text-gray-300">{val as number}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-aurora-300 uppercase tracking-widest">
                  Actions ({actions.length})
                </h3>
                <div className="text-[9px] text-gray-600 font-mono">Derived & Structured</div>
              </div>

              {actions.length === 0 && (
                <div className="text-xs text-gray-600 italic border border-dashed border-gray-800 p-2 rounded text-center">
                  No structured actions found.
                </div>
              )}

              <div className="space-y-1">
                {actions.map((act, i) => (
                  <ActionDebugCard key={i} action={act} />
                ))}
              </div>
            </div>

            {/* FEATURES SECTION */}
            <div>
              <h3 className="text-xs font-bold text-aurora-300 uppercase tracking-widest mb-2 mt-4">
                Features ({features.length})
              </h3>
              {features.length === 0 && <div className="text-xs text-gray-600 italic">No features.</div>}
              <div className="space-y-2">
                {features.map((feat, i) => (
                  <div key={i} className="text-xs border border-midnight-800 bg-midnight-900/30 p-2 rounded">
                    <div className="flex justify-between font-bold text-gray-400">
                      <span>{feat.name}</span>
                      {feat.usage && (
                        <span className="text-[9px] bg-midnight-800 px-1 rounded text-orange-400/80">
                          {feat.usage.max}/{feat.usage.per}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 line-clamp-3 hover:line-clamp-none transition-all cursor-n-resize">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* EQUIPMENT SECTION */}
            <div>
              <h3 className="text-xs font-bold text-aurora-300 uppercase tracking-widest mb-2 mt-4">
                Equipment ({equipment.length})
              </h3>
              {equipment.length === 0 && <div className="text-xs text-gray-600 italic">No equipment.</div>}
              <div className="flex flex-wrap gap-1">
                {equipment.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="text-[10px] bg-midnight-800 border border-midnight-700 text-gray-400 px-2 py-1 rounded"
                  >
                    <span className={cn(item.equipped ? 'text-green-400' : 'text-gray-500')}>
                      {item.equipped ? '●' : '○'}
                    </span>
                    <span className="ml-1">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RAW TAB */}
        {tab === 'raw' && (
          <div className="w-full">
            <JsonTree data={entity} label="DebugEntity (Wrapper)" />
          </div>
        )}
      </div>
    </div>
  );
}
