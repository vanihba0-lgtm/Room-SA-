import React from 'react';
import { Text } from '@react-three/drei';
import { SignalCircuitState } from '../../../game/types';

interface CircuitConsole3DProps {
  circuit: SignalCircuitState;
}

export const CircuitConsole3D: React.FC<CircuitConsole3DProps> = ({ circuit }) => {
  const isTuned = circuit.isCircuitClosed;
  const statusColor = isTuned ? '#10b981' : '#f59e0b';

  return (
    <group position={[6.55, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ interactableId: 'circuit_console' }}>
      {/* Console Base / Frame */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Console Bevel Trim */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[1.5, 1.1, 0.05]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Upper Display (Channel & Oscilloscope) */}
      <mesh position={[0, 0.22, 0.23]}>
        <planeGeometry args={[1.3, 0.48]} />
        <meshStandardMaterial color="#05131e" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Screen Title & Channel */}
      <group position={[0, 0.35, 0.24]}>
        <Text
          fontSize={0.075}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          SIGNAL ROUTING CONSOLE // HARMONIC MATRIX
        </Text>
      </group>

      <group position={[0, 0.2, 0.24]}>
        <Text
          fontSize={0.11}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {`CHANNEL: [ ${circuit.routingChannel} ]  |  FREQ: [ ${circuit.selectedFrequency} kHz ]`}
        </Text>
      </group>

      {/* Lower Status Indicator Bar */}
      <mesh position={[0, -0.22, 0.23]}>
        <planeGeometry args={[1.3, 0.28]} />
        <meshStandardMaterial color="#0b1329" roughness={0.4} />
      </mesh>

      <group position={[0, -0.22, 0.24]}>
        <Text
          fontSize={0.09}
          color={statusColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {isTuned
            ? '● HARMONIC LOOP: CLOSED & SYNCHRONIZED'
            : '○ HARMONIC LOOP: OPEN // FREQ MISMATCH'}
        </Text>
      </group>

      {/* Interactive Push-Button Panel */}
      <mesh position={[0, -0.45, 0.25]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1.2, 0.15, 0.1]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Prompt Label Under Console */}
      <group position={[0, -0.7, 0.2]}>
        <Text
          fontSize={0.08}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          [ CLICK OR PRESS 'E' TO CYCLE FREQUENCY & CHANNEL ]
        </Text>
      </group>
    </group>
  );
};
