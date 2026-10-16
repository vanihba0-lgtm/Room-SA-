import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { GameState } from '../../../game/types';

interface Chamber103SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber103Scene: React.FC<Chamber103SceneProps> = ({ state }) => {
  const c103 = state.chamber103;
  const isBallastInverted = c103?.ballastInverted ?? false;
  const isRuleOverridden = c103?.ruleOverridden ?? false;
  const isExitUnlocked = c103?.exitUnlocked ?? false;

  const coreRef = useRef<Mesh>(null);
  const ballastCoilRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    // Elevate aerogel core when ballast is inverted
    if (coreRef.current) {
      const targetY = isRuleOverridden ? 3.8 : isBallastInverted ? 2.0 : 0.65;
      coreRef.current.position.y += (targetY - coreRef.current.position.y) * Math.min(delta * 4, 1);
      coreRef.current.rotation.y += delta * 0.8;
    }
    if (ballastCoilRef.current) {
      ballastCoilRef.current.rotation.y += delta * (isBallastInverted ? 3 : 0.5);
    }
  });

  const ambientColor = isExitUnlocked ? '#10b981' : '#38bdf8';

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.55} color="#e0f2fe" />
      <directionalLight position={[3, 8, 4]} intensity={1.3} castShadow color="#ffffff" />
      <pointLight position={[0, 4.5, 0]} intensity={1.8} distance={15} color={ambientColor} />
      <pointLight position={[0, 1.2, 0]} intensity={isBallastInverted ? 2.5 : 0.8} distance={6} color="#38bdf8" />

      {/* Room Shell (14m x 14m x 5m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
      </mesh>
      <gridHelper args={[14, 14, '#1e293b', '#0f172a']} position={[0, 0.005, 0]} />

      {/* Ceiling & Walls */}
      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0a0f1d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.4, -6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.4, 6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Central Buoyancy Ballast Coil (x=0, z=0) */}
      <group position={[0, 0.05, 0]} userData={{ interactableId: 'c103_ballast' }}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.4, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh ref={ballastCoilRef} position={[0, 0.1, 0]}>
          <torusGeometry args={[1.1, 0.08, 16, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={isBallastInverted ? 2.5 : 0.6}
          />
        </mesh>
        <group position={[0, 0.25, 1.4]} rotation={[-Math.PI / 4, 0, 0]}>
          <Text fontSize={0.12} color="#38bdf8" anchorX="center" anchorY="middle">
            {isBallastInverted ? 'BALLAST: POLARITY INVERTED [-9.81 m/s²]' : 'BALLAST: STANDARD GRAVITY [+9.81 m/s²]'}
          </Text>
        </group>
      </group>

      {/* Magnetic Aerogel Archive Core (Elevates when ballast inverted) */}
      <mesh ref={coreRef} position={[0, 0.65, 0]} castShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={isBallastInverted ? 1.8 : 0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Ceiling Optical Sensor Receiver */}
      <group position={[0, 4.6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 0.2, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <ringGeometry args={[0.5, 0.7, 24]} />
          <meshStandardMaterial
            color={isRuleOverridden ? '#10b981' : '#f59e0b'}
            emissive={isRuleOverridden ? '#10b981' : '#f59e0b'}
            emissiveIntensity={2}
          />
        </mesh>
      </group>

      {/* Left Wall: Archival Datapad Log */}
      <group position={[-6.55, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'c103_log' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.1, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.2, 0.04]}>
          <Text fontSize={0.08} color="#38bdf8" anchorX="center" anchorY="middle">
            // GRAVITY TELEMETRY AUDIT //
          </Text>
        </group>
        <group position={[0, -0.1, 0.04]}>
          <Text fontSize={0.06} maxWidth={1.3} lineHeight={1.4} color="#e2e8f0" anchorX="center" anchorY="middle">
            {"Rule #03 enforces 9.81 m/s² deck clamps.\nArchive Core is magnetic aerogel.\nInvert ballast polarity to elevate specimen."}
          </Text>
        </group>
      </group>

      {/* Right Wall: Archival Terminal */}
      <group position={[6.55, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c103_terminal' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.2, 0.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.25, 0.24]}>
          <Text fontSize={0.09} color="#a855f7" anchorX="center" anchorY="middle">
            ARCHIVE RULE TERMINAL
          </Text>
        </group>
        <group position={[0, -0.1, 0.24]}>
          <Text fontSize={0.08} color={isRuleOverridden ? '#10b981' : '#f59e0b'} anchorX="center" anchorY="middle">
            {isRuleOverridden ? '● RULE #03: REWRITTEN [FREE ASCENT]' : '○ RULE #03: ENFORCED [DECK CLAMPED]'}
          </Text>
        </group>
      </group>

      {/* Exit Door (z=-6.6m) */}
      <group position={[0, 0, -6.6]} userData={{ interactableId: 'exit_door_103' }}>
        <mesh position={[-2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.6, 4.4, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.6, 4.4, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <group position={[0, 4.1, 0.4]}>
          <Text fontSize={0.12} color={isExitUnlocked ? '#10b981' : '#ef4444'} anchorX="center" anchorY="middle">
            {isExitUnlocked ? 'ARCHIVE VAULT OPEN // PROCEED TO SECTOR 104' : 'ARCHIVE SEALED // ELEVATE CORE'}
          </Text>
        </group>
      </group>
    </group>
  );
};
