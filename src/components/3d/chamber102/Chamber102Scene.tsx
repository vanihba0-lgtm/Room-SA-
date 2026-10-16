import React from 'react';
import { GameState } from '../../../game/types';
import { evaluateChamber102Puzzle } from '../../../game/puzzles/chamber102';
import { Chamber102Architecture } from './Chamber102Architecture';
import { Door102_3D } from './Door102_3D';
import { PressurePlate3D } from './PressurePlate3D';
import { MovableCore3D } from './MovableCore3D';
import { CircuitConsole3D } from './CircuitConsole3D';
import { DiagnosticSlate3D } from './DiagnosticSlate3D';

interface Chamber102SceneProps {
  state: GameState;
  onInteract: (targetId: string) => void;
  onInspect: (targetId: string) => void;
}

export const Chamber102Scene: React.FC<Chamber102SceneProps> = ({
  state,
}) => {
  const c102 = state.chamber102;
  const evalResult = evaluateChamber102Puzzle(c102);

  const plateMass = c102.pressurePlates.plate_mass;
  const plateHarmonic = c102.pressurePlates.plate_harmonic;

  const coreHeavy = c102.movableObjects.core_heavy;
  const coreResonance = c102.movableObjects.core_resonance;

  const massObjName = plateMass?.currentObjectId
    ? c102.movableObjects[plateMass.currentObjectId]?.name
    : null;

  const harmonicObjName = plateHarmonic?.currentObjectId
    ? c102.movableObjects[plateHarmonic.currentObjectId]?.name
    : null;

  return (
    <group>
      {/* 1. Chamber 102 Room Geometry & Lighting */}
      <Chamber102Architecture
        plateMassSatisfied={evalResult.plateMassSatisfied}
        plateHarmonicSatisfied={evalResult.plateHarmonicSatisfied}
        circuitClosed={evalResult.circuitClosed}
        puzzleSolved={evalResult.isFullySolved}
      />

      {/* 2. Exit Blast Door */}
      <Door102_3D
        isLocked={c102.exitDoorLocked}
        plateMassSatisfied={evalResult.plateMassSatisfied}
        plateHarmonicSatisfied={evalResult.plateHarmonicSatisfied}
      />

      {/* 3. Pressure Plate A (Kinetic Inductor) */}
      {plateMass && (
        <PressurePlate3D
          id={plateMass.id}
          name={plateMass.name}
          label={plateMass.label}
          position={plateMass.position}
          isDepressed={plateMass.isDepressed}
          satisfied={evalResult.plateMassSatisfied}
          currentObjectName={massObjName}
        />
      )}

      {/* 4. Pressure Plate B (Substrate Transceiver) */}
      {plateHarmonic && (
        <PressurePlate3D
          id={plateHarmonic.id}
          name={plateHarmonic.name}
          label={plateHarmonic.label}
          position={plateHarmonic.position}
          isDepressed={plateHarmonic.isDepressed}
          satisfied={evalResult.plateHarmonicSatisfied}
          currentObjectName={harmonicObjName}
        />
      )}

      {/* 5. Movable Core A (Heavy Flux Core) */}
      {coreHeavy && (
        <MovableCore3D
          id={coreHeavy.id}
          name={coreHeavy.name}
          mass={coreHeavy.mass}
          frequency={coreHeavy.frequency}
          color={coreHeavy.color}
          position={coreHeavy.position}
          isCarried={coreHeavy.isCarried}
          placedOnPlateId={coreHeavy.placedOnPlateId}
        />
      )}

      {/* 6. Movable Core B (Harmonic Cell) */}
      {coreResonance && (
        <MovableCore3D
          id={coreResonance.id}
          name={coreResonance.name}
          mass={coreResonance.mass}
          frequency={coreResonance.frequency}
          color={coreResonance.color}
          position={coreResonance.position}
          isCarried={coreResonance.isCarried}
          placedOnPlateId={coreResonance.placedOnPlateId}
        />
      )}

      {/* 7. Signal Routing Console */}
      <CircuitConsole3D circuit={c102.circuit} />

      {/* 8. Diagnostic Maintenance Slate */}
      <DiagnosticSlate3D
        targetFrequency={c102.circuit.targetFrequency}
        targetChannel={c102.circuit.targetChannel}
      />
    </group>
  );
};
