/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Coordinates, Chunk, ZLevel } from '../utils/types';

interface ChunkProvider {
  getChunk: (x: number, y: number) => Chunk | null | undefined;
}

interface MapRenderer3DProps {
  width: number;
  height: number;
  center: Coordinates;
  viewZ: number;
  chunkProvider: ChunkProvider;
  visibleTiles: Set<string>;
  exploredTiles: Set<string>;
  entities: { position: { x: number; y: number; z: number }; color: string }[];
  ghostEntities?: unknown[];
  onTileClick: (coords: Coordinates, e: React.MouseEvent) => void;
  onTileDoubleClick?: (coords: Coordinates) => void;
  onTileHover: (coords: Coordinates | null) => void;
  onCenterChange?: (newCenter: Coordinates) => void; // New prop
  previewPath?: Coordinates[] | null | undefined;
  isLive?: boolean;
}

// Component to sync Camera movement back to parent
function CameraSync({
  onCenterChange,
  sysCenter,
}: {
  onCenterChange?: (c: Coordinates) => void;
  sysCenter: Coordinates;
}) {
  const controlsRef = useRef<CameraControls>(null);

  // Sync external center change to camera target (if drastic?)
  // Actually, we want the camera to FOLLOW internal controls, but REPORT to parent.
  // Parent update -> moves mesh generation center -> renders new meshes.

  return (
    <CameraControls
      ref={controlsRef}
      minZoom={20}
      maxZoom={100}
      onEnd={() => {
        // Update on interaction end (drag release) to avoid perf hit
        if (!controlsRef.current || !onCenterChange) return;
        const target = new THREE.Vector3();
        controlsRef.current.getTarget(target);

        // Map 3D target back to Tile Coordinates
        // In MapScene: posX = wx, posZ = -wy.
        // So wx = target.x, wy = -target.z

        onCenterChange({
          x: Math.round(target.x),
          y: Math.round(-target.z),
          z: sysCenter.z,
        });
      }}
    />
  );
}

// ... existing MapScene ...
// Internal scene component to handle gameplay logic
// eslint-disable-next-line react/function-component-definition
const MapScene = ({
  center,
  viewZ,
  chunkProvider,
  visibleTiles,
  exploredTiles,
  onTileClick,
  onTileHover,
  entities,
}: Omit<MapRenderer3DProps, 'width' | 'height' | 'onCenterChange'>) => {
  // ... existing implementation ...
  const groupRef = useRef<THREE.Group>(null);

  // Constants
  const TILE_SIZE = 1;
  const TILE_HEIGHT_SCALE = 0.5; // Max additional height from elevation
  const VIEW_RADIUS = 20; // How many tiles to render around center

  // Helper to get color
  const getBlockColor = (block: string, moisture: number = 0): string => {
    switch (block) {
      case 'water':
        return '#1e3a8a';
      case 'grass':
        return moisture > 0.6 ? '#14532d' : '#15803d'; // Darker if wet
      case 'stone':
        return '#44403c';
      case 'sand':
        return '#d97706';
      case 'snow':
        return '#e5e7eb';
      case 'stairs_up':
        return '#22d3ee';
      case 'stairs_down':
        return '#d946ef';
      case 'lava':
        return '#ef4444';
      case 'bedrock':
        return '#18181b';
      case 'door':
        return '#854d0e';
      default:
        if (block.startsWith('wall')) return '#78716c';
        if (block.startsWith('floor')) return '#57534e';
        return '#ff00ff'; // Error pink
    }
  };

  // Generate meshes
  const meshes = useMemo(() => {
    const items: JSX.Element[] = [];
    const startX = Math.floor(center.x - VIEW_RADIUS);
    const endX = Math.ceil(center.x + VIEW_RADIUS);
    const startY = Math.floor(center.y - VIEW_RADIUS);
    const endY = Math.ceil(center.y + VIEW_RADIUS);

    for (let wy = startY; wy <= endY; wy++) {
      for (let wx = startX; wx <= endX; wx++) {
        const key = `${wx},${wy}`;
        // Skip if completely unknown (unless we want to verify layout)
        const isGodMode = exploredTiles.size === 0;
        const isExplored = exploredTiles.has(key) || isGodMode;
        const isVisible = visibleTiles.has(key) || isGodMode;

        if (!isExplored && !isGodMode && !isVisible) continue;

        const chunkX = Math.floor(wx / 32); // Assuming 32 chunk size
        const chunkY = Math.floor(wy / 32);
        const chunk = chunkProvider.getChunk(chunkX, chunkY);

        if (!chunk) {
          continue;
        }

        const lx = ((wx % 32) + 32) % 32;
        const ly = ((wy % 32) + 32) % 32;
        // Map engine Z (-3..3) to array index (0..6)
        const lz = viewZ + 3;

        if (!chunk.tiles?.[lz]?.[ly]) continue;
        const tile = chunk.tiles[lz][ly][lx];
        if (!tile) continue;

        // Visual Props
        // Only use elevation if defined, else 0
        const elevation = tile.elevation || 0;
        // Base height: 0.2 (floor) + elevation * scale
        // Wall height: 1.0 + elevation * scale
        const isWall = tile.block.startsWith('wall') || tile.block === 'tree_leaves' || tile.block === 'cactus';
        const height = isWall ? 1.0 : 0.2 + elevation * TILE_HEIGHT_SCALE;

        // Position: world coordinates centered
        // Y in 3D is Up. We map Tile Y to 3D Z? Or Tile Y to 3D Y?
        // Isometric Standard: Y is Up. X is Right, Z is Depth.
        // Map X -> 3D X
        // Map Y -> 3D Z (reversed? standard is +Z towards user)
        // Let's use X -> X, Y -> -Z.
        const posX = wx;
        const posZ = -wy;
        const posY = height / 2; // Center box on Y=0 plane vertically? No, sit on floor.

        const color = getBlockColor(tile.block, tile.moisture);

        // Fog Logic
        const opacity = isVisible ? 1.0 : 0.4;
        const transparent = !isVisible;
        const materialColor = isVisible ? color : '#3f3f46'; // Grey out if fog

        items.push(
          <mesh
            key={key}
            position={[posX, posY, posZ]}
            userData={{ coords: { x: wx, y: wy, z: viewZ } }}
            onClick={(e) => {
              e.stopPropagation();
              onTileClick({ x: wx, y: wy, z: viewZ as ZLevel }, e as unknown as React.MouseEvent);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onTileHover({ x: wx, y: wy, z: viewZ as ZLevel });
            }}
          >
            <boxGeometry args={[TILE_SIZE * 0.95, height, TILE_SIZE * 0.95]} />
            <meshStandardMaterial color={materialColor} transparent={transparent} opacity={opacity} />
          </mesh>
        );

        // "Moisture Details" - simple spheres for bushes if wet & grass
        if (tile.moisture && tile.moisture > 0.6 && tile.block === 'grass' && isVisible) {
          items.push(
            <mesh key={`${key}-bio`} position={[posX, height, posZ]}>
              <sphereGeometry args={[0.2, 4, 4]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
          );
        }
      }
    }
    return items;
  }, [center, viewZ, chunkProvider, visibleTiles, exploredTiles, onTileClick, onTileHover]);

  return (
    <group ref={groupRef}>
      {meshes}

      {/* Entities */}
      {entities.map((ent, i: number) => {
        if (ent.position.z !== viewZ) return null;
        return (
          <mesh key={`ent-${i}`} position={[ent.position.x, 1.5, -ent.position.y]}>
            <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
            <meshStandardMaterial color={ent.color} emissive={ent.color} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

export function MapRenderer3D(props: MapRenderer3DProps) {
  const { width, height, center, onCenterChange } = props;
  return (
    <div style={{ width, height }}>
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera
          makeDefault
          position={[20, 20, 20]}
          zoom={40}
          near={-100}
          far={200}
          onUpdate={(c) => c.lookAt(0, 0, 0)} // Initial lookat
        />

        <CameraSync onCenterChange={onCenterChange} sysCenter={center} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 5]} intensity={1.2} castShadow />

        <MapScene {...props} />
      </Canvas>
    </div>
  );
}
