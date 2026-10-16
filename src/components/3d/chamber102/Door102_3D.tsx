import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface Door102_3DProps {
  isLocked: boolean;
  plateMassSatisfied: boolean;
  plateHarmonicSatisfied: boolean;
}

export const Door102_3D: React.FC<Door102_3DProps> = ({
  isLocked,
  plateMassSatisfied,
  plateHarmonicSatisfied,
}) => {
  const leftDoorRef = useRef<Mesh>(null);
  const rightDoorRef = useRef<Mesh>(null);
  const clampLeftRef = useRef<Mesh>(null);
  const clampRightRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const targetOffset = isLocked ? 0 : 1.5;
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x +=
        (-targetOffset - leftDoorRef.current.position.x) * Math.min(delta * 4, 1);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x +=
        (targetOffset - rightDoorRef.current.position.x) * Math.min(delta * 4, 1);
    }

    if (clampLeftRef.current) {
      const clampTarget = plateMassSatisfied ? 0.2 : 0.0;
      clampLeftRef.current.position.y +=
        (clampTarget - clampLeftRef.current.position.y) * Math.min(delta * 4, 1);
    }

    if (clampRightRef.current) {
      const clampTarget = plateHarmonicSatisfied ? 0.2 : 0.0;
      clampRightRef.current.position.y +=
        (clampTarget - clampRightRef.current.position.y) * Math.min(delta * 4, 1);
    }
  });

  const statusColor = isLocked ? '#ef4444' : '#10b981';

  return (
    <group position={[0, 0, -6.6]} userData={{ interactableId: 'exit_door_102' }}>
      {/* Archway Frame */}
      <mesh position={[-2.0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 4.4, 0.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[2.0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 4.4, 0.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 4.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 0.5, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Status Light Bar Overhead */}
      <mesh position={[0, 4.15, 0.42]}>
        <boxGeometry args={[3.2, 0.12, 0.08]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isLocked ? 1.2 : 2.5}
        />
      </mesh>

      {/* Left Lock Status Piston */}
      <group position={[-1.6, 2.2, 0.4]} ref={clampLeftRef}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial
            color={plateMassSatisfied ? '#10b981' : '#f59e0b'}
            emissive={plateMassSatisfied ? '#10b981' : '#f59e0b'}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Right Lock Status Piston */}
      <group position={[1.6, 2.2, 0.4]} ref={clampRightRef}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial
            color={plateHarmonicSatisfied ? '#10b981' : '#8b5cf6'}
            emissive={plateHarmonicSatisfied ? '#10b981' : '#8b5cf6'}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Left Sliding Blast Door Slab */}
      <mesh ref={leftDoorRef} position={[0, 2.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 4.0, 0.25]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Right Sliding Blast Door Slab */}
      <mesh ref={rightDoorRef} position={[0, 2.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 4.0, 0.25]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Status Display Text */}
      <group position={[0, 3.8, 0.45]}>
        <Text
          fontSize={0.11}
          color={statusColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {isLocked
            ? 'SEALED // DUAL HYDRAULIC INTERLOCK'
            : 'DISENGAGED // FACILITY EXIT AUTHORIZED'}
        </Text>
      </group>

      {/* Portal Light Beaming Through Door When Unlocked */}
      {!isLocked && (
        <pointLight position={[0, 2.0, -0.5]} intensity={4.0} distance={10} color="#10b981" />
      )}
    </group>
  );
};
