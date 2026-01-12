import { useState, useEffect, useRef, useMemo } from 'react';

import clsx from 'clsx';
import { useChunkLoader } from '@/hooks/useChunkLoader';
import { GET_WORLD_TIME_QUERY } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { MapRenderer } from './MapRenderer';
import { MapRenderer3D } from './MapRenderer3D';
import { DebugEntity, Coordinates, WorldConfig } from '../utils/types';

interface GameDebugMapProps {
  roomId: string;
  connected?: boolean;
  activeEntity: DebugEntity | null;
  entities: DebugEntity[];
  activeEntityId: string | null;
  config: WorldConfig;
  onTileClick: (target: Coordinates) => void;
  // onTileDoubleClick is handled internally for pathfinding, but we emit the path
  onPathPlanned: (entityId: string, path: Coordinates[]) => void;
  onTileHover: (target: Coordinates | null) => void;
}

export function GameDebugMap({
  roomId,
  connected = true,
  activeEntity,
  entities,
  activeEntityId,
  config,
  onTileClick,
  onPathPlanned,
  onTileHover,
}: GameDebugMapProps) {
  const [cameraPosition, setCameraPosition] = useState<Coordinates>({ x: 0, y: 0, z: 0 });
  const [viewZ, setViewZ] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [is3D, setIs3D] = useState<boolean>(false); // Default to 2D per user request
  const [mapSize, setMapSize] = useState({ w: 800, h: 600 });

  // Visibility State
  const [godMode, setGodMode] = useState(false);
  const [nightVision, setNightVision] = useState(false);
  const [forceTime, setForceTime] = useState<'auto' | 'day' | 'night'>('auto');

  const mapRef = useRef<HTMLDivElement>(null);

  // Time Query
  const { data: timeData } = useQuery(GET_WORLD_TIME_QUERY, {
    variables: { roomId },
    pollInterval: 5000, // Poll every 5s
    fetchPolicy: 'network-only',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldTime = (timeData as any)?.getWorldTime;

  // Derived Light Level
  const lightLevel = useMemo(() => {
    if (forceTime === 'day') return 1.0;
    if (forceTime === 'night') return nightVision ? 1.0 : 0.2;
    if (!worldTime) return 1.0; // Default to day if no data

    // Auto
    if (nightVision) return Math.max(0.8, worldTime.lightLevel); // Boost light if NV is on
    return worldTime.lightLevel;
  }, [forceTime, nightVision, worldTime]);

  // Resize Observer
  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMapSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync camera to active entity ONLY when switching entities
  useEffect(() => {
    if (activeEntity) {
      setCameraPosition(activeEntity.position);
      // Clamp viewZ to valid MapRenderer range (-3 to 3) to prevent black screens
      // If entity is at Z=200, we view Z=3 (closest valid slice)
      const clampedZ = Math.max(-3, Math.min(3, activeEntity.position.z));
      setViewZ(clampedZ);
    }
  }, [activeEntityId, activeEntity]);

  // Chunk Loader
  const { chunkCache, getChunk } = useChunkLoader({ config });

  // Helper
  const getChunkId = (cx: number, cy: number) => `${cx},${cy}`;

  // Local Exploration State (Client-side Fog of War)
  const [localExplored, setLocalExplored] = useState<Record<string, Set<string>>>({});

  // Active Entity Visibility (Derived) & Exploration Update
  const { visibleTiles, currentExplored } = useMemo(() => {
    if (!activeEntity) return { visibleTiles: new Set<string>(), currentExplored: new Set<string>() };

    const visible = new Set<string>();
    const r = activeEntity.visionRadius || 10;
    const { x, y } = activeEntity.position;

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          visible.add(`${x + dx},${y + dy}`);
        }
      }
    }

    const explored = localExplored[activeEntity.id] || new Set<string>();
    return { visibleTiles: visible, currentExplored: explored };
  }, [activeEntity, localExplored]);

  // Effect to update exploration state
  useEffect(() => {
    if (!activeEntity || visibleTiles.size === 0) return;

    setLocalExplored((prev) => {
      const prevSet = prev[activeEntity.id] || new Set();
      let changed = false;
      visibleTiles.forEach((t) => {
        if (!prevSet.has(t)) changed = true;
      });

      if (!changed) return prev;

      const nextSet = new Set(prevSet);
      visibleTiles.forEach((t) => nextSet.add(t));
      return { ...prev, [activeEntity.id]: nextSet };
    });
  }, [activeEntity, visibleTiles]);

  // Chunk Provider for Renderer
  const chunkProvider = useMemo(
    () => ({
      getChunk: (x: number, y: number) => getChunk(x, y),
    }),
    [getChunk]
  );

  const getTileAt = (x: number, y: number, z: number) => {
    const chunkX = Math.floor(x / 32);
    const chunkY = Math.floor(y / 32);
    const chunk = chunkCache[getChunkId(chunkX, chunkY)];

    if (!chunk) return null;

    const lx = ((x % 32) + 32) % 32;
    const ly = ((y % 32) + 32) % 32;
    const lz = z + 3;

    if (!chunk.tiles || lz < 0 || lz >= chunk.tiles.length) return null;

    if (chunk?.tiles?.[lz]?.[ly]) {
      return chunk.tiles[lz][ly][lx];
    }
    return null;
  };

  // Pathfinding Helper
  const getTileCallback = (x: number, y: number, z: number) => {
    const tile = getTileAt(x, y, z);
    if (!tile) return null;
    return { isWalkable: tile.isWalkable };
  };

  const handleTileDoubleClick = (target: Coordinates) => {
    if (!activeEntity || !activeEntityId) return;

    import('../utils/pathfinding').then(({ findPath, calculatePathLength }) => {
      const path = findPath(activeEntity.position, target, getTileCallback);
      if (!path) {
        console.warn('Cannot move there');
        return;
      }

      // Check speed
      const totalCost = calculatePathLength(path);
      const maxDist = activeEntity.parsedSpeed / 5;

      if (totalCost > maxDist) {
        // Truncate logic
        const validPath = path.filter((p) => p.cost <= maxDist);
        if (validPath.length === 0) return;

        onPathPlanned(activeEntityId, validPath);
        console.info(`Planned partial move`);
      } else {
        onPathPlanned(activeEntityId, path);
        console.info(`Planned move (${totalCost.toFixed(1)} tiles)`);
      }
    });
  };

  return (
    <div className="flex-1 min-w-0 relative bg-black flex flex-col" ref={mapRef}>
      {/* Top Bar Overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
        {/* Left: Turn Info (Placeholder if needed, or just connection status) */}
        <div className="pointer-events-auto bg-midnight-900/90 backdrop-blur border border-midnight-700 rounded-lg p-2 shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[10px] font-mono text-shadow-300">{roomId}</span>
          </div>
        </div>

        {/* Right: View Controls */}
        <div className="pointer-events-auto bg-midnight-900/90 backdrop-blur border border-midnight-700 rounded-lg p-2 shadow-xl flex flex-col gap-2">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className="h-6 w-6 flex items-center justify-center text-shadow-300 hover:text-white"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            >
              +
            </button>
            <span className="text-[9px] font-mono text-shadow-300">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="h-6 w-6 flex items-center justify-center text-shadow-300 hover:text-white"
              onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Layer Control (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center">
        <div className="bg-midnight-900/90 backdrop-blur border border-midnight-700 rounded-full px-4 py-2 shadow-xl flex items-center gap-2">
          <span className="text-[10px] text-shadow-400 uppercase mr-2 font-bold">Z-Link</span>
          {[-1, 0, 1].map((z) => (
            <button
              type="button"
              key={z}
              onClick={() => setViewZ(z)}
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs transition-all',
                viewZ === z
                  ? 'bg-aurora-500 text-midnight-950 font-bold shadow-lg shadow-aurora-500/50 scale-110'
                  : 'text-shadow-400 hover:bg-midnight-800 hover:text-aurora-200'
              )}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Visibility Controls */}
        <div className="bg-midnight-900/90 backdrop-blur border border-midnight-700 rounded-full ml-4 px-4 py-2 shadow-xl flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGodMode(!godMode)}
            className={clsx(
              'text-xs font-bold uppercase transition-colors px-2 py-1 rounded',
              godMode ? 'bg-amber-500 text-black' : 'text-amber-500 hover:bg-white/10'
            )}
          >
            GOD
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            type="button"
            onClick={() => setNightVision(!nightVision)}
            className={clsx(
              'text-xs font-bold uppercase transition-colors px-2 py-1 rounded',
              nightVision ? 'bg-emerald-500 text-black' : 'text-emerald-500 hover:bg-white/10'
            )}
          >
            NV
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            type="button"
            onClick={() => setForceTime((prev) => (prev === 'auto' ? 'day' : prev === 'day' ? 'night' : 'auto'))}
            className="text-xs font-bold uppercase text-blue-300 hover:text-white min-w-[40px]"
          >
            {forceTime}
          </button>
          {worldTime && <span className="text-[10px] font-mono text-white/60 ml-1">{worldTime.formatted}</span>}
        </div>

        {/* Simple 2D/3D Toggle */}
        <div className="bg-midnight-900/90 backdrop-blur border border-midnight-700 rounded-full ml-4 px-4 py-2 shadow-xl flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIs3D(!is3D)}
            className="text-xs font-bold text-shadow-400 text-aurora-300 hover:text-white uppercase"
          >
            {is3D ? 'View 2D' : 'View 3D'}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {is3D ? (
          <MapRenderer3D
            width={mapSize.w}
            height={mapSize.h}
            center={cameraPosition}
            viewZ={viewZ}
            chunkProvider={chunkProvider}
            visibleTiles={visibleTiles}
            exploredTiles={currentExplored}
            entities={entities}
            ghostEntities={[]}
            previewPath={activeEntity?.pendingPath}
            onTileClick={onTileClick}
            onTileDoubleClick={handleTileDoubleClick}
            onTileHover={onTileHover}
          />
        ) : (
          <MapRenderer
            width={mapSize.w}
            height={mapSize.h}
            center={cameraPosition}
            viewZ={viewZ}
            scale={zoom}
            chunkProvider={chunkProvider}
            visibleTiles={visibleTiles}
            exploredTiles={currentExplored}
            restrictView={!!activeEntity} // Force restriction if entity is selected (but godMode overrides inside Renderer)
            godMode={godMode}
            lightLevel={lightLevel}
            entities={entities}
            ghostEntities={[]}
            previewPath={activeEntity?.pendingPath}
            onTileClick={onTileClick}
            onTileDoubleClick={handleTileDoubleClick}
            onTileHover={onTileHover}
            onZoom={(delta, mouseX, mouseY) => {
              const SCALE_FACTOR = 0.1;
              const newZoom = Math.max(0.1, Math.min(5, zoom - delta * SCALE_FACTOR));

              // Mouse-centered zoom logic
              const TILE_SIZE = 32 * zoom;
              const wx = cameraPosition.x + (mouseX - mapSize.w / 2) / TILE_SIZE;
              const wy = cameraPosition.y + (mouseY - mapSize.h / 2) / TILE_SIZE;

              const NEW_TILE_SIZE = 32 * newZoom;
              const newCenterX = wx - (mouseX - mapSize.w / 2) / NEW_TILE_SIZE;
              const newCenterY = wy - (mouseY - mapSize.h / 2) / NEW_TILE_SIZE;

              setZoom(newZoom);
              setCameraPosition({ ...cameraPosition, x: newCenterX, y: newCenterY });
            }}
            onPan={(dx, dy) => {
              const TILE_SIZE = 32 * zoom;
              setCameraPosition((prev) => ({
                ...prev,
                x: prev.x - dx / TILE_SIZE,
                y: prev.y - dy / TILE_SIZE,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
