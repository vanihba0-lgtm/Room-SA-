import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface Chamber102ArchitectureProps {
  plateMassSatisfied: boolean;
  plateHarmonicSatisfied: boolean;
  circuitClosed: boolean;
  puzzleSolved: boolean;
}

export const Chamber102Architecture: React.FC<Chamber102ArchitectureProps> = ({
  plateMassSatisfied,
  plateHarmonicSatisfied,
  circuitClosed,
  puzzleSolved,
}) => {
  const conduitAmberRef = useRef<Mesh>(null);
  const conduitVioletRef = useRef<Mesh>(null);
  const beaconRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (conduitAmberRef.current) {
      // Pulse brightness if satisfied
      const mat = conduitAmberRef.current.material as any;
      if (mat && mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = plateMassSatisfied ? 1.8 + Math.sin(t * 5) * 0.4 : 0.6 + Math.sin(t * 2) * 0.2;
      }
    }
    if (conduitVioletRef.current) {
      const mat = conduitVioletRef.current.material as any;
      if (mat && mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = plateHarmonicSatisfied ? 2.0 + Math.sin(t * 6) * 0.5 : 0.6 + Math.sin(t * 2) * 0.2;
      }
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 2.5;
    }
  });

  const ambientColor = puzzleSolved ? '#10b981' : '#0ea5e9';

  return (
    <group>
      {/* Dynamic Ambient & Directional Lighting */}
      <ambientLight intensity={0.45} color="#c7d2fe" />
      <directionalLight
        position={[4, 7, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        color="#f8fafc"
      />
      <pointLight position={[0, 4.2, 0]} intensity={1.5} distance={14} color="#60a5fa" />
      <pointLight position={[-3, 2, -3]} intensity={plateMassSatisfied ? 2.5 : 1.0} distance={7} color="#f59e0b" />
      <pointLight position={[3, 2, -3]} intensity={plateHarmonicSatisfied ? 2.5 : 1.0} distance={7} color={circuitClosed ? '#10b981' : '#a855f7'} />

      {/* Main Floor (14m x 14m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0b1120" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Floor Metallic Grid Tiles */}
      <gridHelper args={[14, 14, '#1e293b', '#0f172a']} position={[0, 0.005, 0]} />

      {/* Floor Amber Conduit Track (Left Side -> Door) */}
      <mesh
        ref={conduitAmberRef}
        position={[-2.2, 0.02, -4.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, 3]} />
        <meshStandardMaterial
          color="#d97706"
          emissive="#f59e0b"
          emissiveIntensity={plateMassSatisfied ? 1.8 : 0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Floor Violet Conduit Track (Right Side -> Door) */}
      <mesh
        ref={conduitVioletRef}
        position={[2.2, 0.02, -4.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.3, 3]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#8b5cf6"
          emissiveIntensity={plateHarmonicSatisfied ? 2.0 : 0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Ceiling Beam Gantry (Height 4.8m) */}
      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Industrial Structural Ceiling Beams */}
      {[-4, 0, 4].map((zOffset) => (
        <mesh key={zOffset} position={[0, 4.6, zOffset]}>
          <boxGeometry args={[14, 0.35, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Overhead Warning Hazard Beacon */}
      <group position={[0, 4.4, 0]} ref={beaconRef}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.25, 0.3, 12]} />
          <meshStandardMaterial
            color={ambientColor}
            emissive={ambientColor}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* Back Wall (Z = -6.8m) */}
      <mesh position={[0, 2.4, -6.8]} receiveShadow>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Front Wall (Z = +6.8m - Entrance side) */}
      <mesh position={[0, 2.4, 6.8]} receiveShadow>
        <boxGeometry args={[14, 4.8, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Left Wall (X = -6.8m) */}
      <mesh position={[-6.8, 2.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Right Wall (X = +6.8m) */}
      <mesh position={[6.8, 2.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4.8, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Decorative Wall Column Ribs */}
      {[-4, -2, 2, 4].map((z) => (
        <React.Fragment key={z}>
          <mesh position={[-6.55, 2.4, z]}>
            <boxGeometry args={[0.3, 4.7, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[6.55, 2.4, z]}>
            <boxGeometry args={[0.3, 4.7, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Wall Stenciled Signage: CHAMBER 102 // SIGNAL FOUNDRY */}
      <mesh position={[0, 4.0, -6.55]}>
        <boxGeometry args={[5, 0.5, 0.05]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};
