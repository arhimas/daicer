import { useState, useEffect, useMemo } from 'react';
import useGamePolling from '@/hooks/useGamePolling';
import { TimeFrameProvider, useTimeFrame } from '@/contexts/TimeFrameContext';
import { getRoomState } from '@/services/api';
import { Room, Message } from '@/types/contracts';
import { WorldConfig as OldWorldConfig, Coordinates, DebugEntity, ZLevel } from '../utils/types';
import { GodModeChat, type GodModeMessage } from './GodModeChat';
import { TimeControls } from './TimeControls';

import { GameDebugInspector } from './GameDebugInspector';
import { GameDebugMap } from './GameDebugMap';
import { GameEventsPanel } from './GameEventsPanel';

// Default config
const DEFAULT_CONFIG: OldWorldConfig = {
  seed: 'debug-seed',
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
};

interface GameDebugViewProps {
  roomId: string;
}

function GameDebugInner({
  roomId,
  room,
}: {
  roomId: string;
  room: Room & { features?: unknown[]; messages?: Message[] };
}) {
  // Config State
  const [activeTab, setActiveTab] = useState<'tools' | 'inspector' | 'entropy'>('tools');
  // ... (snip) ...

  // Sync Entities... (omitted)

  // ...

  // --- 4-COLUMN LAYOUT ---
  // Config
  const config = useMemo(() => {
    if (room.world) {
      return {
        seed: room.world.seed || DEFAULT_CONFIG.seed,
        chunkSize: room.world.chunkSize || DEFAULT_CONFIG.chunkSize,
        globalScale: room.world.globalScale || DEFAULT_CONFIG.globalScale,
        seaLevel: room.world.seaLevel || DEFAULT_CONFIG.seaLevel,
        elevationScale: room.world.elevationScale || DEFAULT_CONFIG.elevationScale,
        roughness: room.world.roughness || DEFAULT_CONFIG.roughness,
        detail: room.world.detail || DEFAULT_CONFIG.detail,
        moistureScale: room.world.moistureScale || DEFAULT_CONFIG.moistureScale,
        temperatureOffset: room.world.temperatureOffset || DEFAULT_CONFIG.temperatureOffset,
        structureChance: room.world.structureChance || DEFAULT_CONFIG.structureChance,
        structureSpacing: room.world.structureSpacing || DEFAULT_CONFIG.structureSpacing,
        structureSizeAvg: room.world.structureSizeAvg || DEFAULT_CONFIG.structureSizeAvg,
        roadDensity: room.world.roadDensity || DEFAULT_CONFIG.roadDensity,
        fogRadius: room.world.fogRadius || DEFAULT_CONFIG.fogRadius,
      };
    }
    return DEFAULT_CONFIG;
  }, [room.world]);

  // Time Travel Context
  const { currentTimeFrame, isLive } = useTimeFrame();

  const { creatures: socketCreatures } = useGamePolling(room.documentId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameEvents: any[] = []; // TODO: Fetch from polling if needed

  const [entities, setEntities] = useState<DebugEntity[]>([]);

  // Sync Entities: Either from Socket (Live) or from TimeFrame (History)
  useEffect(() => {
    // Union of possible source types (Player, Creature, EntitySheet)
    // We treat them as generic objects with common fields for mapping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sourceData: any[] = [];

    if (isLive) {
      if (socketCreatures && socketCreatures.length > 0) {
        sourceData = socketCreatures;
      } else if (room && room.entities) {
        sourceData = room.entities;
      }
    } else if (currentTimeFrame && currentTimeFrame.gameState && currentTimeFrame.gameState.entities) {
      sourceData = currentTimeFrame.gameState.entities;
    }

    if (sourceData) {
      setEntities((prevEntities) =>
        sourceData.map((c) => {
          const id = c.id || c.documentId || 'unknown';
          const prev = prevEntities.find((p) => p.id === id);

          let updatedPos = c.position
            ? { ...c.position, z: (c.position.z as ZLevel) || 0 }
            : { x: 0, y: 0, z: 0 as ZLevel };
          const isZero = updatedPos.x === 0 && updatedPos.y === 0 && updatedPos.z === 0;

          // GUARD: If new pos is 0,0,0 but old pos was valid different, keep old pos
          if (isZero && prev && (prev.position.x !== 0 || prev.position.y !== 0 || prev.position.z !== 0)) {
            console.warn(`[GameDebugView] Ignored 0,0,0 reset for entity ${c.name} (${id}). Kept at`, prev.position);
            updatedPos = prev.position;
          }

          return {
            id,
            name: c.name || 'Unknown Entity',
            type: (c.type as 'player' | 'monster') || 'monster',
            position: updatedPos,
            speed: c.speed || 30,
            parsedSpeed: typeof c.speed === 'number' ? c.speed : 30,
            visionRadius: 10,
            color: c.type === 'player' ? '#4ade80' : '#f87171',
            exploredTiles: new Set<string>(),
            pendingPath: undefined,
            currentHp: c.currentHp,
            maxHp: c.maxHp,
            structuredActions: c.actions || [],

            // Map expanded fields
            stats: c.stats,
            features: c.features,
            equipment: c.equipment || (c.sheet && c.sheet.inventory), // Try direct or sheet inventory
            proficiencies: c.proficiencies || (c.sheet && c.sheet.class && c.sheet.class.proficiencies),

            raw: c,
          };
        })
      );
    }
  }, [socketCreatures, currentTimeFrame, isLive, room]);

  // SAFE GUARD EFFECT:
  // We need to prevent override.
  // Actually, let's change the setEntities above to use the functional update pattern and check previous.
  /*
  setEntities(prevEntities => {
      return sourceData.map(c => {
          const prev = prevEntities.find(p => p.id === (c.id || c.documentId));
          let finalPos = c.position || { x:0, y:0, z:0 };
          const isZero = finalPos.x === 0 && finalPos.y === 0 && finalPos.z === 0;
          
          if (isZero && prev && (prev.position.x !== 0 || prev.position.y !== 0 || prev.position.z !== 0)) {
               console.warn('[GameDebugView] Ignored 0,0,0 reset', c.name);
               finalPos = prev.position;
          }
          ...
      })
  })
  */

  // Entity Selection State
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const activeEntity = useMemo(
    () => entities.find((e) => e.id === activeEntityId) || entities[0] || null,
    [entities, activeEntityId]
  );

  // God Mode Chat State
  const [chatMessages, setChatMessages] = useState<GodModeMessage[]>([
    {
      id: 'system-welcome',
      role: 'system',
      content: 'God Mode Initialized. You have omnipotent control over this world.',
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync Room Messages to Chat
  useEffect(() => {
    if (room && room.messages) {
      const historicalMessages = (room.messages || []).map((m: Message) => ({
        id: m.documentId || m.id,
        role: (m.type === 'narration' ? 'assistant' : m.sender === 'system' ? 'system' : 'user') as
          | 'system'
          | 'user'
          | 'assistant', // Approximate mapping
        content: m.text || (m as { content?: string }).content || '', // Fallback if schema differs from API (MessageSchema uses 'text')
        timestamp: new Date(m.timestamp).getTime(),
      }));

      // Merge with system welcome, but avoid duplicates if we wanted strictness.
      // For now just replacing local state with backend state + live socket updates is tricky.
      // Simplest: Just use backend state as base.

      // Filter by TimeFrame
      let visibleMessages = historicalMessages;
      if (!isLive && currentTimeFrame) {
        const frameTime = new Date(currentTimeFrame.timestamp).getTime();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visibleMessages = historicalMessages.filter((m: any) => m.timestamp <= frameTime);
      }

      setChatMessages(visibleMessages);
    }
  }, [room, isLive, currentTimeFrame]);

  // Socket Integration Hook (Stubbed)
  useEffect(() => {
    // God Mode response handling moved to polling/API return
  }, [isLive]);

  // Map & View State - activeLocation moved here for coordination
  const [activeLocation, setActiveLocation] = useState<{ label: string; x: number; y: number; z: number } | null>(null);

  // Handle Interactions (Callbacks)
  const handleTileSingleClick = (target: Coordinates) => {
    // Set Active Location (Chip)
    setActiveLocation({
      label: `${target.x}, ${target.y}, ${target.z}`,
      x: target.x,
      y: target.y,
      z: target.z,
    });
  };

  const handleTileHover = (_: Coordinates | null) => {
    // Optional inspector hook
  };

  // Turn Logic (Movement only via Plan Move context menu for debug)
  // NOTE: This logic was in the main component, but it requires 'activeEntity' which is here,
  // and 'getTileAt' which is now in GameDebugMap.
  // To keep it simple, we can move the pathfinding logic to GameDebugMap OR keep it here but we need a callback from Map for getting tiles
  // For now, let's keep the plan logic in GameDebugMap or pass a callback down?
  // Actually, handlePlanMove was used in handleTileDoubleClick.
  // Let's defer path calculation to inside the Map component or pass the handler down.
  // Ideally, pathfinding needs 'getTileAt' which depends on chunkCache in the Map component.
  // So handlePlanMove should move to GameDebugMap, but it needs to update Entities state which is here.
  // We can pass `setEntities` or a `onEntityUpdate` callback to GameDebugMap.
  // OR, we can do the pathfinding inside GameDebugMap and just fire onPathCalculated(entityId, path).

  // Revised Strategy: Move pathfinding to GameDebugMap and expose onPathPlanned.
  const handlePathPlanned = (entityId: string, path: Coordinates[]) => {
    setEntities((prev) => prev.map((e) => (e.id === entityId ? { ...e, pendingPath: path } : e)));
  };

  // Chat Handler
  const handleGodModeCommand = async (message: string, mode: 'chat' | 'direct' = 'chat') => {
    // Optimistic UI for User Message
    const userMsg: GodModeMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: mode === 'direct' ? `[DIRECT] ${message}` : message,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      if (mode === 'direct') {
        // Direct Tool Execution (Bypass LLM)
        const { executeDirectTool } = await import('@/services/api');
        const response = await executeDirectTool(roomId, message);

        // Response logic
        if (response.success) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: 'system',
              content: `✅ Execution Successful: ${response.message}`,
              timestamp: Date.now(),
            },
          ]);
        }
      } else {
        // Chat / LLM Mode
        const { sendGodModeCommand } = await import('@/services/api');
        const response = await sendGodModeCommand(roomId, message);

        if (response && response.message) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: 'assistant',
              content: response.message,
              timestamp: Date.now(),
            },
          ]);
        }
      }
      setIsProcessing(false);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'system',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown'}`,
          timestamp: Date.now(),
        },
      ]);
      setIsProcessing(false);
    }
  };

  // --- 4-COLUMN LAYOUT ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full bg-black">
      {/* 2. MAIN 4-COLUMN AREA */}
      <div className="flex-1 flex min-h-0">
        {/* COLUMN 1: TOOLS/INSPECTOR (Left) - 20% Width */}
        <div className="w-[20%] min-w-[250px] flex flex-col border-r border-midnight-800 z-30 shadow-xl">
          <GameDebugInspector
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLive={isLive}
            entities={entities}
            activeEntityId={activeEntityId}
            setActiveEntityId={setActiveEntityId}
            activeEntity={activeEntity}
            activeLocation={activeLocation}
            onGodModeCommand={handleGodModeCommand}
            entropyState={room.entropyState}
            roomId={roomId}
          />
        </div>

        {/* COLUMN 2: CHAT (Middle-Left) - 25% Width */}
        <div className="w-[25%] min-w-[300px] flex-shrink-0 bg-midnight-950 border-r border-midnight-800 flex flex-col z-20 shadow-xl">
          <div className="p-3 bg-midnight-900 border-b border-midnight-800 font-bold text-xs uppercase tracking-wider text-shadow-300">
            CHAT / LOG
          </div>
          <div className="flex-1 min-h-0 relative">
            <GodModeChat
              messages={chatMessages}
              onSendMessage={handleGodModeCommand}
              isProcessing={isProcessing}
              inputValue={chatInput}
              onInputChange={setChatInput}
              activeLocation={activeLocation}
              onClearLocation={() => setActiveLocation(null)}
              activeEntity={activeEntity}
              events={gameEvents}
            />
          </div>
        </div>

        {/* COLUMN 3: GAME EVENTS (Middle-Right) - 20% Width - NEW */}
        <div className="w-[20%] min-w-[250px] flex flex-col z-10 shadow-lg">
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Dynamically imported to avoid circular deps if any, but regular import is fine */}
            {/* We need to import GameEventsPanel */}
            <GameEventsPanel events={gameEvents} />
          </div>
        </div>

        {/* COLUMN 4: MAP (Right) - Remaining Width */}
        <div className="flex-1 flex flex-col shadow-2xl z-0">
          <GameDebugMap
            roomId={roomId}
            connected
            activeEntity={activeEntity}
            entities={entities}
            activeEntityId={activeEntityId}
            config={config}
            onTileClick={handleTileSingleClick}
            onPathPlanned={handlePathPlanned}
            onTileHover={handleTileHover}
          />
        </div>
      </div>

      {/* 1. TIME CONTROLS (Bottom, Full Width) */}
      <TimeControls roomId={roomId} />
    </div>
  );
}

// Moved to bottom to satisfy no-use-before-define
export function GameDebugView({ roomId }: GameDebugViewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Room Data (History & TimeFrames) manually to avoid @apollo/client import issues
  useEffect(() => {
    let mounted = true;
    const fetchRoom = async () => {
      try {
        const r = await getRoomState(roomId);
        if (mounted) {
          setRoom(r);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    };

    fetchRoom();

    // Poll every 5s
    const interval = setInterval(fetchRoom, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [roomId]);

  if (loading) return <div className="text-white p-10">Loading Room...</div>;
  if (error) return <div className="text-red-500 p-10">Error loading room: {error}</div>;
  if (!room) return <div className="text-yellow-500 p-10">Room not found (ID: {roomId})</div>;

  return (
    <TimeFrameProvider room={room}>
      <GameDebugInner roomId={roomId} room={room} />
    </TimeFrameProvider>
  );
}
