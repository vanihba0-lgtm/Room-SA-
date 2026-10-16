import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Float, Sparkles } from '@react-three/drei';

interface Pedestal3DProps {
  hasKey: boolean;
  onTargetHover?: (targetId: string | null) => void;
}

export const Pedestal3D: React.FC<Pedestal3DProps> = ({
  hasKey,
  onTargetHover,
}) => {
  const keyGroupRef = useRef<Group>(null);
  const ringLightRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (keyGroupRef.current && !hasKey) {
      keyGroupRef.current.rotation.y += delta * 1.2;
    }
    if (ringLightRef.current) {
      ringLightRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      userData={{ interactableId: 'pedestal' }}
      onPointerOver={() => onTargetHover?.('pedestal')}
      onPointerOut={() => onTargetHover?.(null)}
    >
      {/* Octagonal Base Plinth */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.2, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Main Pedestal Column */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.55, 1.0, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top Cradle Plate */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.45, 0.1, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Glowing Neon Energy Ring around the rim */}
      <mesh ref={ringLightRef} position={[0, 1.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.02, 16, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={2.5}
        />
      </mesh>
      <pointLight position={[0, 1.35, 0]} color="#38bdf8" intensity={0.5} distance={2} />

      {/* Overhead Spot Beam directly on the pedestal */}
      <spotLight
        position={[0, 4.8, 0]}
        target-position={[0, 1.2, 0]}
        color="#fbbf24"
        intensity={3}
        angle={0.35}
        penumbra={0.6}
        distance={6}
      />

      {/* The Floating Brass Key (if not yet collected) */}
      {!hasKey && (
        <group position={[0, 1.55, 0]}>
          <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.3}>
            <group ref={keyGroupRef} scale={1.2}>
              {/* Key Ring / Bow */}
              <mesh position={[0, 0.18, 0]} castShadow>
                <torusGeometry args={[0.1, 0.028, 16, 24]} />
                <meshStandardMaterial
                  color="#eab308"
                  emissive="#78350f"
                  emissiveIntensity={0.4}
                  metalness={0.92}
                  roughness={0.18}
                />
              </mesh>

              {/* Key Shaft */}
              <mesh position={[0, -0.05, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.28, 16]} />
                <meshStandardMaterial
                  color="#eab308"
                  metalness={0.92}
                  roughness={0.18}
                />
              </mesh>

              {/* Key Bit / Teeth */}
              <mesh position={[0.045, -0.14, 0]} castShadow>
                <boxGeometry args={[0.07, 0.04, 0.025]} />
                <meshStandardMaterial
                  color="#eab308"
                  metalness={0.92}
                  roughness={0.18}
                />
              </mesh>
              <mesh position={[0.035, -0.07, 0]} castShadow>
                <boxGeometry args={[0.05, 0.03, 0.025]} />
                <meshStandardMaterial
                  color="#eab308"
                  metalness={0.92}
                  roughness={0.18}
                />
              </mesh>

              {/* Small warm aura */}
              <pointLight color="#f59e0b" intensity={0.8} distance={1.2} />
            </group>
          </Float>

          {/* Golden floating sparkles around the key */}
          <Sparkles count={12} scale={0.8} size={2} speed={0.4} color="#fef08a" />
        </group>
      )}

      {/* Empty Cradle Indentation (shown when key is collected) */}
      {hasKey && (
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
        </mesh>
      )}
    </group>
  );
};
