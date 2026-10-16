import React from 'react';
import { Text } from '@react-three/drei';
import { GameState } from '../../../game/types';

interface Chamber105SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber105Scene: React.FC<Chamber105SceneProps> = ({ state }) => {
  const c105 = state.chamber105;
  const isSequenced = c105?.relaysSequenced ?? false;
  const isRuleOverridden = c105?.ruleOverridden ?? false;
  const isExitUnlocked = c105?.exitUnlocked ?? false;
  const currentSeq = c105?.relaySequence ?? [];

  const ambientColor = isExitUnlocked ? '#10b981' : '#c084fc';

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ede9fe" />
      <directionalLight position={[2, 8, 3]} intensity={1.3} castShadow color="#ffffff" />
      <pointLight position={[0, 4.2, 0]} intensity={1.8} distance={15} color={ambientColor} />

      {/* Room Shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0c0a1a" roughness={0.6} metalness={0.4} />
      </mesh>
      <gridHelper args={[14, 14, '#4c1d95', '#1e1b4b']} position={[0, 0.005, 0]} />

      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#080614" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.4, -6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#17122b" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.4, 6.8]}>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#17122b" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#17122b" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[6.8, 2.4, 0]}>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#17122b" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Left Wall: Chronometer Diagnostics Terminal */}
      <group position={[-6.55, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ interactableId: 'c105_chronometer' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.1, 0.05]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.2, 0.04]}>
          <Text fontSize={0.08} color="#c084fc" anchorX="center" anchorY="middle">
            // TEMPORAL LOG AUDIT //
          </Text>
        </group>
        <group position={[0, -0.1, 0.04]}>
          <Text fontSize={0.06} maxWidth={1.3} lineHeight={1.4} color="#e2e8f0" anchorX="center" anchorY="middle">
            {"Official manual claims Alpha -> Beta -> Omega.\nTelemetry proves Omega fired BEFORE Beta!\nCorrect sequence: Alpha -> Omega -> Beta."}
          </Text>
        </group>
      </group>

      {/* Center Reactor Relays: Alpha, Omega, Beta */}
      <group position={[-2.5, 1.0, 0]} userData={{ interactableId: 'c105_relay_alpha' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.4, 0.4]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.22]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color={currentSeq.includes('alpha') ? '#10b981' : '#a855f7'} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.11} color="#c084fc" anchorX="center" anchorY="middle">
            RELAY ALPHA
          </Text>
        </group>
      </group>

      <group position={[0, 1.0, 0]} userData={{ interactableId: 'c105_relay_omega' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.4, 0.4]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.22]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color={currentSeq.includes('omega') ? '#10b981' : '#a855f7'} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.11} color="#c084fc" anchorX="center" anchorY="middle">
            RELAY OMEGA
          </Text>
        </group>
      </group>

      <group position={[2.5, 1.0, 0]} userData={{ interactableId: 'c105_relay_beta' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.4, 0.4]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 0.22]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color={currentSeq.includes('beta') ? '#10b981' : '#a855f7'} />
        </mesh>
        <group position={[0, 0.9, 0]}>
          <Text fontSize={0.11} color="#c084fc" anchorX="center" anchorY="middle">
            RELAY BETA
          </Text>
        </group>
      </group>

      {/* Right Wall: Timeline Sequencer Terminal */}
      <group position={[6.55, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'c105_terminal' }}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.2, 0.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        <group position={[0, 0.2, 0.24]}>
          <Text fontSize={0.09} color="#c084fc" anchorX="center" anchorY="middle">
            TIMELINE STATE TERMINAL
          </Text>
        </group>
        <group position={[0, -0.1, 0.24]}>
          <Text fontSize={0.08} color={isRuleOverridden ? '#10b981' : '#f59e0b'} anchorX="center" anchorY="middle">
            {isRuleOverridden ? '● RULE #05: REWRITTEN [EMPIRICAL ORDER]' : '○ RULE #05: CONSTRAINED [LINEAR LOCK]'}
          </Text>
        </group>
      </group>

      {/* Exit Gate */}
      <group position={[0, 0, -6.6]} userData={{ interactableId: 'exit_door_105' }}>
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
            {isExitUnlocked
              ? 'CAUSALITY ENGAGED // ENTER FINAL SANCTUM 106'
              : isSequenced
              ? 'RELAYS SEQUENCED // OVERRIDE RULE #05'
              : 'REACTOR SEALED // SEQUENCE RELAYS'}
          </Text>
        </group>
      </group>
    </group>
  );
};
