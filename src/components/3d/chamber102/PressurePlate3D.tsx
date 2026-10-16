import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface PressurePlate3DProps {
  id: string;
  name: string;
  label: string;
  position: [number, number, number];
  isDepressed: boolean;
  satisfied: boolean;
  currentObjectName?: string | null;
}

export const PressurePlate3D: React.FC<PressurePlate3DProps> = ({
  id,
  name,
  label,
  position,
  isDepressed,
  satisfied,
  currentObjectName,
}) => {
  const plateMeshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    // Smooth depression animation
    const targetY = isDepressed ? 0.02 : 0.08;
    if (plateMeshRef.current) {
      plateMeshRef.current.position.y += (targetY - plateMeshRef.current.position.y) * Math.min(delta * 8, 1);
    }
  });

  const glowColor = satisfied
    ? '#10b981' // Solved green
    : isDepressed
    ? '#f59e0b' // Depressed but unsatisfied (amber)
    : id === 'plate_harmonic'
    ? '#8b5cf6' // Transceiver standby violet
    : '#0ea5e9'; // Standby cyan

  return (
    <group position={position} userData={{ interactableId: id }}>
      {/* Outer Heavy Steel Housing Ring */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[1.25, 1.3, 0.06, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Illuminated LED Ring Channel */}
      <mesh position={[0, 0.035, 0]}>
        <ringGeometry args={[1.05, 1.15, 32]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={satisfied ? 2.5 : isDepressed ? 1.6 : 0.8}
        />
      </mesh>

      {/* Depressible Center Pad */}
      <mesh ref={plateMeshRef} position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.08, 32]} />
        <meshStandardMaterial
          color={isDepressed ? '#111827' : '#1e293b'}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Plate Holographic / Text Label */}
      <group position={[0, 0.15, 0.95]} rotation={[-Math.PI / 4, 0, 0]}>
        <Text
          fontSize={0.12}
          color={glowColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {`${name.toUpperCase()}\n${label}`}
        </Text>
      </group>

      {/* Dynamic Status Display Above Plate */}
      <group position={[0, 0.65, 0]}>
        <Text
          fontSize={0.14}
          color={glowColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#0f172a"
        >
          {currentObjectName
            ? `[ ${currentObjectName.toUpperCase()} ]`
            : '[ VACANT // AWAITING SPECIMEN ]'}
        </Text>
      </group>
    </group>
  );
};
