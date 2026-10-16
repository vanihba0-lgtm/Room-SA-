import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { Text } from '@react-three/drei';

interface PowerMechanism3DProps {
  isEngaged: boolean;
  onTargetHover?: (targetId: string | null) => void;
}

export const PowerMechanism3D: React.FC<PowerMechanism3DProps> = ({
  isEngaged,
  onTargetHover,
}) => {
  const leverRef = useRef<Group>(null);
  const conduitGlowRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (leverRef.current) {
      const targetRot = isEngaged ? -0.7 : 0.7;
      leverRef.current.rotation.x +=
        (targetRot - leverRef.current.rotation.x) * Math.min(delta * 8, 1);
    }
    if (conduitGlowRef.current) {
      const targetIntensity = isEngaged ? 2.5 : 0.6;
      const mat = conduitGlowRef.current.material as MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity +=
          (targetIntensity - mat.emissiveIntensity) * Math.min(delta * 5, 1);
      }
    }
  });

  const activeColor = isEngaged ? '#38bdf8' : '#0284c7';

  return (
    <group
      position={[-5.85, 1.8, 1.5]}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ interactableId: 'power_regulator' }}
      onPointerOver={() => onTargetHover?.('power_regulator')}
      onPointerOut={() => onTargetHover?.(null)}
    >
      {/* Breaker Box Chassis */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.5, 0.25]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Recessed Panel Face */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[0.95, 1.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Title Header */}
      <Text
        position={[0, 0.55, 0.14]}
        fontSize={0.045}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        SUBSTRATE POWER REGULATOR
      </Text>

      {/* Voltage Meter Dial Gauge */}
      <group position={[0, 0.28, 0.14]}>
        <mesh>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <ringGeometry args={[0.18, 0.19, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Gauge Needle */}
        <mesh
          position={[0, 0, 0.01]}
          rotation={[0, 0, isEngaged ? -0.8 : 0.8]}
        >
          <planeGeometry args={[0.02, 0.18]} />
          <meshBasicMaterial color={isEngaged ? '#10b981' : '#f59e0b'} />
        </mesh>
      </group>

      {/* High-Voltage Conduit Tube running up wall */}
      <mesh ref={conduitGlowRef} position={[0, 1.1, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={isEngaged ? 2.5 : 0.6}
        />
      </mesh>
      <pointLight
        position={[0, 0.5, 0.3]}
        color={activeColor}
        intensity={isEngaged ? 1.2 : 0.4}
        distance={2}
      />

      {/* Heavy Lever Assembly */}
      <group position={[0, -0.25, 0.14]}>
        {/* Pivot Hub */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Rotating Lever Arm */}
        <group ref={leverRef} position={[0, 0, 0]}>
          <mesh position={[0, 0.18, 0.05]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.35, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Insulated Handle Grip */}
          <mesh position={[0, 0.35, 0.12]}>
            <cylinderGeometry args={[0.05, 0.05, 0.14, 16]} />
            <meshStandardMaterial
              color={isEngaged ? '#10b981' : '#ef4444'}
              emissive={isEngaged ? '#059669' : '#dc2626'}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      </group>

      {/* Status Readout Text */}
      <Text
        position={[0, -0.52, 0.14]}
        fontSize={0.038}
        color={isEngaged ? '#34d399' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {isEngaged
          ? '[ENGAGED // LOGIC BUS ACTIVE]'
          : '[STANDBY // CLICK TO TOGGLE]'}
      </Text>
    </group>
  );
};
