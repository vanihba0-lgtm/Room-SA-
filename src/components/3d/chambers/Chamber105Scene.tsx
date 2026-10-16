import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { GameState } from '../../../game/types';

interface Chamber105SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber105Scene: React.FC<Chamber105SceneProps> = ({ state }) => {
  const c105 = state.chamber105;
  const matSolved = Boolean(c105?.stationMaterialSolved || c105?.chronometerInspected);
  const sigSolved = Boolean(c105?.stationSignalSolved || c105?.relaysSequenced);
  const arcSolved = Boolean(c105?.stationArchiveSolved || c105?.ruleOverridden);
  const secSolved = Boolean(c105?.stationSecuritySolved || c105?.exitUnlocked);

  const compilerReady = matSolved && sigSolved && arcSolved && secSolved;
  const truthRevealed = Boolean(c105?.truthRevealed);

  // Rotating compiler rings
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y += delta * (truthRevealed ? 1.8 : compilerReady ? 1.2 : 0.5);
      ring1Ref.current.rotation.x += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * (truthRevealed ? 1.4 : compilerReady ? 0.9 : 0.4);
      ring2Ref.current.rotation.z += delta * 0.3;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.8;
      const s = 1 + Math.sin(Date.now() * 0.003) * 0.06;
      coreRef.current.scale.set(s, s, s);
    }
  });

  const ambientLightColor = truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#1e293b';

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.65} color="#e0f2fe" />
      <directionalLight position={[4, 10, 4]} intensity={1.4} castShadow color="#ffffff" />
      <pointLight
        position={[0, 4.5, 0]}
        intensity={truthRevealed ? 3.0 : compilerReady ? 2.5 : 1.8}
        distance={22}
        color={ambientLightColor}
      />

      {/* Room Shell: Octagonal Sanctuary */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#0c121e" roughness={0.5} metalness={0.5} />
      </mesh>
      <gridHelper args={[16, 16, '#263852', '#141e2e']} position={[0, 0.005, 0]} />

      {/* Ceiling */}
      <mesh position={[0, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>

      {/* Perimeter Walls */}
      <mesh position={[0, 2.6, -7.8]}>
        <boxGeometry args={[16, 5.2, 0.4]} />
        <meshStandardMaterial color="#162030" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.6, 7.8]}>
        <boxGeometry args={[16, 5.2, 0.4]} />
        <meshStandardMaterial color="#162030" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[-7.8, 2.6, 0]}>
        <boxGeometry args={[0.4, 5.2, 16]} />
        <meshStandardMaterial color="#162030" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[7.8, 2.6, 0]}>
        <boxGeometry args={[0.4, 5.2, 16]} />
        <meshStandardMaterial color="#162030" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Decorative Wall Architectural Framing */}
      <mesh position={[0, 4.9, -7.6]}>
        <boxGeometry args={[15.6, 0.2, 0.1]} />
        <meshStandardMaterial
          color={truthRevealed ? '#52D9F2' : '#263852'}
          emissive={truthRevealed ? '#52D9F2' : '#000000'}
          emissiveIntensity={truthRevealed ? 0.6 : 0}
        />
      </mesh>

      {/* ========================================================
          STATION 1: Material Axiom (Chamber 101 Link) — West Wall
          ======================================================== */}
      <group position={[-5.5, 0, -2.5]} userData={{ interactableId: 'c105_station_material' }}>
        {/* Pillar Pedestal */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.4, 8]} />
          <meshStandardMaterial color="#1a2638" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Optical Sensor Gate */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[0.6, 0.3, 0.5]} />
          <meshStandardMaterial color="#0f1724" metalness={0.9} />
        </mesh>
        {/* Status Crystal */}
        <mesh position={[0, 1.7, 0]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color={matSolved ? '#65E6B0' : '#FFC46B'}
            emissive={matSolved ? '#65E6B0' : '#FFC46B'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[0, 1.7, 0]} intensity={matSolved ? 0.9 : 0.4} color={matSolved ? '#65E6B0' : '#FFC46B'} distance={4} />
        <group position={[0, 2.1, 0]}>
          <Text fontSize={0.12} color={matSolved ? '#65E6B0' : '#FFC46B'} anchorX="center" anchorY="middle">
            {matSolved ? '● STATION 1: OPTICAL GATE VERIFIED' : '○ STATION 1: MATERIAL AXIOM'}
          </Text>
        </group>
        <group position={[0, 1.95, 0]}>
          <Text fontSize={0.08} color="#CBD5E1" anchorX="center" anchorY="middle">
            {'Chamber 101 // Brass Key Reality'}
          </Text>
        </group>
      </group>

      {/* ========================================================
          STATION 2: Signal Resonance (Chamber 102 Link) — Southwest
          ======================================================== */}
      <group position={[-5.5, 0, 2.5]} userData={{ interactableId: 'c105_station_signal' }}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.4, 8]} />
          <meshStandardMaterial color="#1a2638" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Oscilloscope Dish */}
        <mesh position={[0, 1.45, 0]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.05, 0.2, 16]} />
          <meshStandardMaterial color="#0f1724" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color={sigSolved ? '#65E6B0' : '#52D9F2'}
            emissive={sigSolved ? '#65E6B0' : '#52D9F2'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[0, 1.7, 0]} intensity={sigSolved ? 0.9 : 0.4} color={sigSolved ? '#65E6B0' : '#52D9F2'} distance={4} />
        <group position={[0, 2.1, 0]}>
          <Text fontSize={0.12} color={sigSolved ? '#65E6B0' : '#52D9F2'} anchorX="center" anchorY="middle">
            {sigSolved ? '● STATION 2: 868 kHz CARRIER LOCKED' : '○ STATION 2: SIGNAL RESONANCE'}
          </Text>
        </group>
        <group position={[0, 1.95, 0]}>
          <Text fontSize={0.08} color="#CBD5E1" anchorX="center" anchorY="middle">
            {'Chamber 102 // Channel BETA Carrier'}
          </Text>
        </group>
      </group>

      {/* ========================================================
          STATION 3: Physical Evidence Archive (Chamber 103 Link) — Northeast
          ======================================================== */}
      <group position={[5.5, 0, -2.5]} userData={{ interactableId: 'c105_station_archive' }}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.4, 8]} />
          <meshStandardMaterial color="#1a2638" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Magnetic Coil Cradle */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <torusGeometry args={[0.26, 0.06, 8, 24]} />
          <meshStandardMaterial color="#0f1724" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color={arcSolved ? '#65E6B0' : '#c084fc'}
            emissive={arcSolved ? '#65E6B0' : '#c084fc'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[0, 1.7, 0]} intensity={arcSolved ? 0.9 : 0.4} color={arcSolved ? '#65E6B0' : '#c084fc'} distance={4} />
        <group position={[0, 2.1, 0]}>
          <Text fontSize={0.12} color={arcSolved ? '#65E6B0' : '#c084fc'} anchorX="center" anchorY="middle">
            {arcSolved ? '● STATION 3: POLARITY INVERSION CALIBRATED' : '○ STATION 3: ARCHIVE INCIDENT'}
          </Text>
        </group>
        <group position={[0, 1.95, 0]}>
          <Text fontSize={0.08} color="#CBD5E1" anchorX="center" anchorY="middle">
            {'Chamber 103 // Dr. Mara Voss Dossier'}
          </Text>
        </group>
      </group>

      {/* ========================================================
          STATION 4: Cryptographic Parity (Chamber 104 Link) — East Wall
          ======================================================== */}
      <group position={[5.5, 0, 2.5]} userData={{ interactableId: 'c105_station_security' }}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 1.4, 8]} />
          <meshStandardMaterial color="#1a2638" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Parity Token Reader */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[0.45, 0.25, 0.45]} />
          <meshStandardMaterial color="#0f1724" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <octahedronGeometry args={[0.18]} />
          <meshStandardMaterial
            color={secSolved ? '#65E6B0' : '#fb923c'}
            emissive={secSolved ? '#65E6B0' : '#fb923c'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[0, 1.7, 0]} intensity={secSolved ? 0.9 : 0.4} color={secSolved ? '#65E6B0' : '#fb923c'} distance={4} />
        <group position={[0, 2.1, 0]}>
          <Text fontSize={0.12} color={secSolved ? '#65E6B0' : '#fb923c'} anchorX="center" anchorY="middle">
            {secSolved ? '● STATION 4: CHECKSUM 0x404 VERIFIED' : '○ STATION 4: CRYPTOGRAPHIC PARITY'}
          </Text>
        </group>
        <group position={[0, 1.95, 0]}>
          <Text fontSize={0.08} color="#CBD5E1" anchorX="center" anchorY="middle">
            {'Chamber 104 // Root Elevation Granted'}
          </Text>
        </group>
      </group>

      {/* ========================================================
          CENTRAL MASTER COMPILER APPARATUS
          ======================================================== */}
      <group position={[0, 0, 0]} userData={{ interactableId: 'c105_master_compiler' }}>
        {/* Stepped Dais */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[2.4, 2.7, 0.3, 16]} />
          <meshStandardMaterial color="#141e2e" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.38, 0]} receiveShadow>
          <cylinderGeometry args={[1.8, 2.1, 0.25, 16]} />
          <meshStandardMaterial color="#1a2638" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Energy Rings */}
        <mesh ref={ring1Ref} position={[0, 1.6, 0]}>
          <torusGeometry args={[1.1, 0.04, 16, 48]} />
          <meshStandardMaterial
            color={truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#475569'}
            emissive={truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#334155'}
            emissiveIntensity={truthRevealed ? 1.0 : compilerReady ? 0.7 : 0.2}
          />
        </mesh>
        <mesh ref={ring2Ref} position={[0, 1.6, 0]}>
          <torusGeometry args={[0.85, 0.035, 16, 48]} />
          <meshStandardMaterial
            color={truthRevealed ? '#FFC46B' : compilerReady ? '#52D9F2' : '#334155'}
            emissive={truthRevealed ? '#FFC46B' : compilerReady ? '#52D9F2' : '#1e293b'}
            emissiveIntensity={truthRevealed ? 1.0 : compilerReady ? 0.6 : 0.1}
          />
        </mesh>

        {/* Central Ontological Core */}
        <mesh ref={coreRef} position={[0, 1.6, 0]} castShadow>
          <dodecahedronGeometry args={[0.38]} />
          <meshStandardMaterial
            color={truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#64748b'}
            emissive={truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#1e293b'}
            emissiveIntensity={truthRevealed ? 1.2 : compilerReady ? 0.8 : 0.2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Status Text Banner above Core */}
        <group position={[0, 2.8, 0]}>
          <Text
            fontSize={0.18}
            color={truthRevealed ? '#52D9F2' : compilerReady ? '#65E6B0' : '#94A3B8'}
            anchorX="center"
            anchorY="middle"
          >
            {truthRevealed
              ? 'ROOM S A // SUBSTRATE ARCHITECTURE: UNMASKED'
              : compilerReady
              ? 'MASTER COMPILER // READY TO SYNTHESIZE'
              : 'MASTER COMPILER // 4 AXIOMS LOCKED'}
          </Text>
        </group>

        {truthRevealed && (
          <group position={[0, 2.55, 0]}>
            <Text fontSize={0.11} color="#FFC46B" anchorX="center" anchorY="middle">
              {'SUBJECT ALPHA // CONSCIOUSNESS RECONSTRUCTION VERIFIED'}
            </Text>
          </group>
        )}
      </group>

      {/* ========================================================
          FINAL AUTHORITY CONSOLE: 3 ENDINGS (North Dais)
          ======================================================== */}
      <group position={[0, 0, -5.5]}>
        {/* Dais base */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[7.2, 0.4, 2.2]} />
          <meshStandardMaterial color="#162030" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Main Console Header */}
        <group position={[0, 2.1, 0]}>
          <Text
            fontSize={0.16}
            color={truthRevealed ? '#52D9F2' : '#64748b'}
            anchorX="center"
            anchorY="middle"
          >
            {truthRevealed
              ? 'FINAL AUTHORITY MATRIX // CHOOSE DESTINY'
              : 'FINAL AUTHORITY MATRIX // LOCKED'}
          </Text>
        </group>

        {/* Ending A: Shut It Down */}
        <group position={[-2.2, 0.9, 0]} userData={{ interactableId: 'c105_ending_shutdown' }}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.9, 0.7]} />
            <meshStandardMaterial color="#1a2638" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.1, 16]} />
            <meshStandardMaterial
              color={truthRevealed ? '#F87171' : '#475569'}
              emissive={truthRevealed ? '#F87171' : '#000000'}
              emissiveIntensity={truthRevealed ? 0.7 : 0}
            />
          </mesh>
          <group position={[0, 0.75, 0.36]}>
            <Text fontSize={0.09} color={truthRevealed ? '#F87171' : '#64748b'} anchorX="center" anchorY="middle">
              {'[ENDING A]\nSHUT IT DOWN'}
            </Text>
          </group>
        </group>

        {/* Ending B: Rewrite the Rules */}
        <group position={[0, 0.9, 0]} userData={{ interactableId: 'c105_ending_rewrite' }}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.9, 0.7]} />
            <meshStandardMaterial color="#1a2638" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.1, 16]} />
            <meshStandardMaterial
              color={truthRevealed ? '#65E6B0' : '#475569'}
              emissive={truthRevealed ? '#65E6B0' : '#000000'}
              emissiveIntensity={truthRevealed ? 0.7 : 0}
            />
          </mesh>
          <group position={[0, 0.75, 0.36]}>
            <Text fontSize={0.09} color={truthRevealed ? '#65E6B0' : '#64748b'} anchorX="center" anchorY="middle">
              {'[ENDING B]\nREWRITE THE RULES'}
            </Text>
          </group>
        </group>

        {/* Ending C: Take Control */}
        <group position={[2.2, 0.9, 0]} userData={{ interactableId: 'c105_ending_control' }}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.9, 0.7]} />
            <meshStandardMaterial color="#1a2638" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.1, 16]} />
            <meshStandardMaterial
              color={truthRevealed ? '#52D9F2' : '#475569'}
              emissive={truthRevealed ? '#52D9F2' : '#000000'}
              emissiveIntensity={truthRevealed ? 0.7 : 0}
            />
          </mesh>
          <group position={[0, 0.75, 0.36]}>
            <Text fontSize={0.09} color={truthRevealed ? '#52D9F2' : '#64748b'} anchorX="center" anchorY="middle">
              {'[ENDING C]\nTAKE CONTROL'}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
};
