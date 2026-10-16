import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
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
  const isSensorActivated = Boolean(c103?.sensorActivated || (isBallastInverted && isRuleOverridden));
  const isExitUnlocked = Boolean(c103?.exitUnlocked || isSensorActivated);

  const coreRef = useRef<Mesh>(null);
  const coreOuterRef = useRef<Mesh>(null);
  const ballastCoilRef = useRef<Mesh>(null);
  const ballastInnerCoilRef = useRef<Mesh>(null);
  const sensorGlowRef = useRef<Mesh>(null);
  const beamRef = useRef<Mesh>(null);
  const particleGroupRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    // Determine target elevation
    // Default: 0.65 (seated in cradle)
    // Ballast inverted only: 2.0 (floating at eye level)
    // Sensor activated (both ballast & rule overridden): 4.3 (docked into ceiling receiver)
    const targetY = isSensorActivated ? 4.3 : isBallastInverted ? 2.0 : 0.65;
    const hoverOffset = isBallastInverted && !isSensorActivated ? Math.sin(elapsed * 2.5) * 0.08 : 0;

    if (coreRef.current) {
      coreRef.current.position.y += ((targetY + hoverOffset) - coreRef.current.position.y) * Math.min(delta * 4, 1);
      coreRef.current.rotation.y += delta * (isSensorActivated ? 1.5 : isBallastInverted ? 1.0 : 0.4);
      coreRef.current.rotation.x = Math.sin(elapsed * 1.2) * 0.15;
    }

    if (coreOuterRef.current && coreRef.current) {
      coreOuterRef.current.position.y = coreRef.current.position.y;
      coreOuterRef.current.rotation.y -= delta * 0.8;
      coreOuterRef.current.rotation.z += delta * 0.5;
    }

    if (ballastCoilRef.current) {
      ballastCoilRef.current.rotation.y += delta * (isBallastInverted ? 3.0 : 0.6);
    }
    if (ballastInnerCoilRef.current) {
      ballastInnerCoilRef.current.rotation.y -= delta * (isBallastInverted ? 2.2 : 0.4);
    }

    if (sensorGlowRef.current) {
      const pulseSpeed = isSensorActivated ? 4.0 : isBallastInverted ? 2.5 : 1.2;
      sensorGlowRef.current.scale.setScalar(1 + Math.sin(elapsed * pulseSpeed) * 0.08);
    }

    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 1.5;
    }

    if (particleGroupRef.current && isBallastInverted) {
      particleGroupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Color tokens
  const idleColor = '#FFC46B';     // Clue amber token
  const detectingColor = '#52D9F2'; // Interaction cyan token
  const activeColor = '#65E6B0';    // Success mint token

  const sensorColor = isSensorActivated ? activeColor : isBallastInverted ? detectingColor : idleColor;
  const sensorEmissiveIntensity = isSensorActivated ? 3.2 : isBallastInverted ? 2.0 : 1.2;

  return (
    <group>
      {/* ======================================================== */}
      {/* LIGHTING: Rich, bright, high-clarity environment        */}
      {/* ======================================================== */}
      <ambientLight intensity={0.8} color="#e0f2fe" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
      />
      <directionalLight position={[-5, 7, -5]} intensity={0.6} color="#94a3b8" />
      <hemisphereLight args={['#38bdf8', '#0f172a', 0.5]} />

      {/* Dynamic central point light */}
      <pointLight
        position={[0, 4.2, 0]}
        intensity={isSensorActivated ? 3.5 : 1.8}
        distance={16}
        color={sensorColor}
      />
      {/* Ballast coil point light */}
      <pointLight
        position={[0, 0.8, 0]}
        intensity={isBallastInverted ? 2.8 : 1.0}
        distance={7}
        color={isBallastInverted ? '#52D9F2' : '#38bdf8'}
      />

      {/* ======================================================== */}
      {/* ROOM SHELL: 14m x 14m x 5m, Phase 3 palette              */}
      {/* ======================================================== */}
      {/* Floor with rich reflective finish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#141d2b" roughness={0.45} metalness={0.5} />
      </mesh>
      <gridHelper args={[14, 14, '#2f425c', '#182436']} position={[0, 0.005, 0]} />

      {/* Floor border rim accents */}
      <mesh position={[0, 0.02, -6.85]}>
        <boxGeometry args={[14, 0.04, 0.3]} />
        <meshStandardMaterial color="#223247" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 6.85]}>
        <boxGeometry args={[14, 0.04, 0.3]} />
        <meshStandardMaterial color="#223247" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-6.85, 0.02, 0]}>
        <boxGeometry args={[0.3, 0.04, 14]} />
        <meshStandardMaterial color="#223247" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[6.85, 0.02, 0]}>
        <boxGeometry args={[0.3, 0.04, 14]} />
        <meshStandardMaterial color="#223247" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f1624" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* North Wall (Exit Door) */}
      <mesh position={[0, 2.45, -6.95]} receiveShadow>
        <boxGeometry args={[14, 4.9, 0.3]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* South Wall (Player spawn side) */}
      <mesh position={[0, 2.45, 6.95]} receiveShadow>
        <boxGeometry args={[14, 4.9, 0.3]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* West Wall (Telemetry datapad) */}
      <mesh position={[-6.95, 2.45, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.9, 14]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* East Wall (Rule terminal) */}
      <mesh position={[6.95, 2.45, 0]} receiveShadow>
        <boxGeometry args={[0.3, 4.9, 14]} />
        <meshStandardMaterial color="#182333" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Architectural trim stripes along top walls */}
      <mesh position={[0, 4.75, -6.8]}>
        <boxGeometry args={[14, 0.12, 0.05]} />
        <meshStandardMaterial color="#52D9F2" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 4.75, 6.8]}>
        <boxGeometry args={[14, 0.12, 0.05]} />
        <meshStandardMaterial color="#52D9F2" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* ======================================================== */}
      {/* SUNKEN CRADLE & BALLAST COIL (x=0, z=0)                   */}
      {/* ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Sunken cradle outer rim ring */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.06, 36]} />
          <meshStandardMaterial color="#223247" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Step-down recessed tier */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[1.7, 1.8, 0.08, 36]} />
          <meshStandardMaterial color="#151e2c" roughness={0.6} metalness={0.5} />
        </mesh>

        {/* Emissive floor ring indicator around cradle */}
        <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.35, 1.45, 36]} />
          <meshStandardMaterial
            color={isBallastInverted ? '#52D9F2' : '#334766'}
            emissive={isBallastInverted ? '#0284c7' : '#1e293b'}
            emissiveIntensity={isBallastInverted ? 1.8 : 0.4}
          />
        </mesh>
      </group>

      {/* Interactive Ballast Coil Pedestal */}
      <group position={[0, 0.1, 0]} userData={{ interactableId: 'c103_ballast' }}>
        <mesh receiveShadow castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.1, 1.25, 0.2, 32]} />
          <meshStandardMaterial color="#1c283a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Outer rotating magnetic torus */}
        <mesh ref={ballastCoilRef} position={[0, 0.28, 0]}>
          <torusGeometry args={[0.95, 0.07, 16, 32]} />
          <meshStandardMaterial
            color="#52D9F2"
            emissive="#0284c7"
            emissiveIntensity={isBallastInverted ? 2.8 : 0.7}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Inner reverse rotating coil */}
        <mesh ref={ballastInnerCoilRef} position={[0, 0.28, 0]}>
          <torusGeometry args={[0.65, 0.05, 16, 28]} />
          <meshStandardMaterial
            color={isBallastInverted ? '#65E6B0' : '#38bdf8'}
            emissive={isBallastInverted ? '#059669' : '#0284c7'}
            emissiveIntensity={isBallastInverted ? 2.5 : 0.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Floating status hologram label on the coil base */}
        <group position={[0, 0.5, 1.35]} rotation={[-Math.PI / 4, 0, 0]}>
          <Text fontSize={0.11} color="#52D9F2" anchorX="center" anchorY="middle">
            {isBallastInverted
              ? '● BALLAST: POLARITY INVERTED [-9.81 m/s²]'
              : '○ BALLAST: STANDARD GRAVITY [+9.81 m/s²]'}
          </Text>
          <Text position={[0, -0.14, 0]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="middle">
            {isBallastInverted ? '[E] INVERT BACK TO STANDARD' : '[E] INVERT BALLAST POLARITY'}
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* MAGNETIC AEROGEL ARCHIVE CORE SPECIMEN                   */}
      {/* Elevates: y=0.65 (default) -> y=2.0 (ballast) -> y=4.3   */}
      {/* ======================================================== */}
      <group userData={{ interactableId: 'c103_core' }}>
        {/* Main faceted crystal core */}
        <mesh ref={coreRef} position={[0, 0.65, 0]} castShadow>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color="#52D9F2"
            emissive={isSensorActivated ? '#65E6B0' : isBallastInverted ? '#0284c7' : '#0369a1'}
            emissiveIntensity={isSensorActivated ? 2.5 : isBallastInverted ? 1.8 : 0.9}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Outer gyro containment cage around the aerogel core */}
        <mesh ref={coreOuterRef} position={[0, 0.65, 0]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#65E6B0"
            wireframe
            emissive={isSensorActivated ? '#65E6B0' : '#38bdf8'}
            emissiveIntensity={isSensorActivated ? 2.0 : 0.8}
          />
        </mesh>
      </group>

      {/* Floating telemetry HUD above the core */}
      <group position={[0, isSensorActivated ? 4.9 : isBallastInverted ? 2.6 : 1.3, 0]}>
        <Text fontSize={0.09} color={isSensorActivated ? '#65E6B0' : '#52D9F2'} anchorX="center" anchorY="middle">
          {isSensorActivated
            ? 'SPECIMEN ELEVATED // DOCKED AT CEILING SENSOR'
            : isBallastInverted
            ? 'SPECIMEN SUSPENDED // AWAITING MASS OVERRIDE'
            : 'SPECIMEN CLAMPED // GRAVITY: +9.81 m/s²'}
        </Text>
      </group>

      {/* ======================================================== */}
      {/* CEILING OPTICAL SENSOR RECEIVER (y=4.6)                  */}
      {/* 3 distinct visual states:                                */}
      {/* State 1: Amber (#FFC46B) idle                            */}
      {/* State 2: Cyan (#52D9F2) detecting                        */}
      {/* State 3: Mint (#65E6B0) locked handshake + energy beam   */}
      {/* ======================================================== */}
      <group position={[0, 4.65, 0]} userData={{ interactableId: 'c103_sensor' }}>
        {/* Sensor mechanical housing */}
        <mesh>
          <cylinderGeometry args={[1.0, 1.2, 0.3, 32]} />
          <meshStandardMaterial color="#1a2536" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Optical aperture ring */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.65, 0.7, 0.05, 32]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Pulsing emissive optical sensor eye */}
        <mesh ref={sensorGlowRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.58, 32]} />
          <meshStandardMaterial
            color={sensorColor}
            emissive={sensorColor}
            emissiveIntensity={sensorEmissiveIntensity}
          />
        </mesh>

        {/* Status text on the ceiling aperture */}
        <group position={[0, -0.22, 0.9]} rotation={[Math.PI / 3, 0, 0]}>
          <Text fontSize={0.1} color={sensorColor} anchorX="center" anchorY="middle">
            {isSensorActivated
              ? 'OPTICAL HANDSHAKE LOCKED [98.4%]'
              : isBallastInverted
              ? 'BEAM DETECTING // ELEVATE SPECIMEN TO DOCK'
              : 'OPTICAL SENSOR IDLE // AWAITING SPECIMEN'}
          </Text>
        </group>
      </group>

      {/* Vertical optical laser column when sensor is locked */}
      {isSensorActivated && (
        <mesh ref={beamRef} position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 4.2, 16, 1, true]} />
          <meshStandardMaterial
            color="#65E6B0"
            emissive="#10b981"
            emissiveIntensity={2.5}
            transparent
            opacity={0.4}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* ======================================================== */}
      {/* WEST WALL: ARCHIVAL DATAPAD (x=-6.8)                     */}
      {/* ======================================================== */}
      <group position={[-6.75, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'c103_log' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.3, 0.08]} />
          <meshStandardMaterial color="#1c283a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Screen inset */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.6, 1.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        <group position={[0, 0.35, 0.06]}>
          <Text fontSize={0.1} color="#52D9F2" anchorX="center" anchorY="middle">
            // ARCHIVAL TELEMETRY AUDIT #33 //
          </Text>
        </group>
        <group position={[0, -0.05, 0.06]}>
          <Text fontSize={0.075} maxWidth={1.45} lineHeight={1.45} color="#e2e8f0" anchorX="center" anchorY="middle">
            {'RULE #03: Clamps deck at +9.81 m/s² for mass >5kg.\n\nSPECIMEN: Magnetic aerogel (mass: 0.3kg).\nACTION: Invert ballast coil & override mass check\nto trigger ceiling optical receiver handshake.'}
          </Text>
        </group>
        <group position={[0, -0.42, 0.06]}>
          <Text fontSize={0.065} color="#FFC46B" anchorX="center" anchorY="middle">
            [E] READ COMPLETE AUDIT LOG
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* EAST WALL: ARCHIVE RULE TERMINAL (x=+6.8)                */}
      {/* ======================================================== */}
      <group position={[6.75, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c103_terminal' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.4, 0.4]} />
          <meshStandardMaterial color="#151e2c" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Terminal screen */}
        <mesh position={[0, 0.1, 0.21]}>
          <planeGeometry args={[1.5, 0.9]} />
          <meshStandardMaterial color="#0a0f1d" roughness={0.3} />
        </mesh>
        <group position={[0, 0.38, 0.22]}>
          <Text fontSize={0.1} color="#c084fc" anchorX="center" anchorY="middle">
            ARCHIVE RULE COMPILER TERMINAL
          </Text>
        </group>
        <group position={[0, 0.12, 0.22]}>
          <Text
            fontSize={0.085}
            color={isRuleOverridden ? '#65E6B0' : '#FFC46B'}
            anchorX="center"
            anchorY="middle"
          >
            {isRuleOverridden
              ? '● RULE #03: REWRITTEN [FREE ASCENT AUTHORIZED]'
              : '○ RULE #03: ACTIVE [9.81 m/s² ENFORCED]'}
          </Text>
        </group>
        <group position={[0, -0.15, 0.22]}>
          <Text
            fontSize={0.07}
            maxWidth={1.4}
            lineHeight={1.3}
            color="#cbd5e1"
            anchorX="center"
            anchorY="middle"
          >
            {isRuleOverridden
              ? 'Mass threshold bypassed. Aerogel specimen floats freely without ceiling restraint.'
              : 'Elevate specimen past 2.0m by rewriting gravitational clause #03.'}
          </Text>
        </group>
        <group position={[0, -0.42, 0.22]}>
          <Text fontSize={0.07} color="#52D9F2" anchorX="center" anchorY="middle">
            {isRuleOverridden ? '[REWRITE COMPLETE]' : '[E] REWRITE RULE #03'}
          </Text>
        </group>
      </group>

      {/* ======================================================== */}
      {/* NORTH WALL: ARCHIVE VAULT EXIT DOOR (z=-6.7)             */}
      {/* ======================================================== */}
      <group position={[0, 0, -6.75]} userData={{ interactableId: 'exit_door_103' }}>
        {/* Door frame pillars */}
        <mesh position={[-2.1, 2.2, 0]} castShadow>
          <boxGeometry args={[0.7, 4.4, 0.6]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[2.1, 2.2, 0]} castShadow>
          <boxGeometry args={[0.7, 4.4, 0.6]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow>
          <boxGeometry args={[4.9, 0.6, 0.6]} />
          <meshStandardMaterial color="#1a2536" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Door Panels (Open or Closed) */}
        <mesh position={[-0.9, 2.2, 0.05]} castShadow>
          <boxGeometry args={[1.7, 3.8, 0.15]} />
          <meshStandardMaterial
            color={isExitUnlocked ? '#1e3a47' : '#141d28'}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0.9, 2.2, 0.05]} castShadow>
          <boxGeometry args={[1.7, 3.8, 0.15]} />
          <meshStandardMaterial
            color={isExitUnlocked ? '#1e3a47' : '#141d28'}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Status Header Hologram */}
        <group position={[0, 4.15, 0.35]}>
          <Text
            fontSize={0.14}
            color={isExitUnlocked ? '#65E6B0' : '#FF7F86'}
            anchorX="center"
            anchorY="middle"
          >
            {isExitUnlocked
              ? 'ARCHIVE VAULT UNLOCKED // ADVANCE TO SECTOR 104'
              : 'ARCHIVE VAULT SEALED // ELEVATE CORE TO CEILING SENSOR'}
          </Text>
        </group>
        <group position={[0, 2.2, 0.2]}>
          <Text
            fontSize={0.1}
            color={isExitUnlocked ? '#65E6B0' : '#94a3b8'}
            anchorX="center"
            anchorY="middle"
          >
            {isExitUnlocked ? '[E] STEP THROUGH TO SECTOR 104' : '[INTERLOCKED]'}
          </Text>
        </group>
      </group>
    </group>
  );
};
