import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Text, Float } from '@react-three/drei';

interface MovableCore3DProps {
  id: string;
  name: string;
  mass: number;
  frequency: number;
  color: string;
  position: [number, number, number];
  isCarried: boolean;
  placedOnPlateId?: string | null;
}

export const MovableCore3D: React.FC<MovableCore3DProps> = ({
  id,
  name,
  mass,
  frequency,
  color,
  position,
  isCarried,
  placedOnPlateId,
}) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  // Determine actual 3D position
  let actualPos: [number, number, number] = position;
  if (placedOnPlateId === 'plate_mass') {
    actualPos = [-2.2, 0.45, -3.2];
  } else if (placedOnPlateId === 'plate_harmonic') {
    actualPos = [2.2, 0.45, -3.2];
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current && id === 'core_resonance') {
      // Harmonic core gently rotates and pulses
      meshRef.current.rotation.y = t * 1.2;
      meshRef.current.rotation.z = Math.sin(t * 2) * 0.15;
    }
  });

  // If carried, it will be rendered in the player's view or HUD, so hide from world
  if (isCarried) {
    return null;
  }

  const isResonance = id === 'core_resonance';

  return (
    <group ref={groupRef} position={actualPos} userData={{ interactableId: id }}>
      {/* Visual Core Object */}
      {isResonance ? (
        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.3}>
          {/* Inner Resonant Crystal Sphere */}
          <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
            <octahedronGeometry args={[0.35, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>

          {/* Outer Gyroscopic Retaining Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.48, 0.03, 16, 32]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Pedestal Base Ring */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        </Float>
      ) : (
        /* Heavy Industrial Flux Core */
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.45, 0.65, 8]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>

          {/* Amber Energy Core Band */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.4}
              roughness={0.3}
            />
          </mesh>

          {/* Top Heavy Lifting Lug */}
          <mesh position={[0, 0.38, 0]}>
            <torusGeometry args={[0.12, 0.035, 12, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Floating Holographic Specification Tag */}
      <group position={[0, 0.65, 0]}>
        <Text
          fontSize={0.12}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#090d16"
        >
          {`${name.toUpperCase()}\n[ ${mass} KG // ${frequency} kHz ]`}
        </Text>
      </group>
    </group>
  );
};
