
import React from 'react';
import type { EntropyItem, WorldCondition, RandomEvent } from '../types';
import { GlobeAltIcon, BoltIcon } from './Icons';

interface EntropyCardProps {
  item: EntropyItem;
  currentTurn: number;
}

const OrderedConditionMeter: React.FC<{ values: string[], currentValue: string }> = ({ values, currentValue }) => {
    const currentIndex = values.indexOf(currentValue);
    return (
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status Meter</h4>
            <div className="flex w-full bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700">
                {values.map((value, index) => (
                    <div
                        key={value}
                        className={`flex-1 text-center p-2 text-xs font-bold transition-all duration-300 ${
                            index === currentIndex
                                ? 'bg-cyan-500 text-white shadow-lg'
                                : 'text-gray-400'
                        }`}
                        title={value}
                    >
                        <span className="hidden sm:inline">{value}</span>
                        <span className="sm:hidden">{value.substring(0,1)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UnorderedConditionDisplay: React.FC<{ values: string[], currentValue: string }> = ({ values, currentValue }) => (
    <>
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current State</h4>
            <div className="px-3 py-2 bg-cyan-800/80 text-cyan-100 text-base rounded-md font-bold text-center w-full shadow-inner">
                {currentValue}
            </div>
        </div>
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Possible States</h4>
            <div className="flex flex-wrap gap-2 mt-2">
                {values.map((value, i) => (
                    value !== currentValue && (
                        <span key={i} className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                            {value}
                        </span>
                    )
                ))}
            </div>
        </div>
    </>
);

const WorldConditionCard: React.FC<{ item: WorldCondition }> = ({ item }) => (
  <>
    <div className="flex items-center gap-3">
      <GlobeAltIcon />
      <h3 className="text-lg font-bold text-cyan-300 font-orbitron">{item.key}</h3>
    </div>
    <p className="mt-2 text-sm text-gray-300 flex-grow">{item.description}</p>
    {item.ordered ? (
      <OrderedConditionMeter values={item.values} currentValue={item.currentValue} />
    ) : (
      <UnorderedConditionDisplay values={item.values} currentValue={item.currentValue} />
    )}
  </>
);

const RandomEventCard: React.FC<{ item: RandomEvent }> = ({ item }) => (
  <>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BoltIcon />
        <h3 className="text-lg font-bold text-amber-300 font-orbitron">{item.name}</h3>
      </div>
      <span className="text-xs font-mono text-gray-500">Turn {item.turnTriggered}</span>
    </div>
    <p className="mt-2 text-sm text-gray-300 flex-grow">{item.description}</p>
    <div className="mt-4 p-3 bg-amber-900/20 border-l-4 border-amber-400 rounded">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Impact</h4>
        <p className="text-sm text-gray-200 mt-1">{item.impact}</p>
    </div>
  </>
);


const EntropyCard: React.FC<EntropyCardProps> = ({ item, currentTurn }) => {
  const isCondition = item.type === 'World Condition';
  const borderColor = isCondition ? 'border-cyan-500/30' : 'border-amber-500/30';
  
  const wasJustUpdated = isCondition && item.lastUpdatedTurn === currentTurn && currentTurn > 1;

  return (
    <div className={`relative bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border ${borderColor} backdrop-blur-sm shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300 ${wasJustUpdated ? 'animate-glow' : ''}`}>
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 2px #a855f7, 0 0 4px #a855f7, 0 0 6px #a855f7; }
          50% { box-shadow: 0 0 10px #a855f7, 0 0 15px #a855f7, 0 0 20px #a855f7; }
          100% { box-shadow: 0 0 2px #a855f7, 0 0 4px #a855f7, 0 0 6px #a855f7; }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out;
        }
      `}</style>
        <div className="absolute -top-px -left-px -right-px h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        <div className="absolute -bottom-px -left-px -right-px h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        
        {isCondition ? (
            <WorldConditionCard item={item as WorldCondition} />
        ) : (
            <RandomEventCard item={item as RandomEvent} />
        )}
    </div>
  );
};

export default EntropyCard;
