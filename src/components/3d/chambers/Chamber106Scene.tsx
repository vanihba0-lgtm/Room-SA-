import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text, Float } from '@react-three/drei';
import { GameState } from '../../../game/types';

interface Chamber106SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber106Scene: React.FC<Chamber106SceneProps> = ({ state }) => {
  const c106 = state.chamber106;
  const isAxiomRead = c106?.primeAxiomRead ?? false;
  const activeConsoles = c106?.activeConsoles ?? [];
  const isMatricesDone = c106?.matricesSynthesized ?? false;
  const isPrimeOverridden = c106?.primeDirectiveOverridden ?? false;

  const coreRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (isPrimeOverridden ? 2.5 : 0.8);
      coreRef.current.rotation.x += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 1.2;
    }
  });

  const ambientColor = isPrimeOverridden ? '#10b981' : isMatricesDone ? '#38bdf8' : '#f59e0b';

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#f8fafc" />
      <directionalLight position={[0, 9, 0]} intensity={1.5} castShadow color="#ffffff" />
      <pointLight position={[0, 3.5, 0]} intensity={isPrimeOverridden ? 3.5 : 2.0} distance={18} color={ambientColor} />

      {/* Octagonal Floor Shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[8.5, 8]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.5} metalness={0.6} />
      </mesh>
      <gridHelper args={[16, 16, '#38bdf8', '#1e293b']} position={[0, 0.005, 0]} />

      {/* Ceiling Dome */}
      <mesh position={[0, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.5, 8]} />
        <meshStandardMaterial color="#080c14" roughness={0.8} />
      </mesh>

      {/* Perimeter Pillars */}
      {[-6, 6].map((x) =>
        [-6, 6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 2.6, z]} castShadow>
            <cylinderGeometry args={[0.5, 0.6, 5.2, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* Central Architect Core: Floating Polyhedron & Energy Ring */}
      <group position={[0, 2.0, 0]} userData={{ interactableId: 'c106_prime_axiom' }}>
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
          <mesh ref={coreRef} castShadow>
            <icosahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial
              color={ambientColor}
              emissive={ambientColor}
              emissiveIntensity={isPrimeOverridden ? 3 : 1.4}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
          <mesh ref={ringRef}>
            <torusGeometry args={[1.5, 0.06, 16, 32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
          </mesh>
        </Float>
        <group position={[0, 1.8, 0]}>
          <Text fontSize={0.14} color={ambientColor} anchorX="center" anchorY="middle">
            {isPrimeOverridden
              ? '● PRIME DIRECTIVE: DISSOLVED // LIBERATION READY'
              : isAxiomRead
              ? 'THE ARCHITECT // PRIME AXIOM AUDITED'
              : 'THE ARCHITECT // PRIME AXIOM'}
          </Text>
        </group>
      </group>

      {/* 4 Peripheral Verification Consoles */}
      {/* 1. Spectrometry (North-West: -3.8, 1.2, -3.8) */}
      <group position={[-3.8, 1.2, -3.8]} userData={{ interactableId: 'c106_console_spectrometry' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.09} color={activeConsoles.includes('spectrometry') ? '#10b981' : '#f59e0b'} anchorX="center" anchorY="middle">
            {activeConsoles.includes('spectrometry') ? '● SPECTROMETRY SYNCHED' : '○ 1. SPECTROMETRY'}
          </Text>
        </group>
      </group>

      {/* 2. Resonance (North-East: 3.8, 1.2, -3.8) */}
      <group position={[3.8, 1.2, -3.8]} userData={{ interactableId: 'c106_console_resonance' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.09} color={activeConsoles.includes('resonance') ? '#10b981' : '#a855f7'} anchorX="center" anchorY="middle">
            {activeConsoles.includes('resonance') ? '● RESONANCE SYNCHED' : '○ 2. RESONANCE'}
          </Text>
        </group>
      </group>

      {/* 3. Parity (South-West: -3.8, 1.2, 3.8) */}
      <group position={[-3.8, 1.2, 3.8]} userData={{ interactableId: 'c106_console_parity' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.09} color={activeConsoles.includes('parity') ? '#10b981' : '#38bdf8'} anchorX="center" anchorY="middle">
            {activeConsoles.includes('parity') ? '● PARITY SYNCHED' : '○ 3. PARITY'}
          </Text>
        </group>
      </group>

      {/* 4. Chronology (South-East: 3.8, 1.2, 3.8) */}
      <group position={[3.8, 1.2, 3.8]} userData={{ interactableId: 'c106_console_chronology' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.3, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.09} color={activeConsoles.includes('chronology') ? '#10b981' : '#fb7185'} anchorX="center" anchorY="middle">
            {activeConsoles.includes('chronology') ? '● CHRONOLOGY SYNCHED' : '○ 4. CHRONOLOGY'}
          </Text>
        </group>
      </group>

      {/* Master Compiler Terminal (East Wall: 7.2, 1.6, 0) */}
      <group position={[7.2, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c106_master_terminal' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.4, 0.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <group position={[0, 0.35, 0.24]}>
          <Text fontSize={0.11} color="#38bdf8" anchorX="center" anchorY="middle">
            MASTER COMPILER // PRIME AXIOM
          </Text>
        </group>
        <group position={[0, -0.1, 0.24]}>
          <Text fontSize={0.08} color={isPrimeOverridden ? '#10b981' : isMatricesDone ? '#38bdf8' : '#f59e0b'} anchorX="center" anchorY="middle">
            {isPrimeOverridden
              ? '● QUARANTINE DISSOLVED // REALITY RESTORED'
              : isMatricesDone
              ? '● READY: OVERRIDE PRIME DIRECTIVE'
              : `○ LOCKED: SYNTHESIZE MATRICES (${activeConsoles.length}/4)`}
          </Text>
        </group>
      </group>

      {/* The Final Liberation Portal (z=-7.2m) */}
      <group position={[0, 0, -7.2]} userData={{ interactableId: 'exit_door_106' }}>
        <mesh position={[-2.2, 2.4, 0]}>
          <boxGeometry args={[0.6, 4.8, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        <mesh position={[2.2, 2.4, 0]}>
          <boxGeometry args={[0.6, 4.8, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {isPrimeOverridden && (
          <pointLight position={[0, 2.2, 0.5]} intensity={5.0} distance={12} color="#10b981" />
        )}
        <group position={[0, 4.5, 0.5]}>
          <Text fontSize={0.13} color={isPrimeOverridden ? '#10b981' : '#ef4444'} anchorX="center" anchorY="middle">
            {isPrimeOverridden ? 'PORTAL ACTIVE // STEP THROUGH TO LIBERATION' : 'SIMULATION QUARANTINE SEALED'}
          </Text>
        </group>
      </group>
    </group>
  );
};
