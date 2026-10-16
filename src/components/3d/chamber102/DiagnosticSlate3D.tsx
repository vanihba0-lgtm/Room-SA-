import React from 'react';
import { Text } from '@react-three/drei';

interface DiagnosticSlate3DProps {
  targetFrequency: number;
  targetChannel: string;
}

export const DiagnosticSlate3D: React.FC<DiagnosticSlate3DProps> = ({
  targetFrequency,
  targetChannel,
}) => {
  return (
    <group
      position={[-6.55, 1.8, 0]}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ interactableId: 'diagnostic_slate_102' }}
    >
      {/* Heavy Steel Backplate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.1, 0.05]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Glass / Holographic Display Area */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial
          color="#061226"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Advisory Header */}
      <group position={[0, 0.36, 0.04]}>
        <Text
          fontSize={0.075}
          color="#f43f5e"
          anchorX="center"
          anchorY="middle"
        >
          // ENGINEERING NOTICE: DECEPTION AUDIT //
        </Text>
      </group>

      {/* Advisory Body */}
      <group position={[0, 0.05, 0.04]}>
        <Text
          fontSize={0.055}
          maxWidth={1.3}
          lineHeight={1.4}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
        >
          {`Plate B (Substrate Transceiver) does NOT measure mass!\n\nThe stamped weight label is deliberate deception.\nIt requires resonant excitation matching:\nFrequency: ${targetFrequency} kHz  |  Channel: ${targetChannel}\n\nPlace the Harmonic Cell and calibrate the console.`}
        </Text>
      </group>

      {/* Footer prompt */}
      <group position={[0, -0.38, 0.04]}>
        <Text
          fontSize={0.055}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          [ CLICK OR PRESS 'E' TO INSPECT ADVISORY ]
        </Text>
      </group>
    </group>
  );
};
