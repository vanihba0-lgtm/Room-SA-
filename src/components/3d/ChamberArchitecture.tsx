import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface ChamberArchitectureProps {
  isDeceptiveRule: boolean;
  realityShiftCount: number;
}

export const ChamberArchitecture: React.FC<ChamberArchitectureProps> = ({
  isDeceptiveRule,
  realityShiftCount,
}) => {
  const ambientTrimColor = isDeceptiveRule ? '#f59e0b' : '#38bdf8';
  const wallPanelColor = '#1e293b';
  const columnColor = '#334155';

  return (
    <group>
      {/* ========================================================= */}
      {/* 1. PHYSICAL RAPIER COLLISION BOUNDARIES FOR ROOM */}
      {/* ========================================================= */}
      <RigidBody type="fixed" colliders={false}>
        {/* Floor collider */}
        <CuboidCollider args={[6.5, 0.5, 6.5]} position={[0, -0.5, 0]} />
        {/* Ceiling collider */}
        <CuboidCollider args={[6.5, 0.5, 6.5]} position={[0, 5.5, 0]} />
        {/* North Wall (Door side) - leaves door opening at center */}
        <CuboidCollider args={[2.2, 3, 0.5]} position={[-3.8, 2.5, -6.3]} />
        <CuboidCollider args={[2.2, 3, 0.5]} position={[3.8, 2.5, -6.3]} />
        <CuboidCollider args={[2.0, 1, 0.5]} position={[0, 4.5, -6.3]} />
        {/* South Wall */}
        <CuboidCollider args={[6.5, 3, 0.5]} position={[0, 2.5, 6.3]} />
        {/* East Wall (Terminal side) */}
        <CuboidCollider args={[0.5, 3, 6.5]} position={[6.3, 2.5, 0]} />
        {/* West Wall (Slate & Breaker side) */}
        <CuboidCollider args={[0.5, 3, 6.5]} position={[-6.3, 2.5, 0]} />
        {/* Pedestal Obstacle Collider in the center */}
        <CuboidCollider args={[0.6, 0.7, 0.6]} position={[0, 0.7, 0]} />
      </RigidBody>

      {/* ========================================================= */}
      {/* 2. VISUAL ROOM GEOMETRY & MATERIALS */}
      {/* ========================================================= */}

      {/* Main Floor Plating (12m x 12m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color="#162032"
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Center Hexagonal Inlay Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[2.2, 6]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Floor Neon Perimeter Channels (Cyan/Amber) */}
      {/* North channel */}
      <mesh position={[0, 0.01, -5.6]}>
        <planeGeometry args={[11, 0.08]} />
        <meshBasicMaterial color={ambientTrimColor} />
      </mesh>
      {/* South channel */}
      <mesh position={[0, 0.01, 5.6]}>
        <planeGeometry args={[11, 0.08]} />
        <meshBasicMaterial color={ambientTrimColor} />
      </mesh>
      {/* East channel */}
      <mesh position={[5.6, 0.01, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[11, 0.08]} />
        <meshBasicMaterial color={ambientTrimColor} />
      </mesh>
      {/* West channel */}
      <mesh position={[-5.6, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[11, 0.08]} />
        <meshBasicMaterial color={ambientTrimColor} />
      </mesh>

      {/* Ceiling (y = 5.0) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Industrial Ceiling Girders */}
      <mesh position={[0, 4.85, -2]}>
        <boxGeometry args={[12, 0.25, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 4.85, 2]}>
        <boxGeometry args={[12, 0.25, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[-2, 4.85, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.25, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[2, 4.85, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.25, 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* South Wall (Observation Bay with Glass Portals) */}
      <mesh position={[0, 2.5, 6.0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={wallPanelColor} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* South Wall Decorative Observation Grid */}
      <mesh position={[0, 2.5, 5.95]}>
        <boxGeometry args={[6, 2.2, 0.05]} />
        <meshStandardMaterial
          color="#0b1329"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[0, 2.5, 5.97]}>
        <planeGeometry args={[5.8, 2.0]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* North Wall (Door backdrop) */}
      <mesh position={[0, 2.5, -6.0]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={wallPanelColor} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* East Wall (Terminal wall) */}
      <mesh position={[6.0, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={wallPanelColor} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* West Wall (Slate & Breaker wall) */}
      <mesh position={[-6.0, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={wallPanelColor} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* 4 Heavy Structural Corner Pillars */}
      {/* North-West */}
      <mesh position={[-5.5, 2.5, -5.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 1]} />
        <meshStandardMaterial color={columnColor} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* North-East */}
      <mesh position={[5.5, 2.5, -5.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 1]} />
        <meshStandardMaterial color={columnColor} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* South-West */}
      <mesh position={[-5.5, 2.5, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 1]} />
        <meshStandardMaterial color={columnColor} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* South-East */}
      <mesh position={[5.5, 2.5, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 1]} />
        <meshStandardMaterial color={columnColor} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Vertical Cyan Strip Lights on Corner Pillars */}
      <mesh position={[-5.5, 2.5, -4.95]}>
        <boxGeometry args={[0.08, 4.2, 0.02]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[5.5, 2.5, -4.95]}>
        <boxGeometry args={[0.08, 4.2, 0.02]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[-5.5, 2.5, 4.95]}>
        <boxGeometry args={[0.08, 4.2, 0.02]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[5.5, 2.5, 4.95]}>
        <boxGeometry args={[0.08, 4.2, 0.02]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Top-Down Sun/Flood Light for bright crisp readability */}
      <directionalLight position={[2, 7, 3]} intensity={1.8} color="#f8fafc" />

      {/* Targeted Spotlights */}
      {/* North Blast Door Spotlight */}
      <spotLight
        position={[0, 4.4, -3.2]}
        target-position={[0, 2, -5.9]}
        intensity={3.2}
        color={isDeceptiveRule ? '#f59e0b' : '#34d399'}
        distance={9}
        angle={0.65}
      />
      {/* East Anomaly Terminal Spotlight */}
      <spotLight
        position={[3.5, 3.8, 0]}
        target-position={[5.8, 1.8, 0]}
        intensity={2.8}
        color="#38bdf8"
        distance={8}
        angle={0.55}
      />
      {/* West Observation Slate & Breaker Spotlight */}
      <spotLight
        position={[-3.5, 3.8, 0]}
        target-position={[-5.8, 1.8, 0]}
        intensity={2.8}
        color="#fde68a"
        distance={8}
        angle={0.55}
      />

      {/* Ambient Sci-Fi Fill Lights */}
      <ambientLight
        intensity={1.2 + Math.min(realityShiftCount * 0.15, 0.5)}
        color={isDeceptiveRule ? '#cbd5e1' : '#e0f2fe'}
      />
      <pointLight position={[0, 4.2, 0]} intensity={1.5} color="#f8fafc" distance={15} />
    </group>
  );
};
