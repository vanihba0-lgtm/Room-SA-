import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { GameState } from '../../../game/types';

interface Chamber104SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber104Scene: React.FC<Chamber104SceneProps> = ({ state }) => {
  const c104 = state.chamber104;
  const telemetryAudited = c104?.telemetryAudited ?? false;
  const hasGuestToken = c104?.hasGuestToken ?? false;
  const checksumMatched = c104?.checksumMatched ?? false;
  const exitUnlocked = c104?.exitUnlocked ?? false;

  const parityRingOuterRef = useRef<Mesh>(null);
  const parityRingInnerRef = useRef<Mesh>(null);
  const laserBeamRef = useRef<Mesh>(null);
  const leftDoorPanelRef = useRef<Mesh>(null);
  const rightDoorPanelRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    // Rotate parity rings on console
    if (parityRingOuterRef.current) {
      parityRingOuterRef.current.rotation.z += delta * (checksumMatched ? 2.2 : 0.8);
    }
    if (parityRingInnerRef.current) {
      parityRingInnerRef.current.rotation.z -= delta * (checksumMatched ? 1.6 : 0.5);
    }

    // Pulse laser beam
    if (laserBeamRef.current) {
      const pulse = 1 + Math.sin(elapsed * 4) * 0.08;
      laserBeamRef.current.scale.set(pulse, 1, pulse);
    }

    // Animate vault door retraction when unlocked
    if (leftDoorPanelRef.current && rightDoorPanelRef.current) {
      const targetLeftX = exitUnlocked ? -2.6 : -1.0;
      const targetRightX = exitUnlocked ? 2.6 : 1.0;

      leftDoorPanelRef.current.position.x +=
        (targetLeftX - leftDoorPanelRef.current.position.x) * Math.min(delta * 3, 1);
      rightDoorPanelRef.current.position.x +=
        (targetRightX - rightDoorPanelRef.current.position.x) * Math.min(delta * 3, 1);
    }
  });

  // State-driven color tokens
  const statusColor = exitUnlocked ? '#65E6B0' : checksumMatched ? '#52D9F2' : '#FFC46B';
  const doorStatusColor = exitUnlocked ? '#65E6B0' : checksumMatched ? '#52D9F2' : '#FF7F86';

  return (
    <group>
      {/* ======================================================== */}
      {/* LIGHTING: Crisp, bright, high-clarity environment        */}
      {/* ======================================================== */}
      <ambientLight intensity={0.8} color="#e0f2fe" />
      <directionalLight
        position={[4, 9, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
      />
      <directionalLight position={[-4, 7, -3]} intensity={0.6} color="#94a3b8" />
      <hemisphereLight args={['#52D9F2', '#101722', 0.45]} />

      {/* Central console point light */}
      <pointLight
        position={[0, 2.5, 0]}
        intensity={checksumMatched ? 2.8 : 1.5}
        distance={12}
        color={statusColor}
      />
      {/* Vault door beacon light */}
      <pointLight
        position={[0, 4.0, -6.0]}
        intensity={exitUnlocked ? 3.0 : 1.2}
        distance={10}
        color={doorStatusColor}
      />

      {/* ======================================================== */}
      {/* ROOM SHELL: 14m x 14m x 5m, Phase 3 palette              */}
      {/* ======================================================== */}
      {/* Floor with tech-grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#141d2b" roughness={0.4} metalness={0.5} />
      </mesh>
      <gridHelper args={[14, 14, '#2f425c', '#182436']} position={[0, 0.005, 0]} />

      {/* Circuit conduits in the floor */}
      {/* Line from West Monitor to Central Console */}
      <mesh position={[-3.2, 0.01, 0]}>
        <boxGeometry args={[6.4, 0.02, 0.2]} />
        <meshStandardMaterial
          color={telemetryAudited ? '#52D9F2' : '#223247'}
          emissive={telemetryAudited ? '#0284c7' : '#000000'}
          emissiveIntensity={telemetryAudited ? 1.5 : 0}
        />
      </mesh>
      {/* Line from East Dispenser to Central Console */}
      <mesh position={[3.2, 0.01, 0]}>
        <boxGeometry args={[6.4, 0.02, 0.2]} />
        <meshStandardMaterial
          color={hasGuestToken ? '#65E6B0' : '#223247'}
          emissive={hasGuestToken ? '#059669' : '#000000'}
          emissiveIntensity={hasGuestToken ? 1.5 : 0}
        />
      </mesh>
      {/* Line from Central Console to Vault Door */}
      <mesh position={[0, 0.01, -3.4]}>
        <boxGeometry args={[0.2, 0.02, 6.8]} />
        <meshStandardMaterial
          color={checksumMatched ? '#65E6B0' : '#223247'}
          emissive={checksumMatched ? '#059669' : '#000000'}
          emissiveIntensity={checksumMatched ? 1.8 : 0}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f1624" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* North Wall (Vault Door) */}
      <mesh position={[0, 2.45, -6.95]} receiveShadow>
        <boxGeometry args={[14, 4.9, 0.3]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* South Wall (Entrance) */}
      <mesh position={[0, 2.45, 6.95]} receiveShadow>
        <boxGeometry args={[14, 4.9, 0.3]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* West Wall (Security Monitor) */}
      <mesh position={[-6.95, 2.45, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.9, 14]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* East Wall (Emergency Token Dispenser) */}
      <mesh position={[6.95, 2.45, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.9, 14]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Top wall neon accent stripes */}
      <mesh position={[0, 4.75, -6.8]}>
        <boxGeometry args={[14, 0.12, 0.05]} />
        <meshStandardMaterial color="#FFC46B" emissive="#d97706" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 4.75, 6.8]}>
        <boxGeometry args={[14, 0.12, 0.05]} />
        <meshStandardMaterial color="#FFC46B" emissive="#d97706" emissiveIntensity={0.6} />
      </mesh>

      {/* ======================================================== */}
      {/* WEST WALL: SECURITY TELEMETRY MONITOR (x=-6.75)          */}
      {/* ======================================================== */}
      <group position={[-6.75, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'c104_monitor' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.4, 0.1]} />
          <meshStandardMaterial color="#1c283a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Screen inset */}
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshStandardMaterial color="#0b111e" roughness={0.2} metalness={0.8} />
        </mesh>

        <group position={[0, 0.42, 0.07]}>
          <Text fontSize={0.11} color="#FFC46B" anchorX="center" anchorY="middle">
            // ACCESS CONTROL MATRIX //
          </Text>
        </group>
        <group position={[0, 0.06, 0.07]}>
          <Text fontSize={0.075} maxWidth={1.65} lineHeight={1.4} color="#e2e8f0" anchorX="center" anchorY="middle">
            {telemetryAudited
              ? 'POLICY #04 AUDIT VERIFIED:\n• Required: Level-4 Root Clearance\n• Status: EXPIRED [800 cycles ago]\n• Recovery: Protocol #404 allows guest tokens\n  with verified parity checksum 0x404.'
              : 'SECURITY POLICY #04:\n• Required: Level-4 Root Clearance\n• Status: UNKNOWN [AUDIT PENDING]\n\n[E] AUDIT CREDENTIAL TELEMETRY'}
          </Text>
        </group>
        <group position={[0, -0.45, 0.07]}>
          <Text fontSize={0.07} color="#52D9F2" anchorX="center" anchorY="middle">
            {telemetryAudited ? '● TELEMETRY EXPOSED [RECOVERY ENABLED]' : '[E] AUDIT SECURITY CLEARANCE'}
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* EAST WALL: EMERGENCY TOKEN DISPENSER (x=+6.75)           */}
      {/* ======================================================== */}
      <group position={[6.75, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c104_dispenser' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.6, 0.25]} />
          <meshStandardMaterial color="#1a2536" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Unit Faceplate */}
        <mesh position={[0, 0, 0.13]}>
          <planeGeometry args={[1.4, 1.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <group position={[0, 0.48, 0.14]}>
          <Text fontSize={0.095} color="#52D9F2" anchorX="center" anchorY="middle">
            EMERGENCY TOKEN DISPENSER
          </Text>
        </group>
        <group position={[0, 0.22, 0.14]}>
          <Text fontSize={0.075} color={hasGuestToken ? '#65E6B0' : telemetryAudited ? '#FFC46B' : '#64748b'} anchorX="center" anchorY="middle">
            {hasGuestToken
              ? '● CARD DISPENSED: TOKEN #404'
              : telemetryAudited
              ? '○ READY: EMERGENCY RELEASE AVAILABLE'
              : '× LOCKED: AUDIT CREDENTIALS FIRST'}
          </Text>
        </group>

        {/* Physical Token Card Tray */}
        <mesh position={[0, -0.15, 0.18]}>
          <boxGeometry args={[0.7, 0.12, 0.2]} />
          <meshStandardMaterial color="#223247" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Physical Glowing Guest Token Card */}
        {hasGuestToken && (
          <mesh position={[0, -0.12, 0.24]} rotation={[-Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.45, 0.28, 0.02]} />
            <meshStandardMaterial
              color="#FFC46B"
              emissive="#FFC46B"
              emissiveIntensity={1.5}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        )}

        <group position={[0, -0.45, 0.14]}>
          <Text fontSize={0.075} color="#F4F7FC" anchorX="center" anchorY="middle">
            {hasGuestToken
              ? 'TOKEN #404 IN INVENTORY'
              : telemetryAudited
              ? '[E] PULL EMERGENCY DISPENSE LEVER'
              : '[AUDIT MATRIX TO UNLOCK]'}
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* CENTER: CRYPTOGRAPHIC PARITY CONSOLE (x=0, z=0)          */}
      {/* ======================================================== */}
      <group position={[0, 0, 0]} userData={{ interactableId: 'c104_crypto' }}>
        {/* Base foundation */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.7, 0.2, 32]} />
          <meshStandardMaterial color="#1a2536" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Central Pedestal column */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1.1, 0.9, 32]} />
          <meshStandardMaterial color="#151e2c" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Console upper interactive deck */}
        <mesh position={[0, 1.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
          <meshStandardMaterial color="#1c283a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Rotating Outer Parity Ring */}
        <mesh ref={parityRingOuterRef} position={[0, 1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.88, 32]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={checksumMatched ? 2.5 : 1.0}
          />
        </mesh>

        {/* Rotating Inner Parity Ring */}
        <mesh ref={parityRingInnerRef} position={[0, 1.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.58, 24]} />
          <meshStandardMaterial
            color={checksumMatched ? '#65E6B0' : '#52D9F2'}
            emissive={checksumMatched ? '#059669' : '#0284c7'}
            emissiveIntensity={checksumMatched ? 2.2 : 0.8}
          />
        </mesh>

        {/* Verification laser column when verified */}
        {checksumMatched && (
          <mesh ref={laserBeamRef} position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.6, 16, 1, true]} />
            <meshStandardMaterial
              color="#65E6B0"
              emissive="#10b981"
              emissiveIntensity={3.0}
              transparent
              opacity={0.45}
            />
          </mesh>
        )}

        {/* Status text on console */}
        <group position={[0, 1.35, 0.95]} rotation={[-Math.PI / 4, 0, 0]}>
          <Text fontSize={0.11} color={statusColor} anchorX="center" anchorY="middle">
            {checksumMatched
              ? '● PARITY 0x404: VERIFIED // ROOT ELEVATED'
              : hasGuestToken
              ? '○ READY: INJECT TOKEN #404 TO CALIBRATE'
              : '× WAITING: INSERT GUEST SECURITY TOKEN'}
          </Text>
          <Text position={[0, -0.15, 0]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="middle">
            {checksumMatched
              ? 'AUTHORIZE AT VAULT BLAST DOOR'
              : hasGuestToken
              ? '[E] CALIBRATE PARITY 0x404'
              : 'DISPENSE TOKEN ON EAST WALL FIRST'}
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* NORTH WALL: CRYPTOGRAPHIC VAULT BLAST DOOR (z=-6.7)      */}
      {/* ======================================================== */}
      <group position={[0, 0, -6.7]} userData={{ interactableId: 'exit_door_104' }}>
        {/* Frame Pillars */}
        <mesh position={[-2.4, 2.2, 0]} castShadow>
          <boxGeometry args={[0.8, 4.4, 0.7]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[2.4, 2.2, 0]} castShadow>
          <boxGeometry args={[0.8, 4.4, 0.7]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow>
          <boxGeometry args={[5.6, 0.6, 0.7]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Sliding Left Door Panel */}
        <mesh ref={leftDoorPanelRef} position={[-1.0, 2.2, 0.05]} castShadow>
          <boxGeometry args={[1.9, 3.8, 0.2]} />
          <meshStandardMaterial
            color={exitUnlocked ? '#1e3a47' : '#141d28'}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Sliding Right Door Panel */}
        <mesh ref={rightDoorPanelRef} position={[1.0, 2.2, 0.05]} castShadow>
          <boxGeometry args={[1.9, 3.8, 0.2]} />
          <meshStandardMaterial
            color={exitUnlocked ? '#1e3a47' : '#141d28'}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Header Readout Hologram */}
        <group position={[0, 4.15, 0.4]}>
          <Text
            fontSize={0.13}
            color={doorStatusColor}
            anchorX="center"
            anchorY="middle"
          >
            {exitUnlocked
              ? 'VAULT OPEN // ADVANCE TO SECTOR 105'
              : checksumMatched
              ? 'PARITY VERIFIED // [E] AUTHORIZE TO UNLOCK'
              : 'VAULT SEALED // ROOT-4 EXPIRED (AUDIT REQUIRED)'}
          </Text>
        </group>

        {/* Threshold prompt */}
        <group position={[0, 2.2, 0.2]}>
          <Text
            fontSize={0.095}
            color={doorStatusColor}
            anchorX="center"
            anchorY="middle"
          >
            {exitUnlocked
              ? '[E] STEP THROUGH TO CAUSALITY ENGINE'
              : checksumMatched
              ? '[E] ENGAGE DEADBOLT RELEASE'
              : '[INTERLOCKED]'}
          </Text>
        </group>
      </group>
    </group>
  );
};
