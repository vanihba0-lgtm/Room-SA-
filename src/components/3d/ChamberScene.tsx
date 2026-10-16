import React from 'react';
import { Physics } from '@react-three/rapier';
import { ChamberArchitecture } from './ChamberArchitecture';
import { Door3D } from './Door3D';
import { Pedestal3D } from './Pedestal3D';
import { Terminal3D } from './Terminal3D';
import { ObservationSlate3D } from './ObservationSlate3D';
import { PowerMechanism3D } from './PowerMechanism3D';
import { Chamber102Scene } from './chamber102/Chamber102Scene';
import { PlayerController, InteractionTargetInfo } from './PlayerController';
import { GameState } from '../../game/types';

interface ChamberSceneProps {
  state: GameState;
  isPaused: boolean;
  onLockChange: (isLocked: boolean) => void;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
  onHoverTarget: (target: InteractionTargetInfo | null) => void;
}

export const ChamberScene: React.FC<ChamberSceneProps> = ({
  state,
  isPaused,
  onLockChange,
  onInteract,
  onInspect,
  onHoverTarget,
}) => {
  const isChamber102 = state.currentRoomId === 'chamber_102';
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const isRuleDeceptive = state.rules['RULE_01']?.isDeceptive ?? true;
  const isDoorLocked = isChamber102 ? state.chamber102.exitDoorLocked : state.exit.isLocked;
  const powerRegulatorState = state.objects.power_regulator?.state ?? 'default';

  return (
    <>
      {/* Subtle Depth Fog */}
      <fog attach="fog" args={['#070d1a', 15, 35]} />

      <Physics gravity={[0, -18, 0]}>
        {isChamber102 ? (
          /* Chamber 102: The Signal Foundry */
          <Chamber102Scene
            state={state}
            onInteract={onInteract}
            onInspect={onInspect}
          />
        ) : (
          /* Chamber 101: The Obvious Lie */
          <>
            {/* Physical & Visual Room Shell */}
            <ChamberArchitecture
              isDeceptiveRule={isRuleDeceptive}
              realityShiftCount={state.realityShiftCount}
            />

            {/* 1. Monolithic Blast Door */}
            <Door3D
              isLocked={isDoorLocked}
              isDeceptiveRule={isRuleDeceptive}
            />

            {/* 2. Specimen Pedestal & Floating Brass Key */}
            <Pedestal3D
              hasKey={hasBrassKey}
            />

            {/* 3. Anomaly Terminal Console */}
            <Terminal3D
              isDeceptiveRule={isRuleDeceptive}
            />

            {/* 4. Observation Slate */}
            <ObservationSlate3D />

            {/* 5. Substrate Power Regulator Mechanism */}
            <PowerMechanism3D
              isEngaged={powerRegulatorState === 'transformed'}
            />
          </>
        )}

        {/* First-Person Player Controller */}
        <PlayerController
          isPaused={isPaused}
          onLockChange={onLockChange}
          onInteract={onInteract}
          onInspect={onInspect}
          onHoverTarget={onHoverTarget}
          doorLocked={isDoorLocked}
          hasKey={hasBrassKey}
          regulatorState={powerRegulatorState}
          state={state}
        />
      </Physics>
    </>
  );
};
