import { useState, useEffect } from 'react';
import type { EntitySheet, EntityAction, EntityFeature } from '@/types/contracts';
import { X, Shield, Swords, Zap, Footprints, Heart, Skull, Crown } from 'lucide-react';
import cn from '../../lib/utils';

interface UniversalEntitySheetProps {
  entity: EntitySheet | null;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

// --- Subcomponents ---

// 1. Stat Box (Attribute)
function formatModifier(val: number) {
  return val >= 0 ? `+${val}` : `${val}`;
}

function AttributeBox({ label, value }: { label: string; value: number }) {
  const mod = Math.floor((value - 10) / 2);
  const sign = mod >= 0 ? '+' : '';

  return (
    <div className="flex flex-col items-center bg-midnight-900/50 border border-midnight-700 rounded p-2 min-w-[3.5rem]">
      <span className="text-xs uppercase text-midnight-400 font-bold tracking-wider mb-1">{label}</span>
      <span className="text-xl font-display font-bold text-gold-400">{value}</span>
      <span className="text-xs font-mono text-midnight-300 bg-midnight-800 px-1 rounded mt-1">
        {sign}
        {mod}
      </span>
    </div>
  );
}

// 2. Vital Box (AC, Speed, etc)
function VitalBox({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-midnight-800/80 border border-midnight-600 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-gold-500" />
        <span className="text-xs uppercase text-midnight-400 font-bold tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-display font-bold text-gray-100">{value}</div>
      {sub && <div className="text-[10px] text-midnight-400 uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

// 3. Action Row

// 4. Feature Row
function FeatureRow({ feature }: { feature: EntityFeature }) {
  return (
    <div className="p-3 border-l-2 border-midnight-600 bg-midnight-900/20 hover:bg-midnight-900/40 transition-colors">
      <div className="flex justify-between items-baseline mb-1">
        <h4 className="font-bold text-sm text-gray-300">{feature.name}</h4>
        {feature.usage && (
          <span className="text-[10px] uppercase tracking-wide text-midnight-500 bg-midnight-950 px-2 py-0.5 rounded-full border border-midnight-800">
            {feature.usage.max} / {feature.usage.per}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
    </div>
  );
}

// 5. Main Content Component (Embeddable)
export function UniversalEntitySheetContent({
  entity,
  onAction,
}: {
  entity: EntitySheet;
  onAction?: (actionId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'main' | 'bio'>('main');

  // Derive simple helpers
  const { stats, hp, maxHp, ac, speed, level, name } = entity;
  const attrs = stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
  const isDead = hp <= 0;
  const hpPercent = Math.min(100, Math.max(0, (hp / maxHp) * 100));

  return (
    <div className="flex-1 flex flex-col h-full bg-midnight-950 border border-midnight-700 shadow-2xl shadow-black rounded-lg overflow-hidden">
      {/* Color Strip Top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-midnight-900 via-gold-600 to-midnight-900 opacity-80" />

      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-midnight-900/50 border-b border-midnight-800 relative overflow-hidden shrink-0">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar Circle */}
          <div className="w-16 h-16 rounded-full border-2 border-gold-600/30 bg-midnight-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            {entity.type === 'player' ? (
              <Crown className="w-8 h-8 text-gold-500/50" />
            ) : (
              <Skull className="w-8 h-8 text-red-900/50" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-display font-bold text-gray-100 tracking-wide drop-shadow-md">{name}</h1>
            <div className="flex gap-3 text-sm font-mono text-gold-500/80 uppercase tracking-widest mt-1">
              <span>Level {level}</span>
              <span className="w-px h-4 bg-midnight-700 mx-1" />
              <span>{entity.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isDead ? (
            <div className="px-3 py-1 bg-red-950/50 border border-red-900/50 text-red-500 text-xs font-bold uppercase rounded flex items-center gap-2">
              <Skull className="w-3 h-3" /> Dead
            </div>
          ) : (
            <div className="px-3 py-1 bg-green-950/30 border border-green-900/30 text-green-500/80 text-xs font-bold uppercase rounded flex items-center gap-2">
              <Heart className="w-3 h-3" /> Healthy
            </div>
          )}
        </div>
      </header>

      {/* Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Vitals & Attributes */}
        <aside className="w-full md:w-[280px] bg-midnight-900/30 border-r border-midnight-800 p-6 flex flex-col gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-midnight-700 shrink-0">
          {/* HP Bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs uppercase font-bold text-midnight-400 mb-1">
              <span>Hit Points</span>
              <span className={cn(hpPercent < 30 ? 'text-red-500' : 'text-gray-300')}>
                {hp} / {maxHp}
              </span>
            </div>
            <div className="h-3 w-full bg-midnight-950 rounded-full overflow-hidden border border-midnight-800">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  hpPercent < 30 ? 'bg-red-600' : 'bg-gradient-to-r from-green-700 to-green-500'
                )}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-3">
            <VitalBox icon={Shield} label="Armor" value={entity.armorClass ?? ac ?? 10} />
            <VitalBox icon={Zap} label="Init" value={formatModifier(attrs.initiativeBonus || 0)} />
            <VitalBox
              icon={Footprints}
              label="Speed"
              value={typeof speed === 'number' ? speed : speed.walk}
              sub="ft/rnd"
            />
            <VitalBox icon={Swords} label="Prof" value={`+${Math.ceil(1 + level / 4)}`} />
          </div>

          <div className="w-full h-px bg-midnight-800" />

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-3">
            <AttributeBox label="STR" value={attrs.strength} />
            <AttributeBox label="DEX" value={attrs.dexterity} />
            <AttributeBox label="CON" value={attrs.constitution} />
            <AttributeBox label="INT" value={attrs.intelligence} />
            <AttributeBox label="WIS" value={attrs.wisdom} />
            <AttributeBox label="CHA" value={attrs.charisma} />
          </div>
        </aside>

        {/* CENTER/RIGHT: Tabs & Content */}
        <main className="flex-1 flex flex-col bg-midnight-950/20 relative min-w-0">
          {/* Tabs */}
          <div className="flex border-b border-midnight-800 bg-midnight-900/20 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('main')}
              className={cn(
                'px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all hover:bg-midnight-800/50',
                activeTab === 'main'
                  ? 'border-gold-600 text-gold-400 bg-midnight-800/30'
                  : 'border-transparent text-midnight-500'
              )}
            >
              Combat & Actions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bio')}
              className={cn(
                'px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all hover:bg-midnight-800/50',
                activeTab === 'bio'
                  ? 'border-gold-600 text-gold-400 bg-midnight-800/30'
                  : 'border-transparent text-midnight-500'
              )}
            >
              Features & Bio
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-midnight-700">
            {activeTab === 'main' && (
              <div className="flex flex-col gap-8">
                <section>
                  <h3 className="section-header mb-4 flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                    <Swords className="w-4 h-4 text-midnight-500" /> Actions
                    <div className="h-px bg-midnight-800 flex-1" />
                  </h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {/* 1. Derived Runtime Actions (Priority) */}
                    {entity.availableActions && entity.availableActions.length > 0
                      ? entity.availableActions.map((action, idx) => (
                          <div
                            key={action.id + idx}
                            className="group flex flex-col gap-2 p-3 bg-midnight-900/60 border border-midnight-700/50 hover:border-gold-700/50 hover:bg-midnight-800/80 rounded transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-sm text-primary-gold mb-1">{action.name}</div>
                                <div className="text-[10px] uppercase tracking-wider text-midnight-400 font-mono">
                                  {action.type}
                                  {action.range ? ` • ${action.range}ft` : ''}
                                  {action.attack ? ` • +${action.attack.bonus} Hit` : ''}
                                  {action.save ? ` • DC ${action.save.dc} ${action.save.attribute.toUpperCase()}` : ''}
                                </div>
                              </div>
                              {onAction && (
                                <button
                                  type="button"
                                  onClick={() => onAction(action.id)}
                                  className="px-3 py-1 bg-gold-600/20 hover:bg-gold-600/40 text-gold-400 text-xs font-bold uppercase rounded border border-gold-600/30 transition-colors"
                                >
                                  Use
                                </button>
                              )}
                            </div>
                            {action.description && (
                              <div className="text-xs text-gray-400 line-clamp-2">{action.description}</div>
                            )}
                            {/* Cost Badge */}
                            {action.cost && (
                              <div className="mt-1 flex gap-2">
                                <span className="text-[10px] bg-midnight-950 px-2 py-0.5 rounded text-midnight-400 border border-midnight-800 uppercase">
                                  {action.cost.resource} ({action.cost.amount})
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      : /* 2. Legacy Actions (Fallback) */
                        entity.actions &&
                        entity.actions.length > 0 && (
                          <div className="col-span-full mb-2">
                            <span className="text-xs text-midnight-500 uppercase tracking-widest">
                              Legacy Actions (Migrating...)
                            </span>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-2">
                              {entity.actions.map((action: EntityAction, idx: number) => (
                                <div
                                  key={idx}
                                  className="group flex flex-col gap-2 p-3 bg-midnight-900/40 border border-midnight-700/50 hover:border-gold-700/50 hover:bg-midnight-800/60 rounded transition-all cursor-default"
                                >
                                  <div className="font-bold text-sm text-primary-gold mb-1">{action.name}</div>
                                  {action.description && (
                                    <div className="text-xs text-gray-400">{action.description}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                    {!entity.availableActions?.length && !entity.actions?.length && (
                      <div className="text-sm text-shadow-500 italic p-4 text-center border border-dashed border-midnight-800 rounded col-span-full">
                        No actions available.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'bio' && (
              <div className="flex flex-col gap-8">
                <section>
                  <h3 className="section-header mb-4 flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                    <Crown className="w-4 h-4 text-midnight-500" /> Features & Traits
                    <div className="h-px bg-midnight-800 flex-1" />
                  </h3>
                  <div className="flex flex-col gap-2">
                    {entity.features && entity.features.length > 0 ? (
                      entity.features.map((feature: EntityFeature, i: number) => (
                        <FeatureRow key={feature.name + i} feature={feature} />
                      ))
                    ) : (
                      <p className="text-midnight-500 italic text-sm">No features available.</p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="section-header mb-4 flex items-center gap-2 text-gray-400 uppercase text-xs font-bold tracking-widest">
                    <Footprints className="w-4 h-4 text-midnight-500" /> Bio
                    <div className="h-px bg-midnight-800 flex-1" />
                  </h3>
                  <div className="text-gray-400 text-sm leading-relaxed space-y-2">
                    <p>{entity.backstory || 'No backstory provided.'}</p>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UniversalEntitySheet({ entity, onClose, onAction }: UniversalEntitySheetProps) {
  useEffect(() => {
    if (!entity) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entity, onClose]);

  if (!entity) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[900px] h-[85vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="sr-only">Close</span>
          <X className="w-8 h-8" />
        </button>
        <UniversalEntitySheetContent entity={entity} onAction={onAction} />
      </div>
    </div>
  );
}
