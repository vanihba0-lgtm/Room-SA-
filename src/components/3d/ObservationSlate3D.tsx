import React from 'react';
import { Text } from '@react-three/drei';

interface ObservationSlate3DProps {
  onTargetHover?: (targetId: string | null) => void;
}

export const ObservationSlate3D: React.FC<ObservationSlate3DProps> = ({
  onTargetHover,
}) => {
  return (
    <group
      position={[-5.85, 1.8, -1.5]}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ interactableId: 'observation_slate' }}
      onPointerOver={() => onTargetHover?.('observation_slate')}
      onPointerOut={() => onTargetHover?.(null)}
    >
      {/* Magnetic Wall Mount Bracket */}
      <mesh position={[0, 0, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.6, 0.04]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.6} metalness={0.7} />
      </mesh>

      {/* Titanium Magnetic Slate */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[1.15, 1.45, 0.03]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Amber Clip at the top */}
      <mesh position={[0, 0.65, 0.05]}>
        <boxGeometry args={[0.35, 0.1, 0.05]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#b45309"
          emissiveIntensity={1.2}
          metalness={0.8}
        />
      </mesh>

      {/* Subtle reading illumination light */}
      <pointLight position={[0, 0.5, 0.25]} color="#fde68a" intensity={0.6} distance={1.8} />

      {/* Engraved Handwriting / Warning Text */}
      <Text
        position={[0, 0.45, 0.045]}
        fontSize={0.05}
        color="#fef08a"
        anchorX="center"
        anchorY="top"
      >
        // LOG ENTRY — OCCUPANT #04
      </Text>

      <Text
        position={[-0.48, 0.3, 0.045]}
        fontSize={0.038}
        maxWidth={0.96}
        lineHeight={1.4}
        color="#e2e8f0"
        anchorX="left"
        anchorY="top"
      >
        "The previous occupant spent months trying to transmute copper. They starved waiting for an impossible alloy.\n\nThey died without realizing the anomaly terminal accepts logic overrides. The chamber's physical laws are programmed.\n\nTHE ROOM IS LYING."
      </Text>

      {/* Red stamp */}
      <Text
        position={[0.25, -0.45, 0.046]}
        fontSize={0.048}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, -0.15]}
      >
        [CLASSIFIED]
      </Text>
    </group>
  );
};
