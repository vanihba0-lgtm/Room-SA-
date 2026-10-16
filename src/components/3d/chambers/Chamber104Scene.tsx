import React from 'react';
import { Text } from '@react-three/drei';
import { GameState } from '../../../game/types';

interface Chamber104SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber104Scene: React.FC<Chamber104SceneProps> = ({ state }) => {
  const c104 = state.chamber104;
  const hasGuestToken = c104?.hasGuestToken ?? false;
  const checksumMatched = c104?.checksumMatched ?? false;
  const exitUnlocked = c104?.exitUnlocked ?? false;

  const ambientColor = exitUnlocked ? '#10b981' : '#f59e0b';

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#fed7aa" />
      <directionalLight position={[0, 8, 2]} intensity={1.4} castShadow color="#ffffff" />
      <pointLight position={[0, 4.2, 0]} intensity={1.8} distance={15} color={ambientColor} />

      {/* Room Shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.4} />
      </mesh>
      <gridHelper args={[14, 14, '#334155', '#1e293b']} position={[0, 0.005, 0]} />

      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.4, -6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, 6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[-6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Left Wall: Security Telemetry Monitor */}
      <group position={[-6.55, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'c104_monitor' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.1, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.2, 0.04]}>
          <Text fontSize={0.08} color="#f59e0b" anchorX="center" anchorY="middle">
            // ACCESS CONTROL MATRIX //
          </Text>
        </group>
        <group position={[0, -0.1, 0.04]}>
          <Text fontSize={0.06} maxWidth={1.3} lineHeight={1.4} color="#e2e8f0" anchorX="center" anchorY="middle">
            {"Rule #04 requires Root-4 clearance.\nRoot credentials expired 800 cycles ago.\nProtocol #404 allows guest tokens with parity 0x404."}
          </Text>
        </group>
      </group>

      {/* Right Wall: Emergency Token Dispenser */}
      <group position={[6.55, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c104_dispenser' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.4, 0.3]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.35, 0.18]}>
          <Text fontSize={0.08} color="#10b981" anchorX="center" anchorY="middle">
            GUEST TOKEN DISPENSER
          </Text>
        </group>
        <group position={[0, -0.1, 0.18]}>
          <Text fontSize={0.07} color={hasGuestToken ? '#10b981' : '#f59e0b'} anchorX="center" anchorY="middle">
            {hasGuestToken ? 'TOKEN ISSUED: #404 [GUEST]' : '[ CLICK OR PRESS E TO DISPENSE ]'}
          </Text>
        </group>
      </group>

      {/* Center Cryptographic Parity Terminal */}
      <group position={[0, 1.2, 0]} userData={{ interactableId: 'c104_crypto' }}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1.0, 1.0, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.85, 24]} />
          <meshStandardMaterial
            color={checksumMatched ? '#10b981' : '#f59e0b'}
            emissive={checksumMatched ? '#10b981' : '#f59e0b'}
            emissiveIntensity={1.8}
          />
        </mesh>
        <group position={[0, 1.1, 0]}>
          <Text fontSize={0.11} color={checksumMatched ? '#10b981' : '#f59e0b'} anchorX="center" anchorY="middle">
            {checksumMatched ? '● PARITY VERIFIED: 0x404 [ROOT ELEVATED]' : '○ PARITY PENDING: 0x404 [INJECT TOKEN]'}
          </Text>
        </group>
      </group>

      {/* Exit Door */}
      <group position={[0, 0, -6.6]} userData={{ interactableId: 'exit_door_104' }}>
        <mesh position={[-2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.6, 4.4, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[2, 2.2, 0]} castShadow>
          <boxGeometry args={[0.6, 4.4, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <group position={[0, 4.1, 0.4]}>
          <Text fontSize={0.12} color={exitUnlocked ? '#10b981' : '#ef4444'} anchorX="center" anchorY="middle">
            {exitUnlocked ? 'ZERO-DAY VAULT DISENGAGED // ADVANCE TO 105' : 'VAULT SEALED // ROOT-4 LOCK ACTIVE'}
          </Text>
        </group>
      </group>
    </group>
  );
};
