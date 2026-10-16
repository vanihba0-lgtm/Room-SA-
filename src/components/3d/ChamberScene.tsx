import React from 'react';
import { Physics } from '@react-three/rapier';
import { ChamberArchitecture } from './ChamberArchitecture';
import { Door3D } from './Door3D';
import { Pedestal3D } from './Pedestal3D';
import { Terminal3D } from './Terminal3D';
import { ObservationSlate3D } from './ObservationSlate3D';
import { PowerMechanism3D } from './PowerMechanism3D';
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
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const isRuleDeceptive = state.rules['RULE_01']?.isDeceptive ?? true;
  const isDoorLocked = state.exit.isLocked;
  const powerRegulatorState = state.objects.power_regulator?.state ?? 'default';

  return (
    <>
      {/* Subtle Depth Fog */}
      <fog attach="fog" args={['#070d1a', 15, 35]} />

      <Physics gravity={[0, -18, 0]}>
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
        />
      </Physics>
    </>
  );
};
