import React from 'react';
import { Physics } from '@react-three/rapier';
import { ChamberArchitecture } from './ChamberArchitecture';
import { Door3D } from './Door3D';
import { Pedestal3D } from './Pedestal3D';
import { Terminal3D } from './Terminal3D';
import { ObservationSlate3D } from './ObservationSlate3D';
import { PowerMechanism3D } from './PowerMechanism3D';
import { Chamber102Scene } from './chamber102/Chamber102Scene';
import { Chamber103Scene } from './chambers/Chamber103Scene';
import { Chamber104Scene } from './chambers/Chamber104Scene';
import { Chamber105Scene } from './chambers/Chamber105Scene';
import { Chamber106Scene } from './chambers/Chamber106Scene';
import { PlayerController, InteractionTargetInfo } from './PlayerController';
import { TouchInputState } from './TouchControlsOverlay';
import { GameState } from '../../game/types';

interface ChamberSceneProps {
  state: GameState;
  isPaused: boolean;
  onLockChange: (isLocked: boolean) => void;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
  onHoverTarget: (target: InteractionTargetInfo | null) => void;
  touchInputRef?: React.MutableRefObject<TouchInputState>;
  isTouchDevice?: boolean;
}

export const ChamberScene: React.FC<ChamberSceneProps> = ({
  state,
  isPaused,
  onLockChange,
  onInteract,
  onInspect,
  onHoverTarget,
  touchInputRef,
  isTouchDevice = false,
}) => {
  const currentRoom = state.currentRoomId;
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const isRuleDeceptive = state.rules['RULE_01']?.isDeceptive ?? true;

  let isDoorLocked = state.exit.isLocked;
  if (currentRoom === 'chamber_102') isDoorLocked = state.chamber102.exitDoorLocked;
  else if (currentRoom === 'chamber_103') isDoorLocked = !state.chamber103?.exitUnlocked;
  else if (currentRoom === 'chamber_104') isDoorLocked = !state.chamber104?.exitUnlocked;
  else if (currentRoom === 'chamber_105') isDoorLocked = !state.chamber105?.exitUnlocked;
  else if (currentRoom === 'chamber_106') isDoorLocked = !state.chamber106?.primeDirectiveOverridden;

  const powerRegulatorState = state.objects.power_regulator?.state ?? 'default';

  const renderChamberRoom = () => {
    switch (currentRoom) {
      case 'chamber_102':
        return <Chamber102Scene state={state} onInteract={onInteract} onInspect={onInspect} />;
      case 'chamber_103':
        return <Chamber103Scene state={state} onInteract={onInteract} onInspect={onInspect} />;
      case 'chamber_104':
        return <Chamber104Scene state={state} onInteract={onInteract} onInspect={onInspect} />;
      case 'chamber_105':
        return <Chamber105Scene state={state} onInteract={onInteract} onInspect={onInspect} />;
      case 'chamber_106':
        return <Chamber106Scene state={state} onInteract={onInteract} onInspect={onInspect} />;
      default:
        return (
          <>
            <ChamberArchitecture
              isDeceptiveRule={isRuleDeceptive}
              realityShiftCount={state.realityShiftCount}
            />
            <Door3D isLocked={isDoorLocked} isDeceptiveRule={isRuleDeceptive} />
            <Pedestal3D hasKey={hasBrassKey} />
            <Terminal3D isDeceptiveRule={isRuleDeceptive} />
            <ObservationSlate3D />
            <PowerMechanism3D isEngaged={powerRegulatorState === 'transformed'} />
          </>
        );
    }
  };

  return (
    <>
      <fog attach="fog" args={['#070d1a', 15, 35]} />

      <Physics gravity={[0, -18, 0]}>
        {renderChamberRoom()}

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
          touchInputRef={touchInputRef}
          isTouchDevice={isTouchDevice}
        />
      </Physics>
    </>
  );
};
