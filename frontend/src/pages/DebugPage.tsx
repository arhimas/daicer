import { useState } from 'react';
import JuicyLayout from '@/components/layout/JuicyLayout'; // [NEW] Import JuicyLayout
// import Navbar from '../components/layout/Navbar'; // [REMOVED] Handled by JuicyLayout

import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

import { RoomSelection } from '../features/debug/components/RoomSelection';
import { GameDebugView } from '../features/debug/components/GameDebugView';
import { WorldConfigForm } from '../features/debug/components/WorldConfigForm';

import type { WorldConfig } from '../features/debug/utils/types';

type Stage = 'selection' | 'dm-setup' | 'world' | 'debug';

export default function DebugPage() {
  const [stage, setStage] = useState<Stage>('selection');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // World Config State for the 'world' stage
  const [worldConfig, setWorldConfig] = useState<WorldConfig>(() => ({
    seed: `new-campaign-${Math.random().toString(36).substring(7)}`,
    chunkSize: 32,
    globalScale: 0.01,
    seaLevel: 0,
    elevationScale: 1,
    roughness: 0.5,
    detail: 4,
    moistureScale: 1,
    temperatureOffset: 0,
    structureChance: 0.1,
    structureSpacing: 10,
    structureSizeAvg: 10,
    roadDensity: 0.5,
    fogRadius: 10,
  }));

  // Handlers
  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    setStage('debug'); // Jump straight to debug for existing rooms
  };

  const handleLaunchGame = async () => {
    // Here we would save the world config to the room via mutation
    // For now, we just proceed to debug view which uses the config locally or re-seeds
    setStage('debug');
  };

  return (
    <JuicyLayout>
      <div className="flex flex-col h-full w-full text-shadow-100 font-sans">
        {/* Local Breadcrumb / Toolbar */}

        <div className="flex-1 overflow-hidden relative">
          {stage === 'selection' && (
            <div className="h-full overflow-y-auto p-6">
              <RoomSelection
                onSelect={handleRoomSelect}
                onCreate={() => {
                  // Redirect to unified wizard with debug target
                  window.location.href = '/create?target=debug';
                }}
              />
            </div>
          )}

          {stage !== 'selection' && (
            <div className="absolute top-4 left-4 z-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStage('selection');
                  setActiveRoomId(null);
                }}
                className="gap-2 text-aurora-300 hover:text-aurora-100 hover:bg-midnight-800/50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Lobby
              </Button>
            </div>
          )}

          {/* Navigation for Knowledge Base (Temporary Access) */}

          {stage === 'world' && (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-aurora-500 tracking-tighter">INITIALIZE WORLD</h1>
                <p className="text-muted-foreground">Configure the physical terrain and biomes</p>
              </div>

              <div className="w-full max-w-md bg-midnight-900 border border-midnight-800 rounded-xl p-6 shadow-2xl">
                <WorldConfigForm
                  config={worldConfig}
                  onConfigChange={setWorldConfig}
                  isActive
                  onRegenerate={() => {}} // No-op in this preview view
                />

                <div className="mt-8">
                  <Button
                    onClick={handleLaunchGame}
                    className="w-full bg-aurora-600 hover:bg-aurora-500 text-midnight-950 font-bold py-3 text-lg"
                  >
                    Launch Simulation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stage === 'debug' && activeRoomId && <GameDebugView roomId={activeRoomId} />}
        </div>
      </div>
    </JuicyLayout>
  );
}
