/* eslint-disable react/no-unknown-property, no-param-reassign */
import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createDie } from '../dice-loader/createDie';

// --- Types ---

import { DieType, DieVisualStyle } from '../dice-loader/types';

interface FallingDieProps {
  initialSpeed: number;
  rotationSpeed: [number, number, number];
  scale?: number;
  xPos: number; // Fixed X lane or random range center
  zPos: number; // Depth
  dieType: DieType;
  material: DieVisualStyle;
  color: string;
  visualOverrides?: {
    opacity?: number;
    roughness?: number;
    transmission?: number;
    metalness?: number;
    emissiveIntensity?: number;
    colorOffset?: number;
  };
  randomSeed: number; // For stable random generation logic inside component if needed
}

// --- Components ---

function FallingDie({
  initialSpeed,
  rotationSpeed,
  scale = 1,
  xPos,
  zPos,
  dieType,
  material,
  color,
  visualOverrides,
  randomSeed,
}: FallingDieProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Create a memoized die instance
  const die = useMemo(() => {
    // Basic die generation
    const dieGroup = createDie(dieType, color, material);

    // Apply instance-specific randomization to materials for "Storybook" variety
    dieGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Clone material to ensure unique instance properties
        if (child.material) {
          child.material = child.material.clone();
          const m = child.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

          // Apply overrides if present (deterministic)
          if (visualOverrides) {
            if (visualOverrides.opacity !== undefined) m.opacity = visualOverrides.opacity;
            if (visualOverrides.roughness !== undefined) m.roughness = visualOverrides.roughness;
            if (visualOverrides.transmission !== undefined && 'transmission' in m) {
              (m as THREE.MeshPhysicalMaterial).transmission = visualOverrides.transmission;
            }
            if (visualOverrides.metalness !== undefined) m.metalness = visualOverrides.metalness;
            if (visualOverrides.emissiveIntensity !== undefined) {
              m.emissiveIntensity = visualOverrides.emissiveIntensity;
            }
            if (visualOverrides.colorOffset !== undefined) {
              m.color.offsetHSL(0, 0, visualOverrides.colorOffset);
            }
          }
        }
      }
    });

    return dieGroup;
    return dieGroup;
  }, [dieType, color, material, visualOverrides]);

  useEffect(() => {
    const group = groupRef.current;
    if (group) {
      group.add(die);
    }
    return () => {
      if (group) {
        group.remove(die);
        // Dispose of unique materials to prevent leak
        die.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.dispose();
          }
        });
      }
    };
  }, [die]);

  // Use randomSeed to generate stable initial Y if needed, or just standard
  // To avoid Math.random inside useMemo for initialY, we process it outside or use a pseudorandom.
  // Actually, let's just use a simple derivation from seed for 'stable' initialY during this mount session
  // or pass it as prop. Let's assume passed prop xPos/zPos are handled, but Y needs to be random-ish per mount.
  // We can just use the randomSeed to derive it.
  const initialY = useMemo(() => (randomSeed % 40) + 10, [randomSeed]);

  // Mutable physics state
  const physicsState = useRef({
    x: xPos,
    y: initialY,
    z: zPos,
    velocity: initialSpeed,
    rotation: new THREE.Euler((randomSeed * 0.1) % Math.PI, (randomSeed * 0.2) % Math.PI, (randomSeed * 0.3) % Math.PI),
  });

  const { viewport } = useThree();
  // Gravity - stronger for faster fall
  const GRAVITY = 9.8 * 2.5;

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // 1. Update Velocity (v = u + at)
    physicsState.current.velocity += GRAVITY * delta;

    // 2. Update Position
    physicsState.current.y -= physicsState.current.velocity * delta;

    // 3. Update Rotation - Very fast chaotic spin
    const spinFactor = 1 + physicsState.current.velocity * 0.15;

    groupRef.current.rotation.x += rotationSpeed[0] * delta * spinFactor;
    groupRef.current.rotation.y += rotationSpeed[1] * delta * spinFactor;
    groupRef.current.rotation.z += rotationSpeed[2] * delta * spinFactor;

    // Reset logic
    const resetThreshold = -viewport.height / 2 - 5;
    const spawnHeight = viewport.height / 2 + 5;

    if (physicsState.current.y < resetThreshold) {
      // Reset Y to top
      physicsState.current.y = spawnHeight + Math.random() * 5; // impure but in usage, okay for animation loop

      // Reset Velocity
      physicsState.current.velocity = initialSpeed + Math.random() * 3;

      // Re-randomize X and Z to prevent boring patterns
      const newZ = -Math.random() * 20 - 10;
      physicsState.current.z = newZ;

      const spread = Math.abs(newZ - 10) * 0.8;
      physicsState.current.x = (Math.random() - 0.5) * spread * 2.5;
    }

    // Apply
    groupRef.current.position.set(physicsState.current.x, physicsState.current.y, physicsState.current.z);
  });

  return <group ref={groupRef} position={[xPos, initialY, zPos]} scale={scale} dispose={null} />;
}

function Scene() {
  const [diceConfig, setDiceConfig] = useState<FallingDieProps[]>([]);

  useEffect(() => {
    // Generate config once on mount
    const count = 35;
    const items: FallingDieProps[] = [];

    const types: DieType[] = [2, 4, 6, 8, 10, 12, 20, '20-ai'];
    const styles: DieVisualStyle[] = ['acrylic', 'metallic', 'glowing', 'stone', 'standard'];

    const colors = [
      '#d4af37', // Gold
      '#7a49d9', // Soft Purple
      '#d88416', // Orange/Amber
      '#2e1065', // Deep Indigo
      '#4c1d95', // Violet
      '#a855f7', // Bright Purple
      '#fbbf24', // Amber
      '#e0115f', // Ruby
      '#0f52ba', // Sapphire
      '#50c878', // Emerald
      '#9966cc', // Amethyst
      '#c0c0c0', // Silver
      '#cd7f32', // Bronze
      '#00ffff', // Neon Cyan
      '#ff00ff', // Neon Magenta
      '#4b0082', // Indigo
      '#008080', // Teal
      '#10b981', // Green
      '#f43f5e', // Rose
    ];

    for (let i = 0; i < count; i++) {
      const z = -Math.random() * 20 - 10;
      const spread = Math.abs(z - 10) * 0.8;
      const material = styles[Math.floor(Math.random() * styles.length)]!;

      const overrides: Record<string, number> = {};
      if (material === 'acrylic') {
        overrides.opacity = 0.6 + Math.random() * 0.35;
        overrides.roughness = 0.05 + Math.random() * 0.1;
        overrides.transmission = 0.8 + Math.random() * 0.15;
      } else if (material === 'metallic') {
        overrides.metalness = 0.8 + Math.random() * 0.2;
        overrides.roughness = 0.1 + Math.random() * 0.2;
      } else if (material === 'stone') {
        overrides.roughness = 0.8 + Math.random() * 0.2;
        overrides.colorOffset = (Math.random() - 0.5) * 0.1;
      } else if (material === 'glowing') {
        overrides.emissiveIntensity = 1.0 + Math.random() * 1.5;
      } else {
        overrides.roughness = 0.3 + Math.random() * 0.3;
        overrides.metalness = Math.random() * 0.3;
      }

      items.push({
        xPos: (Math.random() - 0.5) * spread * 2.5,
        zPos: z,
        initialSpeed: 4 + Math.random() * 4,
        rotationSpeed: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15],
        scale: 0.3 + Math.random() * 0.4,
        dieType: types[Math.floor(Math.random() * types.length)]!,
        material,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        visualOverrides: overrides,
        randomSeed: Math.random() * 10000,
      });
    }
    setTimeout(() => setDiceConfig(items), 0);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffd700" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#7a49d9" />

      {diceConfig.map((props, i) => (
        <FallingDie key={i} {...props} />
      ))}

      {/* Stronger Fog to fade distant dice */}
      <fog attach="fog" args={['#050205', 15, 50]} />
    </>
  );
}

export function BackgroundDiceField() {
  return (
    // FIXED positioning is critical here to prevent scroll reset
    // -z-50 ensures it is behind everything
    <div className="fixed inset-0 -z-50 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 1.5]} // Performance optimization
        gl={{ alpha: true, antialias: false }} // Disable antialias for background perf
      >
        <Scene />
      </Canvas>
      {/* Gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/30 via-midnight-950/10 to-midnight-950/80" />
    </div>
  );
}
