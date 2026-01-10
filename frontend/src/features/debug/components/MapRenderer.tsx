import React, { useRef, useEffect } from 'react';
import type { Coordinates, Chunk, ZLevel } from '../utils/types';

interface ChunkProvider {
  getChunk: (x: number, y: number) => Chunk | null | undefined;
}

interface MapRendererProps {
  width: number;
  height: number;
  center: Coordinates;
  viewZ: number;
  scale: number;
  chunkProvider: ChunkProvider; // Changed from generator to interface
  visibleTiles: Set<string>;
  exploredTiles: Set<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entities: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ghostEntities?: any[];
  onTileClick: (coords: Coordinates, e: React.MouseEvent) => void;
  onTileDoubleClick?: (coords: Coordinates) => void;
  onTileHover: (coords: Coordinates | null) => void;
  previewPath?: Coordinates[] | null | undefined;
  isLive?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentTimeFrame?: any;
  onZoom?: (delta: number, mouseX: number, mouseY: number) => void;
  onPan?: (dx: number, dy: number) => void;
  restrictView?: boolean;
  godMode?: boolean;
  lightLevel?: number; // 0 to 1
}

export function MapRenderer({
  width,
  height,
  center,
  viewZ,
  scale,
  chunkProvider,
  visibleTiles,
  exploredTiles,
  entities,
  ghostEntities = [],
  onTileClick,
  onTileDoubleClick,
  onTileHover,
  isLive = true,
  currentTimeFrame = null,
  previewPath,
  onZoom,
  onPan,
  restrictView = false,
  godMode = false,
  lightLevel = 1.0,
}: MapRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Timer for single/double click differentiation
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = React.useState(false);

  // Drag state
  const isDownRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Use provided entities if live, or timeFrame entities if in history
  const renderEntities = !isLive && currentTimeFrame ? currentTimeFrame.gameState.entities : entities;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!ctx) return;
    console.info(
      'MapRenderer Debug: Rendering started. Size:',
      width,
      'x',
      height,
      'center:',
      center,
      'viewZ:',
      viewZ,
      'scale:',
      scale
    );

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // DEBUG: Draw giant red cross to verify canvas is viewing
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    const TILE_SIZE = 32 * scale;
    const VIEW_W = Math.ceil(width / TILE_SIZE);
    const VIEW_H = Math.ceil(height / TILE_SIZE);
    const HALF_W = Math.floor(VIEW_W / 2);
    const HALF_H = Math.floor(VIEW_H / 2);

    // Calculate visible tile bounds (integer coordinates)
    const startX = Math.floor(center.x - HALF_W - 1);
    const endX = Math.ceil(center.x + HALF_W + 1);
    const startY = Math.floor(center.y - HALF_H - 1);
    const endY = Math.ceil(center.y + HALF_H + 1);

    // Draw Map
    for (let wy = startY; wy <= endY; wy++) {
      for (let wx = startX; wx <= endX; wx++) {
        const key = `${wx},${wy}`;

        const isExplored = exploredTiles.has(key);
        const isVisible = visibleTiles.has(key);

        // Visibility Check
        if (!godMode) {
          if ((restrictView && !isExplored && !isVisible) || (!isExplored && !isVisible && exploredTiles.size > 0)) {
            // Unexplored (Fog of War)
            continue;
          }
        }

        // Get Tile Type
        const chunkX = Math.floor(wx / 32);
        const chunkY = Math.floor(wy / 32);
        const chunk = chunkProvider.getChunk(chunkX, chunkY);
        // Debug: Log first chunk found to verify structure
        if (chunk && wx === center.x && wy === center.y) {
          console.info('MapRenderer Debug: Center Chunk:', chunk);
          console.info('MapRenderer Debug: Chunk Tiles Z=3:', chunk.tiles[3]);
        } else if (!chunk && wx === center.x && wy === center.y) {
          console.info('MapRenderer Debug: MISSING Center Chunk at', chunkX, chunkY);
        }

        const lx = ((wx % 32) + 32) % 32;
        const ly = ((wy % 32) + 32) % 32;
        const lz = viewZ + 3; // map -3..3 to 0..6

        if (!chunk || !chunk.tiles?.[lz]?.[ly]) continue;
        const tile = chunk.tiles[lz][ly][lx];
        if (!tile) continue;

        // Draw Tile
        let color = '#222';
        // Simple visualization
        if (tile.block === 'water') color = '#1e3a8a';
        else if (tile.block === 'grass') color = '#14532d';
        else if (tile.block === 'stone') color = '#44403c';
        else if (tile.block === 'sand') color = '#d97706';
        else if (tile.block === 'snow') color = '#e5e7eb';
        else if (tile.block === 'stairs_up') color = '#22d3ee';
        else if (tile.block === 'stairs_down') color = '#d946ef';

        // Structures
        if (tile.block.startsWith('wall')) color = '#78716c';
        if (tile.block.startsWith('floor')) color = '#57534e';
        if (tile.block.includes('door')) color = '#854d0e';

        if (wx === 0 && wy === 0) {
          console.info('MapRenderer Debug: Drawing tile 0,0', tile, 'color:', color);
        }

        ctx.fillStyle = color;
        // Calculate screen position
        const screenX = (wx - center.x) * TILE_SIZE + width / 2 - TILE_SIZE / 2;
        const screenY = (wy - center.y) * TILE_SIZE + height / 2 - TILE_SIZE / 2;

        if (wx === 0 && wy === 0) {
          console.info('MapRenderer Debug: Tile 0,0 coords:', { screenX, screenY, TILE_SIZE });
        }

        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

        // Fog Overlay (Explored but not visible)
        if (!isVisible && isExplored && !godMode) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }

        // Light Level Overlay (Night)
        // If God Mode, maybe skip? No, user might want to see Night effect.
        // But God Mode usually implies "See All".
        // Let's assume passed lightLevel accounts for "Night Vision" override.
        if (lightLevel < 1.0) {
          const darkness = 1.0 - lightLevel;
          // Cap max darkness to avoid pitch black? 0.8?
          // If lightLevel is 0.2, darkness is 0.8.
          ctx.fillStyle = `rgba(0,0,10,${darkness})`; // Blueish tint for night
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw Preview Path
    if (previewPath && previewPath.length > 0) {
      ctx.strokeStyle = '#fbbf24'; // Amber-400
      ctx.lineWidth = 3 * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([5 * scale, 5 * scale]); // Dashed line

      ctx.beginPath();
      let first = true;
      for (const pt of previewPath) {
        // Only draw if on same Z
        if (pt.z !== viewZ) continue; // Or draw ghost?

        const valX = (pt.x - center.x) * TILE_SIZE + width / 2;
        const valY = (pt.y - center.y) * TILE_SIZE + height / 2;

        if (first) {
          ctx.moveTo(valX, valY);
          first = false;
        } else {
          ctx.lineTo(valX, valY);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset
    }

    // Draw Entities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderEntities.forEach((ent: any) => {
      // Only if on same Z level
      if (ent.position.z !== viewZ) return;

      const screenX = (ent.position.x - center.x) * TILE_SIZE + width / 2;
      const screenY = (ent.position.y - center.y) * TILE_SIZE + height / 2;

      ctx.fillStyle = ent.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, TILE_SIZE * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Stroke for active?
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Ghost Entities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ghostEntities.forEach((ent: any) => {
      if (ent.position.z !== viewZ) return;

      const screenX = (ent.position.x - center.x) * TILE_SIZE + width / 2;
      const screenY = (ent.position.y - center.y) * TILE_SIZE + height / 2;

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = ent.color || '#eab308';
      ctx.beginPath();
      ctx.arc(screenX, screenY, TILE_SIZE * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    });
  }, [
    width,
    height,
    center,
    viewZ,
    scale,
    chunkProvider,
    visibleTiles,
    exploredTiles,
    renderEntities,
    ghostEntities,
    previewPath,
    restrictView,
  ]);

  const getTileCoords = (e: React.MouseEvent): Coordinates => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const TILE_SIZE = 32 * scale;
    const tileX = Math.floor(center.x + (x - width / 2) / TILE_SIZE + 0.5);
    const tileY = Math.floor(center.y + (y - height / 2) / TILE_SIZE + 0.5);

    return { x: tileX, y: tileY, z: viewZ as ZLevel };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDownRef.current = true;
    setIsDragging(true);
    isPanningRef.current = false;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (_e: React.MouseEvent) => {
    isDownRef.current = false;
    setIsDragging(false);
    // Don't need to do anything else, handleClick uses isPanningRef
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDownRef.current) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;

      // Check threshold if not yet panning
      if (!isPanningRef.current) {
        const dist = Math.sqrt((e.clientX - startPosRef.current.x) ** 2 + (e.clientY - startPosRef.current.y) ** 2);
        if (dist > 5) {
          isPanningRef.current = true;
        }
      }

      if (isPanningRef.current) {
        onPan?.(dx, dy);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        return; // Skip hover updates while panning
      }
    }

    if (onTileHover && !isPanningRef.current) {
      onTileHover(getTileCoords(e));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If we were panning, ignore click
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    // Determine single or double click
    const coords = getTileCoords(e);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onTileDoubleClick?.(coords);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        onTileClick(coords, e);
        clickTimeoutRef.current = null;
      }, 250); // 250ms delay to wait for potential double click
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (onZoom) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Simple normalizing of delta
      const delta = Math.sign(e.deltaY);
      onZoom(delta, x, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={(_e) => {
        isDownRef.current = false;
        setIsDragging(false);
        onTileHover?.(null);
      }}
      onWheel={handleWheel}
      // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
      role="application"
      aria-label="Game Map"
      className={`block touch-none bg-pink-500 ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
    />
  );
}
