import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Types derived from backend (could be shared, but defining here for frontend decoupling)
interface WorldCondition {
  key: string;
  currentValue: string;
  values: string[];
  description: string;
  lastUpdatedTurn: number;
}

interface RandomEvent {
  name: string;
  description: string;
  turnTriggered: number;
  visibility: 'dm' | 'public';
}

interface EntropyState {
  conditions: WorldCondition[];
  eventsLog: RandomEvent[];
  entropyPool: number;
}

interface EntropyDebugPanelProps {
  state: EntropyState | null; // Null if not initialized
}

export function EntropyDebugPanel({ state }: EntropyDebugPanelProps) {
  if (!state) {
    return <div className="p-4 text-aurora-500/50 italic">Entropy System not initialized or no state available.</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Pool Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-aurora-300 font-bold uppercase tracking-widest text-sm">Entropy Pool</h3>
          <span className="text-aurora-100 font-mono text-lg">{(state.entropyPool * 100).toFixed(1)}%</span>
        </div>
        <ProgressBar
          current={state.entropyPool * 100}
          target={100}
          showPercentage={false}
          showETA={false}
          className="w-full"
        />
        <p className="text-xs text-aurora-500/70">
          Higher pool increases probability of Chaos Mutations and Random Events.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Conditions Column */}
        <Card className="bg-midnight-900/50 border-midnight-700 flex flex-col min-h-0">
          <div className="p-4 border-b border-midnight-700 bg-midnight-950/30">
            <h4 className="text-aurora-300 font-semibold tracking-wide text-xs uppercase">World Conditions</h4>
          </div>
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader className="bg-midnight-950/50">
                <TableRow className="border-midnight-700 hover:bg-transparent">
                  <TableHead className="text-aurora-500 h-8 text-xs w-[140px]">Key</TableHead>
                  <TableHead className="text-aurora-500 h-8 text-xs">Current Value</TableHead>
                  {/* <TableHead className="text-aurora-500 h-8 text-xs text-right">Last Turn</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.conditions.map((condition) => (
                  <TableRow key={condition.key} className="border-midnight-800 hover:bg-midnight-800/30">
                    <TableCell className="font-medium text-aurora-200 py-2 text-xs">
                      {condition.key}
                      <div
                        className="text-[10px] text-aurora-500/60 font-normal leading-tight mt-0.5 line-clamp-2"
                        title={condition.description}
                      >
                        {condition.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-nebula-300 py-2 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-nebula-500/10 border border-nebula-500/20">
                        {condition.currentValue}
                      </span>
                    </TableCell>
                    {/* <TableCell className="text-right text-aurora-500/50 py-2 text-xs font-mono">
                      {condition.lastUpdatedTurn}
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Event Log Column */}
        <Card className="bg-midnight-900/50 border-midnight-700 flex flex-col min-h-0">
          <div className="p-4 border-b border-midnight-700 bg-midnight-950/30">
            <h4 className="text-aurora-300 font-semibold tracking-wide text-xs uppercase">Event History</h4>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {state.eventsLog.map((event, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-midnight-700 pb-1 last:pb-0">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${event.visibility === 'dm' ? 'bg-orange-500' : 'bg-aurora-400'}`}
                  />

                  <div className="flex justify-between items-start mb-1">
                    <span className="text-aurora-200 font-semibold text-sm">{event.name}</span>
                    <span className="text-[10px] font-mono text-aurora-500/50 bg-midnight-950 px-1 rounded">
                      Turn {event.turnTriggered}
                    </span>
                  </div>
                  <p className="text-xs text-aurora-400/80 leading-relaxed">{event.description}</p>
                  {event.visibility === 'dm' && (
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider text-orange-400/80 border border-orange-500/20 px-1 rounded bg-orange-500/5">
                      DM Only
                    </span>
                  )}
                </div>
              ))}

              {state.eventsLog.length === 0 && (
                <div className="text-center text-aurora-500/30 text-xs py-8">No random events recorded yet.</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
