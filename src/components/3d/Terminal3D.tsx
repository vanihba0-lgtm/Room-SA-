import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import { Text } from '@react-three/drei';

interface Terminal3DProps {
  isDeceptiveRule: boolean;
  onTargetHover?: (targetId: string | null) => void;
}

export const Terminal3D: React.FC<Terminal3DProps> = ({
  isDeceptiveRule,
  onTargetHover,
}) => {
  const screenGlowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (screenGlowRef.current) {
      // Subtle phosphor flicker
      const t = clock.getElapsedTime();
      const flicker = 1.6 + Math.sin(t * 8) * 0.08 + Math.cos(t * 23) * 0.04;
      const mat = screenGlowRef.current.material as MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = flicker;
      }
    }
  });

  const screenColor = isDeceptiveRule ? '#f59e0b' : '#10b981';

  return (
    <group
      position={[5.85, 1.8, 0]}
      rotation={[0, -Math.PI / 2, 0]}
      userData={{ interactableId: 'terminal' }}
      onPointerOver={() => onTargetHover?.('terminal')}
      onPointerOut={() => onTargetHover?.(null)}
    >
      {/* Wall Recess Backing Frame */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.2, 0.2]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Outer Console Shell */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[1.4, 1.8, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* CRT Screen Bezel */}
      <mesh position={[0, 0.2, 0.16]}>
        <boxGeometry args={[1.15, 0.9, 0.06]} />
        <meshStandardMaterial color="#090d14" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Glowing CRT Display Glass */}
      <mesh ref={screenGlowRef} position={[0, 0.2, 0.2]}>
        <planeGeometry args={[1.05, 0.8]} />
        <meshStandardMaterial
          color="#050a10"
          emissive={screenColor}
          emissiveIntensity={1.5}
          roughness={0.1}
        />
      </mesh>
      <pointLight position={[0, 0.2, 0.5]} color={screenColor} intensity={0.9} distance={3} />

      {/* Screen Text Info */}
      <Text
        position={[0, 0.45, 0.21]}
        fontSize={0.055}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
      >
        ANOMALY LOGIC TERMINAL
      </Text>
      <Text
        position={[-0.48, 0.32, 0.21]}
        fontSize={0.045}
        color={screenColor}
        anchorX="left"
        anchorY="top"
      >
        {isDeceptiveRule
          ? '> RULE_01 ACTIVE: RESTRICTED\n> "Doors yield only to copper keys."\n> STATUS: CONTRADICTION DETECTED\n> PRESS [E] TO REWRITE'
          : '> RULE_01 OVERRIDDEN: STABLE\n> "Doors yield to brass keys."\n> HYDRAULIC LOCK SYNCHRONIZED\n> STATUS: CLEAR'}
      </Text>

      {/* Terminal Angled Keypad Deck */}
      <group position={[0, -0.45, 0.22]} rotation={[Math.PI / 6, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.1, 0.4, 0.08]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Illuminated Keyboard Rows */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.9, 0.25]} />
          <meshStandardMaterial
            color="#1e293b"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Proximity / Interaction Hologram Icon */}
      <mesh position={[0, 0.95, 0.1]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={screenColor}
          emissive={screenColor}
          emissiveIntensity={3}
        />
      </mesh>
    </group>
  );
};
