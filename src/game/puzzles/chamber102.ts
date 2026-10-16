import { Chamber102State, SignalChannel } from '../types';

/**
 * Deterministic PRNG for seeded puzzle variations.
 * Ensures that any given seed produces a guaranteed solvable, reproducible puzzle.
 */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const FREQUENCY_PRESETS = [433, 868, 915] as const;
export const CHANNEL_PRESETS: SignalChannel[] = ['ALPHA', 'BETA', 'GAMMA'];

export function createChamber102InitialState(seed = 102): Chamber102State {
  const rng = seededRandom(seed);

  // Derive target frequency and channel from seed
  const freqIndex = Math.floor(rng() * FREQUENCY_PRESETS.length);
  const chanIndex = Math.floor(rng() * CHANNEL_PRESETS.length);

  const targetFreq = FREQUENCY_PRESETS[freqIndex] ?? 868;
  const targetChan = CHANNEL_PRESETS[chanIndex] ?? 'BETA';

  // Alternative frequency for the non-resonance core
  const altFreq = FREQUENCY_PRESETS[(freqIndex + 1) % FREQUENCY_PRESETS.length] ?? 433;

  return {
    seed,
    movableObjects: {
      core_heavy: {
        id: 'core_heavy',
        name: 'Heavy Flux Core #A',
        mass: 25, // kg - satisfies mass threshold
        frequency: altFreq,
        color: '#f59e0b', // Amber
        position: [-2.2, 0.4, 0.5],
        isCarried: false,
        placedOnPlateId: null,
      },
      core_resonance: {
        id: 'core_resonance',
        name: 'Harmonic Cell #B',
        mass: 8, // kg - lightweight
        frequency: targetFreq, // Matches the secret frequency!
        color: '#8b5cf6', // Violet
        position: [2.2, 0.4, 0.5],
        isCarried: false,
        placedOnPlateId: null,
      },
    },
    pressurePlates: {
      plate_mass: {
        id: 'plate_mass',
        name: 'Plate A: Kinetic Inductor',
        position: [-2.2, 0.04, -3.2],
        label: 'LOAD CELL // MIN 20 KG',
        isDepressed: false,
        currentObjectId: null,
        satisfied: false,
      },
      plate_harmonic: {
        id: 'plate_harmonic',
        name: 'Plate B: Substrate Transceiver',
        position: [2.2, 0.04, -3.2],
        label: 'SURFACE TRANSDUCER // LOAD REQ.', // Deceptive text
        isDepressed: false,
        currentObjectId: null,
        satisfied: false,
      },
    },
    circuit: {
      selectedFrequency: FREQUENCY_PRESETS[(freqIndex + 2) % FREQUENCY_PRESETS.length] ?? 433,
      targetFrequency: targetFreq,
      routingChannel: CHANNEL_PRESETS[(chanIndex + 1) % CHANNEL_PRESETS.length] ?? 'ALPHA',
      targetChannel: targetChan,
      isCircuitClosed: false,
    },
    exitDoorLocked: true,
    puzzleSolved: false,
  };
}

/**
 * Validates Chamber 102 state deterministically:
 * 1. Plate A must have an object with mass >= 20kg.
 * 2. Plate B must have an object whose frequency matches targetFrequency.
 * 3. Signal console must be routed to targetChannel AND selectedFrequency == targetFrequency.
 */
export function evaluateChamber102Puzzle(state102: Chamber102State): {
  plateMassSatisfied: boolean;
  plateHarmonicSatisfied: boolean;
  circuitClosed: boolean;
  isFullySolved: boolean;
} {
  const plateMassObjId = state102.pressurePlates.plate_mass?.currentObjectId;
  const plateHarmonicObjId = state102.pressurePlates.plate_harmonic?.currentObjectId;

  const plateMassObj = plateMassObjId ? state102.movableObjects[plateMassObjId] : null;
  const plateHarmonicObj = plateHarmonicObjId ? state102.movableObjects[plateHarmonicObjId] : null;

  // Plate A requires >= 20 kg
  const plateMassSatisfied = !!(plateMassObj && plateMassObj.mass >= 20);

  // Circuit requires matching frequency and channel
  const circuitClosed =
    state102.circuit.selectedFrequency === state102.circuit.targetFrequency &&
    state102.circuit.routingChannel === state102.circuit.targetChannel;

  // Plate B requires the resonant frequency cell AND the circuit being properly tuned
  const plateHarmonicSatisfied = !!(
    plateHarmonicObj &&
    plateHarmonicObj.frequency === state102.circuit.targetFrequency &&
    circuitClosed
  );

  const isFullySolved = plateMassSatisfied && plateHarmonicSatisfied && circuitClosed;

  return {
    plateMassSatisfied,
    plateHarmonicSatisfied,
    circuitClosed,
    isFullySolved,
  };
}
