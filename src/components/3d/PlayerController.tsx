import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';

export interface InteractionTargetInfo {
  id: string;
  name: string;
  actionText: string;
  inspectText: string;
  distance: number;
}

interface PlayerControllerProps {
  isPaused: boolean;
  onLockChange: (isLocked: boolean) => void;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
  onHoverTarget: (target: InteractionTargetInfo | null) => void;
  doorLocked: boolean;
  hasKey: boolean;
  regulatorState: string;
}

const INTERACTION_OBJECTS = [
  {
    id: 'pedestal',
    name: 'Specimen Pedestal',
    actionText: 'Retrieve Brass Key #101',
    inspectText: 'Inspect Specimen Pedestal',
    pos: new Vector3(0, 1.2, 0),
    radius: 1.4,
  },
  {
    id: 'exit_door',
    name: 'Reinforced Blast Door',
    actionText: 'Operate Blast Door',
    inspectText: 'Inspect Plaque & Lock',
    pos: new Vector3(0, 2.0, -5.8),
    radius: 2.2,
  },
  {
    id: 'terminal',
    name: 'Anomaly Logic Terminal',
    actionText: 'Access Logic Terminal',
    inspectText: 'Inspect Console',
    pos: new Vector3(5.7, 1.8, 0),
    radius: 1.8,
  },
  {
    id: 'observation_slate',
    name: 'Observation Slate',
    actionText: 'Read Observation Slate',
    inspectText: 'Inspect Handwriting',
    pos: new Vector3(-5.7, 1.8, -1.5),
    radius: 1.8,
  },
  {
    id: 'power_regulator',
    name: 'Substrate Power Regulator',
    actionText: 'Toggle Power Regulator',
    inspectText: 'Inspect Breaker Circuit',
    pos: new Vector3(-5.7, 1.8, 1.5),
    radius: 1.8,
  },
];

export const PlayerController: React.FC<PlayerControllerProps> = ({
  isPaused,
  onLockChange,
  onInteract,
  onInspect,
  onHoverTarget,
  doorLocked,
  hasKey,
  regulatorState,
}) => {
  const { camera } = useThree();

  // Position & movement physics state
  const pos = useRef(new Vector3(0, 1.7, 3.5)); // Initial player spawn point
  const velocityY = useRef(0);
  const isGrounded = useRef(true);

  // Input keys
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
  });

  const currentHoverRef = useRef<InteractionTargetInfo | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'Space':
          if (isGrounded.current) {
            velocityY.current = 6.0; // Jump impulse
            isGrounded.current = false;
          }
          break;
        case 'KeyE':
          if (currentHoverRef.current) {
            onInteract(currentHoverRef.current.id);
          }
          break;
        case 'KeyR':
          if (currentHoverRef.current) {
            onInspect(currentHoverRef.current.id);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };

    const handleClick = () => {
      // Primary mouse click interaction when locked
      if (document.pointerLockElement && currentHoverRef.current) {
        onInteract(currentHoverRef.current.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleClick);
    };
  }, [isPaused, onInteract, onInspect]);

  // Per-frame physics, movement, and raycasting
  useFrame((_, delta) => {
    if (isPaused) return;

    // 1. Calculate movement direction relative to camera yaw
    const forward = new Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new Vector3();
    right.crossVectors(camera.up, forward).normalize().negate();

    const moveDir = new Vector3();
    if (keys.current.forward) moveDir.add(forward);
    if (keys.current.backward) moveDir.sub(forward);
    if (keys.current.right) moveDir.add(right);
    if (keys.current.left) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      const speed = keys.current.sprint ? 5.8 : 3.8;
      pos.current.addScaledVector(moveDir, speed * delta);
    }

    // 2. Vertical gravity & jumping
    velocityY.current -= 18.0 * delta; // Gravity
    pos.current.y += velocityY.current * delta;

    if (pos.current.y <= 1.7) {
      pos.current.y = 1.7; // Floor collision height
      velocityY.current = 0;
      isGrounded.current = true;
    }

    // 3. Chamber room boundary collisions (12m x 12m chamber)
    const minX = -5.2;
    const maxX = 5.2;
    const minZ = doorLocked ? -5.2 : -8.5; // Walk through door if unlocked!
    const maxZ = 5.2;

    pos.current.x = Math.max(minX, Math.min(maxX, pos.current.x));
    pos.current.z = Math.max(minZ, Math.min(maxZ, pos.current.z));

    // Pedestal center cylinder collision (radius ~0.7)
    const distToPedestal = Math.hypot(pos.current.x, pos.current.z);
    if (distToPedestal < 0.85) {
      const angle = Math.atan2(pos.current.z, pos.current.x);
      pos.current.x = Math.cos(angle) * 0.85;
      pos.current.z = Math.sin(angle) * 0.85;
    }

    // Update camera position
    camera.position.copy(pos.current);

    // 4. Raycast from camera center to detect interactive targets
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);

    let bestTarget: InteractionTargetInfo | null = null;
    let closestDist = 3.8; // Maximum interaction range in meters

    for (const obj of INTERACTION_OBJECTS) {
      const toObj = new Vector3().subVectors(obj.pos, camera.position);
      const dist = toObj.length();

      if (dist <= closestDist) {
        // Calculate angle between camera aim direction and vector to object
        toObj.normalize();
        const dot = camDir.dot(toObj);

        // Dot product threshold corresponds to aiming within crosshair cone
        if (dot > 0.88) {
          closestDist = dist;
          let customAction = obj.actionText;
          if (obj.id === 'pedestal' && hasKey) {
            customAction = 'Inspect Empty Cradle';
          } else if (obj.id === 'power_regulator') {
            customAction =
              regulatorState === 'transformed'
                ? 'Disengage Power Regulator'
                : 'Engage Power Regulator';
          }

          bestTarget = {
            id: obj.id,
            name: obj.name,
            actionText: customAction,
            inspectText: obj.inspectText,
            distance: dist,
          };
        }
      }
    }

    if (
      bestTarget?.id !== currentHoverRef.current?.id ||
      bestTarget?.actionText !== currentHoverRef.current?.actionText
    ) {
      currentHoverRef.current = bestTarget;
      onHoverTarget(bestTarget);
    }
  });

  return (
    <PointerLockControls
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
};
