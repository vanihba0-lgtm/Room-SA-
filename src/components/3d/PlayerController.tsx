import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { GameState } from '../../game/types';
import { playFootstepSound, playHoverCue } from '../../services/audio/sound';

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
  state?: GameState;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({
  isPaused,
  onLockChange,
  onInteract,
  onInspect,
  onHoverTarget,
  doorLocked,
  hasKey,
  regulatorState,
  state,
}) => {
  const { camera } = useThree();

  const currentRoom = state?.currentRoomId ?? 'chamber_101';
  const lastRoomRef = useRef(currentRoom);

  // Position & movement physics state
  const pos = useRef(new Vector3(0, 1.7, 3.5)); // Initial player spawn point
  const velocityY = useRef(0);
  const isGrounded = useRef(true);

  // Spawn position adjustment on room transition
  useEffect(() => {
    if (lastRoomRef.current !== currentRoom) {
      lastRoomRef.current = currentRoom;
      if (currentRoom === 'chamber_102') {
        pos.current.set(0, 1.7, 4.5);
        camera.position.set(0, 1.7, 4.5);
      } else {
        pos.current.set(0, 1.7, 3.5);
        camera.position.set(0, 1.7, 3.5);
      }
    }
  }, [currentRoom, camera]);

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
          } else if (state?.carriedObjectId) {
            // If carrying an object and pressing E with no target, drop it
            onInteract(state.carriedObjectId);
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
      if (document.pointerLockElement) {
        if (currentHoverRef.current) {
          onInteract(currentHoverRef.current.id);
        } else if (state?.carriedObjectId) {
          onInteract(state.carriedObjectId);
        }
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
  }, [isPaused, onInteract, onInspect, state?.carriedObjectId]);

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
      if (isGrounded.current) {
        playFootstepSound();
      }
    }

    // 2. Vertical gravity & jumping
    velocityY.current -= 18.0 * delta; // Gravity
    pos.current.y += velocityY.current * delta;

    if (pos.current.y <= 1.7) {
      pos.current.y = 1.7; // Floor collision height
      velocityY.current = 0;
      isGrounded.current = true;
    }

    // 3. Chamber room boundary collisions
    if (currentRoom === 'chamber_102') {
      const minX = -6.0;
      const maxX = 6.0;
      const minZ = doorLocked ? -6.0 : -8.5; // Walk through door if unlocked
      const maxZ = 6.0;

      pos.current.x = Math.max(minX, Math.min(maxX, pos.current.x));
      pos.current.z = Math.max(minZ, Math.min(maxZ, pos.current.z));
    } else {
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
    }

    // Update camera position
    camera.position.copy(pos.current);

    // 4. Dynamic interaction targets based on active room
    const interactionObjects: Array<{
      id: string;
      name: string;
      actionText: string;
      inspectText: string;
      pos: Vector3;
      radius?: number;
    }> = [];

    if (currentRoom === 'chamber_102' && state) {
      const c102 = state.chamber102;
      const carriedId = state.carriedObjectId;

      // Heavy Core
      if (!c102.movableObjects.core_heavy?.isCarried) {
        const posArr = c102.movableObjects.core_heavy?.placedOnPlateId === 'plate_mass'
          ? [-2.2, 0.45, -3.2]
          : [-2.2, 0.4, 0.5];
        interactionObjects.push({
          id: 'core_heavy',
          name: 'Heavy Flux Core #A',
          actionText: 'Pick Up Heavy Flux Core #A (25kg)',
          inspectText: 'Inspect Heavy Core Specifications',
          pos: new Vector3(posArr[0], posArr[1], posArr[2]),
        });
      }

      // Harmonic Cell
      if (!c102.movableObjects.core_resonance?.isCarried) {
        const posArr = c102.movableObjects.core_resonance?.placedOnPlateId === 'plate_harmonic'
          ? [2.2, 0.45, -3.2]
          : [2.2, 0.4, 0.5];
        interactionObjects.push({
          id: 'core_resonance',
          name: 'Harmonic Cell #B',
          actionText: 'Pick Up Harmonic Cell #B (8kg)',
          inspectText: 'Inspect Harmonic Cell Specifications',
          pos: new Vector3(posArr[0], posArr[1], posArr[2]),
        });
      }

      // Plate A (Kinetic Inductor)
      interactionObjects.push({
        id: 'plate_mass',
        name: 'Plate A: Kinetic Inductor',
        actionText: carriedId
          ? 'Place Carried Core on Plate A'
          : c102.pressurePlates.plate_mass?.currentObjectId
          ? 'Examine Load Cell [Occupied]'
          : 'Examine Load Cell [Empty]',
        inspectText: 'Inspect Kinetic Inductor Mechanics',
        pos: new Vector3(-2.2, 0.2, -3.2),
      });

      // Plate B (Substrate Transceiver)
      interactionObjects.push({
        id: 'plate_harmonic',
        name: 'Plate B: Substrate Transceiver',
        actionText: carriedId
          ? 'Place Carried Core on Plate B'
          : c102.pressurePlates.plate_harmonic?.currentObjectId
          ? 'Examine Transceiver [Occupied]'
          : 'Examine Transceiver [Empty]',
        inspectText: 'Inspect Substrate Transceiver Mechanics',
        pos: new Vector3(2.2, 0.2, -3.2),
      });

      // Circuit Console
      interactionObjects.push({
        id: 'circuit_console',
        name: 'Signal Routing Console',
        actionText: `Tune Circuit [Chan ${c102.circuit.routingChannel} @ ${c102.circuit.selectedFrequency}kHz]`,
        inspectText: 'Inspect Signal Console Oscilloscope',
        pos: new Vector3(6.4, 1.6, 0),
      });

      // Diagnostic Slate
      interactionObjects.push({
        id: 'diagnostic_slate_102',
        name: 'Maintenance Advisory Slate',
        actionText: 'Read Maintenance Advisory',
        inspectText: 'Inspect Deception Audit Details',
        pos: new Vector3(-6.4, 1.8, 0),
      });

      // Exit Door 102
      interactionObjects.push({
        id: 'exit_door_102',
        name: 'Foundry Exit Blast Door',
        actionText: c102.exitDoorLocked
          ? 'Operate Blast Door [Interlocked]'
          : 'Step Through Blast Door [Clear]',
        inspectText: 'Inspect Dual Hydraulic Clamp Locks',
        pos: new Vector3(0, 2.0, -6.5),
      });
    } else if (currentRoom === 'chamber_103' && state) {
      const c103 = state.chamber103;
      interactionObjects.push(
        {
          id: 'c103_core',
          name: 'Magnetic Aerogel Core',
          actionText: c103?.surveyed ? 'Survey Active Core Telemetry' : 'Survey Archive Core Specimen',
          inspectText: 'Inspect Aerogel Buoyancy Data',
          pos: new Vector3(0, c103?.sensorActivated ? 3.5 : c103?.ballastInverted ? 2.0 : 0.8, 0),
        },
        {
          id: 'c103_ballast',
          name: 'Buoyancy Ballast Coil',
          actionText: c103?.ballastInverted ? 'Reset Gravity Ballast' : 'Invert Ballast Polarity [-9.81 m/s²]',
          inspectText: 'Inspect Anti-Gravity Coil Matrix',
          pos: new Vector3(0, 0.4, 0),
        },
        {
          id: 'c103_log',
          name: 'Archive Telemetry Datapad',
          actionText: 'Read Gravity Telemetry Log',
          inspectText: 'Inspect Archival Record #33',
          pos: new Vector3(-6.4, 1.8, 0),
        },
        {
          id: 'c103_terminal',
          name: 'Archive Rule Terminal',
          actionText: 'Rewrite Rule #03 (Buoyant Elevation)',
          inspectText: 'Access Terminal Logic Matrix',
          pos: new Vector3(6.4, 1.6, 0),
        },
        {
          id: 'c103_sensor',
          name: 'Ceiling Optical Sensor Receiver',
          actionText: c103?.sensorActivated
            ? 'Optical Sensor [Signal Locked // Vault Unsealed]'
            : 'Optical Sensor [Awaiting Elevated Core]',
          inspectText: 'Inspect Photodiode Circuit',
          pos: new Vector3(0, 4.4, 0),
        },
        {
          id: 'exit_door_103',
          name: 'Archive Vault Door',
          actionText: c103?.exitUnlocked ? 'Step Through to Sector 104' : 'Operate Vault Door [Sealed]',
          inspectText: 'Inspect Ceiling Optical Receiver',
          pos: new Vector3(0, 2.0, -6.5),
        }
      );
    } else if (currentRoom === 'chamber_104' && state) {
      const c104 = state.chamber104;
      interactionObjects.push(
        {
          id: 'c104_monitor',
          name: 'Security Telemetry Monitor',
          actionText: 'Audit Security Clearance',
          inspectText: 'Inspect Access Control Policy #04',
          pos: new Vector3(-6.4, 1.8, 0),
        },
        {
          id: 'c104_dispenser',
          name: 'Emergency Guest Token Dispenser',
          actionText: c104?.hasGuestToken
            ? 'Examine Dispenser Tray [Token Issued]'
            : c104?.telemetryAudited
            ? 'Dispense Guest Token #404'
            : 'Dispenser Unit [Audit Required]',
          inspectText: 'Inspect Emergency Release Lever',
          pos: new Vector3(6.4, 1.6, 0),
        },
        {
          id: 'c104_crypto',
          name: 'Cryptographic Parity Console',
          actionText: c104?.checksumMatched
            ? 'Parity Aligned [0x404 Verified]'
            : c104?.hasGuestToken
            ? 'Inject Token #404 & Align Parity'
            : 'Parity Console [Insert Token #404]',
          inspectText: 'Inspect Checksum Verification Laser',
          pos: new Vector3(0, 1.2, 0),
        },
        {
          id: 'exit_door_104',
          name: 'Cryptographic Vault Blast Door',
          actionText: c104?.exitUnlocked
            ? 'Advance to Sector 105'
            : c104?.checksumMatched
            ? 'Authorize & Open Vault Door'
            : 'Audit Vault Door [Root-4 Locked]',
          inspectText: 'Inspect Heavy Hydraulic Deadbolts',
          pos: new Vector3(0, 2.0, -6.5),
        }
      );
    } else if (currentRoom === 'chamber_105' && state) {
      const c105 = state.chamber105;
      interactionObjects.push(
        {
          id: 'c105_chronometer',
          name: 'Reactor Chronometer Diagnostics',
          actionText: 'Read Timestamp Telemetry',
          inspectText: 'Inspect Reactor Timestamp Record',
          pos: new Vector3(-6.4, 1.8, 0),
        },
        {
          id: 'c105_relay_alpha',
          name: 'Quantum Relay ALPHA',
          actionText: 'Flip Relay ALPHA',
          inspectText: 'Inspect Relay Contacts',
          pos: new Vector3(-2.5, 1.0, 0),
        },
        {
          id: 'c105_relay_omega',
          name: 'Quantum Relay OMEGA',
          actionText: 'Flip Relay OMEGA',
          inspectText: 'Inspect Relay Contacts',
          pos: new Vector3(0, 1.0, 0),
        },
        {
          id: 'c105_relay_beta',
          name: 'Quantum Relay BETA',
          actionText: 'Flip Relay BETA',
          inspectText: 'Inspect Relay Contacts',
          pos: new Vector3(2.5, 1.0, 0),
        },
        {
          id: 'c105_terminal',
          name: 'Timeline State Terminal',
          actionText: 'Rewrite Rule #05 (Temporal Order)',
          inspectText: 'Access Causal State Machine',
          pos: new Vector3(6.4, 1.6, 0),
        },
        {
          id: 'exit_door_105',
          name: 'Quantum Reactor Gate',
          actionText: c105?.exitUnlocked ? 'Enter Sanctum 106' : 'Operate Temporal Gate [Locked]',
          inspectText: 'Inspect Containment Barrier',
          pos: new Vector3(0, 2.0, -6.5),
        }
      );
    } else if (currentRoom === 'chamber_106' && state) {
      const c106 = state.chamber106;
      interactionObjects.push(
        {
          id: 'c106_prime_axiom',
          name: 'The Architect\'s Prime Axiom',
          actionText: 'Inspect Prime Axiom Core',
          inspectText: 'Examine Floating Core Matrix',
          pos: new Vector3(0, 2.0, 0),
        },
        {
          id: 'c106_console_spectrometry',
          name: 'Console 1: Spectrometry',
          actionText: 'Synthesize Spectrometry Matrix',
          inspectText: 'Inspect Spectrometric Sensor',
          pos: new Vector3(-3.8, 1.2, -3.8),
        },
        {
          id: 'c106_console_resonance',
          name: 'Console 2: Resonance',
          actionText: 'Synthesize Resonance Matrix',
          inspectText: 'Inspect Harmonic Antenna',
          pos: new Vector3(3.8, 1.2, -3.8),
        },
        {
          id: 'c106_console_parity',
          name: 'Console 3: Parity',
          actionText: 'Synthesize Parity Matrix',
          inspectText: 'Inspect Cryptographic Node',
          pos: new Vector3(-3.8, 1.2, 3.8),
        },
        {
          id: 'c106_console_chronology',
          name: 'Console 4: Chronology',
          actionText: 'Synthesize Chronology Matrix',
          inspectText: 'Inspect Temporal Sequencer',
          pos: new Vector3(3.8, 1.2, 3.8),
        },
        {
          id: 'c106_master_terminal',
          name: 'Master Compiler Terminal',
          actionText: c106?.primeDirectiveOverridden
            ? 'Prime Directive Overridden'
            : c106?.matricesSynthesized
            ? 'Rewrite Prime Directive (Dissolve Quarantine)'
            : 'Access Compiler [Synthesize Matrices First]',
          inspectText: 'Access Master Compiler',
          pos: new Vector3(7.0, 1.6, 0),
        },
        {
          id: 'exit_door_106',
          name: 'The Reality Liberation Portal',
          actionText: c106?.primeDirectiveOverridden ? 'Step Into Reality (Dissolve Simulation)' : 'Quarantine Portal [Sealed]',
          inspectText: 'Inspect Liberation Threshold',
          pos: new Vector3(0, 2.0, -7.0),
        }
      );
    } else {
      // Chamber 101 Objects
      interactionObjects.push(
        {
          id: 'pedestal',
          name: 'Specimen Pedestal',
          actionText: hasKey ? 'Inspect Empty Cradle' : 'Retrieve Brass Key #101',
          inspectText: 'Inspect Specimen Pedestal',
          pos: new Vector3(0, 1.2, 0),
        },
        {
          id: 'exit_door',
          name: 'Reinforced Blast Door',
          actionText: doorLocked ? 'Operate Blast Door' : 'Enter Chamber 102',
          inspectText: 'Inspect Plaque & Lock',
          pos: new Vector3(0, 2.0, -5.8),
        },
        {
          id: 'terminal',
          name: 'Anomaly Logic Terminal',
          actionText: 'Access Logic Terminal',
          inspectText: 'Inspect Console',
          pos: new Vector3(5.7, 1.8, 0),
        },
        {
          id: 'observation_slate',
          name: 'Observation Slate',
          actionText: 'Read Observation Slate',
          inspectText: 'Inspect Handwriting',
          pos: new Vector3(-5.7, 1.8, -1.5),
        },
        {
          id: 'power_regulator',
          name: 'Substrate Power Regulator',
          actionText:
            regulatorState === 'transformed'
              ? 'Disengage Power Regulator'
              : 'Engage Power Regulator',
          inspectText: 'Inspect Breaker Circuit',
          pos: new Vector3(-5.7, 1.8, 1.5),
        }
      );
    }

    // Raycast from camera center to detect interactive targets
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);

    let bestTarget: InteractionTargetInfo | null = null;
    let closestDist = 4.2; // Maximum interaction range in meters

    for (const obj of interactionObjects) {
      const toObj = new Vector3().subVectors(obj.pos, camera.position);
      const dist = toObj.length();

      if (dist <= closestDist) {
        toObj.normalize();
        const dot = camDir.dot(toObj);

        if (dot > 0.85) {
          closestDist = dist;
          bestTarget = {
            id: obj.id,
            name: obj.name,
            actionText: obj.actionText,
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
      if (bestTarget && bestTarget.id !== currentHoverRef.current?.id) {
        playHoverCue(bestTarget.id);
      }
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
