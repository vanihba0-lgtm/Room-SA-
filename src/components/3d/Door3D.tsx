import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface Door3DProps {
  isLocked: boolean;
  isDeceptiveRule: boolean;
  onTargetHover?: (targetId: string | null) => void;
}

export const Door3D: React.FC<Door3DProps> = ({
  isLocked,
  isDeceptiveRule,
  onTargetHover,
}) => {
  const leftDoorRef = useRef<Mesh>(null);
  const rightDoorRef = useRef<Mesh>(null);
  const hydraulicPistonRef = useRef<Mesh>(null);
  const lightRef = useRef<Mesh>(null);

  // Smooth door opening animation
  useFrame((_, delta) => {
    const targetOffset = isLocked ? 0 : 1.35;
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x +=
        (-targetOffset - leftDoorRef.current.position.x) * Math.min(delta * 4, 1);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x +=
        (targetOffset - rightDoorRef.current.position.x) * Math.min(delta * 4, 1);
    }
    if (hydraulicPistonRef.current) {
      const pistonScale = isLocked ? 1.0 : 0.2;
      hydraulicPistonRef.current.scale.y +=
        (pistonScale - hydraulicPistonRef.current.scale.y) * Math.min(delta * 4, 1);
    }
  });

  const sensorColor = isLocked
    ? isDeceptiveRule
      ? '#ff5533' // Red/amber locked
      : '#f59e0b' // Ready for brass key
    : '#10b981'; // Unlocked emerald

  const statusText = isLocked
    ? isDeceptiveRule
      ? 'SEALED // COPPER ONLY'
      : 'AUTHENTICATED // READY'
    : 'DISENGAGED // CLEAR';

  return (
    <group position={[0, 0, -5.9]} userData={{ interactableId: 'exit_door' }}>
      {/* Door Frame Archway */}
      {/* Left Pillar */}
      <mesh position={[-1.75, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 0.6]} />
        <meshStandardMaterial color="#1a202c" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[1.75, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 0.6]} />
        <meshStandardMaterial color="#1a202c" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Top Lintel Beam */}
      <mesh position={[0, 4.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.4, 0.7]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Hazard Warning Stripe Header */}
      <mesh position={[0, 3.8, 0.36]}>
        <planeGeometry args={[3, 0.15]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Hydraulic Cylinders on top */}
      <mesh position={[-1, 3.9, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1, 3.9, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Left Sliding Door Leaf */}
      <mesh
        ref={leftDoorRef}
        position={[-0.7, 1.9, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => onTargetHover?.('exit_door')}
        onPointerOut={() => onTargetHover?.(null)}
      >
        <boxGeometry args={[1.4, 3.7, 0.18]} />
        <meshStandardMaterial color="#242e3d" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Right Sliding Door Leaf */}
      <mesh
        ref={rightDoorRef}
        position={[0.7, 1.9, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => onTargetHover?.('exit_door')}
        onPointerOut={() => onTargetHover?.(null)}
      >
        <boxGeometry args={[1.4, 3.7, 0.18]} />
        <meshStandardMaterial color="#242e3d" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Lock Console Plaque / Scanner Panel */}
      <group position={[0, 1.9, 0.12]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.5, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Status Light Indicator */}
        <mesh ref={lightRef} position={[0, 0.12, 0.05]}>
          <boxGeometry args={[0.7, 0.1, 0.02]} />
          <meshStandardMaterial
            color={sensorColor}
            emissive={sensorColor}
            emissiveIntensity={1.8}
            roughness={0.1}
          />
        </mesh>
        <pointLight
          position={[0, 0.12, 0.3]}
          color={sensorColor}
          intensity={0.8}
          distance={3}
        />

        {/* Text on Lock Plaque */}
        <Text
          position={[0, -0.06, 0.05]}
          fontSize={0.055}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          {statusText}
        </Text>
      </group>

      {/* Beyond the Door: Chamber 102 Exit Corridor glow */}
      {!isLocked && (
        <group position={[0, 2, -1.5]}>
          <pointLight color="#38bdf8" intensity={2} distance={6} />
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[3, 4]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
        </group>
      )}
    </group>
  );
};
