import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../app/App';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { getActiveObjective } from '../game/progression/objectives';
import { loadCampaignSave, markChamberCompleted } from '../game/progression/campaign';

describe('ROOM S A — Mega Prompt 50 Experience Overhaul & 6-Chamber Campaign', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders TitleScreen when initialPhase="title"', () => {
    render(<App initialPhase="title" />);
    expect(screen.getByRole('dialog', { name: /Game Title Screen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /START NEW GAME/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CHAMBER SELECT/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SETTINGS & AUDIO/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ABOUT & CREDITS/i })).toBeInTheDocument();
  });

  it('navigates to IntroCinematic when starting new game without saved intro', () => {
    render(<App initialPhase="title" />);
    fireEvent.click(screen.getByRole('button', { name: /START NEW GAME/i }));
    // Intro cinematic briefing displays
    expect(screen.getByRole('dialog', { name: /Investigator Entry Log/i })).toBeInTheDocument();
    expect(screen.getByText(/BRIEFING 01 \/\/ 04/i)).toBeInTheDocument();
  });

  it('progresses through IntroCinematic and enters Chamber 101', () => {
    render(<App initialPhase="intro" />);
    expect(screen.getByRole('dialog', { name: /Investigator Entry Log/i })).toBeInTheDocument();
    // Click skip briefing
    const skipBtn = screen.getByRole('button', { name: /SKIP BRIEFING/i });
    fireEvent.click(skipBtn);

    // Enters active chamber
    expect(screen.getByText(/CHAMBER 101 \/\/ THE OBVIOUS LIE/i)).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /Training Guide/i })).toBeInTheDocument();
  });

  it('opens and closes HintModal, LogbookModal, SettingsModal, and AboutModal', () => {
    render(<App initialPhase="playing" />);

    // Open Hint Modal
    fireEvent.click(screen.getByRole('button', { name: /Open Progressive Hints/i }));
    expect(screen.getByRole('dialog', { name: /Contextual Guidance/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close hints/i }));

    // Open Logbook Modal
    fireEvent.click(screen.getByRole('button', { name: /Open Telemetry Logbook/i }));
    expect(screen.getByRole('dialog', { name: /Investigator Dossier & Telemetry Archive/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close logbook/i }));

    // Open Settings Modal
    fireEvent.click(screen.getByRole('button', { name: /Open Settings/i }));
    expect(screen.getByRole('dialog', { name: /System Settings & Audio/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close settings/i }));
  });

  it('evaluates active objectives deterministically across game state', () => {
    let state = createChamber101InitialState();
    const obj1 = getActiveObjective(state);
    expect(obj1).not.toBeNull();
    expect(obj1?.id).toBe('c101_obj_inspect_slate');

    // Inspect slate
    state = engineReducer(state, {
      type: 'INSPECT_OBJECT',
      payload: { objectId: 'observation_slate' },
    }).nextState;

    const obj2 = getActiveObjective(state);
    expect(obj2?.id).toBe('c101_obj_collect_key');
  });

  it('solves all 6 chambers sequentially in the deterministic engine', () => {
    let state = createChamber101InitialState();

    // Chamber 101: Key -> Override -> Unlock Door -> Step Through Door
    state = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key', sourceObjectId: 'pedestal' },
    }).nextState;
    state = engineReducer(state, {
      type: 'APPLY_VALIDATED_RULE',
      payload: {
        proposal: {
          targetRuleId: 'RULE_01',
          proposedStatement: 'Doors yield to brass keys.',
          newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
          operation: 'OVERRIDE_PREDICATE',
          targetCondition: 'brass',
        },
      },
    }).nextState;
    // 1st click: Unlocks blast door
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door' },
    }).nextState;
    expect(state.exit.isLocked).toBe(false);

    // 2nd click: Steps through unlocked door to Chamber 102
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door' },
    }).nextState;

    // Chamber 102: Signal Foundry
    expect(state.currentRoomId).toBe('chamber_102');
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'core_heavy' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'plate_mass' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'core_resonance' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'plate_harmonic' },
    }).nextState;
    state = engineReducer(state, {
      type: 'CONFIGURE_CIRCUIT',
      payload: {
        frequency: state.chamber102.circuit.targetFrequency,
        channel: state.chamber102.circuit.targetChannel,
      },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door_102' },
    }).nextState;

    // Chamber 103: The Gravity Archive
    expect(state.currentRoomId).toBe('chamber_103');
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c103_ballast' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c103_terminal' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door_103' },
    }).nextState;

    // Chamber 104: Zero-Day Vault
    expect(state.currentRoomId).toBe('chamber_104');
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c104_dispenser' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c104_crypto' },
    }).nextState;
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door_104' },
    }).nextState;

    // Chamber 105: The Last Witness (Grand Finale)
    expect(state.currentRoomId).toBe('chamber_105');
    // Step 1: Reconstruct Material Axiom at Station 1
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_station_material' },
    }).nextState;
    expect(state.chamber105?.stationMaterialSolved).toBe(true);

    // Step 2: Reconstruct Signal Resonance at Station 2
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_station_signal' },
    }).nextState;
    expect(state.chamber105?.stationSignalSolved).toBe(true);

    // Step 3: Restore Mara Voss Incident Record at Station 3
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_station_archive' },
    }).nextState;
    expect(state.chamber105?.stationArchiveSolved).toBe(true);

    // Step 4: Validate Parity Checksum at Station 4
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_station_security' },
    }).nextState;
    expect(state.chamber105?.stationSecuritySolved).toBe(true);
    expect(state.chamber105?.masterCompilerUnlocked).toBe(true);

    // Step 5: Synthesize Truth at Master Compiler Apparatus
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_master_compiler' },
    }).nextState;
    expect(state.chamber105?.truthRevealed).toBe(true);

    // Step 6: Execute Ending B (Rewrite the Rules)
    const escapeRes = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'c105_ending_rewrite' },
    });
    expect(escapeRes.success).toBe(true);
    expect(escapeRes.nextState.status).toBe('escaped');
    expect(escapeRes.nextState.chamber105?.chosenEnding).toBe('rewrite');
  });

  it('tracks campaign save progression when chambers are completed', () => {
    let save = loadCampaignSave();
    expect(save.completedChambers).toEqual([]);
    expect(save.unlockedChambers).toEqual(['chamber_101']);

    save = markChamberCompleted(save, 'chamber_101');
    expect(save.completedChambers).toContain('chamber_101');
    expect(save.unlockedChambers).toContain('chamber_102');
  });
});

