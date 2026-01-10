import type { Player } from '@/types/contracts';

interface CombatScreenProps {
  roomId: string;
  players?: Player[];
}

export function CombatScreen({ roomId, players = [] }: CombatScreenProps) {
  void roomId;
  void players;
  return (
    <div className="flex items-center justify-center h-screen bg-midnight-900 text-shadow-300">
      <div className="text-center p-8 border border-aurora-500/30 rounded-xl bg-midnight-950/50">
        <h2 className="text-2xl font-bold text-aurora-400 mb-4">🚧 Combat System Migration 🚧</h2>
        <p className="text-shadow-400 max-w-md">
          The client-side combat engine is being replaced by a server-authoritative logic.
          <br />
          <br />
          Please use the Game Master tools or Chat Actions to resolve combat for now.
        </p>
      </div>
    </div>
  );
}
