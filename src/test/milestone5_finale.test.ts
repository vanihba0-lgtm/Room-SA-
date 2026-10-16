import { describe, it, expect, beforeEach } from 'vitest';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { getActiveObjective } from '../game/progression/objectives';
import { soundManager } from '../services/audio/soundManager';
import { notificationManager } from '../services/notifications/notificationManager';
import { CAMPAIGN_CHAMBERS } from '../game/progression/campaign';
import { ALL_LOGBOOK_ENTRIES } from '../game/progression/logbook';

describe('MEGA PROMPT 5 — Chamber 105 (The Last Witness) & Full Finale Milestone', () => {
  beforeEach(() => {
    notificationManager.clear();
  });

  describe('Audio Subsystem — Clean Interaction & Ambient Buzz Elimination', () => {
    it('initializes with ambient volume at 0% and master/sfx at 25%', () => {
      const settings = soundManager.getSettings();
      expect(settings.masterVolume).toBe(0.25);
      expect(settings.sfxVolume).toBe(0.25);
      expect(settings.ambienceVolume).toBe(0.0);
      expect(settings.muted).toBe(false);
    });

    it('toggles mute cleanly and updates volume bus states', () => {
      const initialMute = soundManager.isMuted();
      expect(initialMute).toBe(false);

      const toggled = soundManager.toggleMute();
      expect(toggled).toBe(true);
      expect(soundManager.isMuted()).toBe(true);

      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(false);
    });

    it('does not crash or start synthetic oscillator hum on startAmbience()', () => {
      expect(() => {
        soundManager.startAmbience();
        soundManager.stopAmbience();
      }).not.toThrow();
    });

    it('throttles rapid repeated hover and keystroke cues', () => {
      expect(() => {
        soundManager.playKeystroke();
        soundManager.playKeystroke(); // Debounced
        soundManager.playHoverCue('target_1');
        soundManager.playHoverCue('target_1'); // Debounced
      }).not.toThrow();
    });
  });

  describe('Campaign Scope & Lore Verification', () => {
    it('defines exactly five campaign chambers with Chamber 105 as the grand finale', () => {
      expect(CAMPAIGN_CHAMBERS).toHaveLength(5);
      expect(CAMPAIGN_CHAMBERS[0].id).toBe('chamber_101');
      expect(CAMPAIGN_CHAMBERS[1].id).toBe('chamber_102');
      expect(CAMPAIGN_CHAMBERS[2].id).toBe('chamber_103');
      expect(CAMPAIGN_CHAMBERS[3].id).toBe('chamber_104');
      expect(CAMPAIGN_CHAMBERS[4].id).toBe('chamber_105');
      expect(CAMPAIGN_CHAMBERS[4].name).toBe('The Last Witness');
    });

    it('contains Dr. Mara Voss narrative entries and the true ROOM S A disclosure', () => {
      const vossLog = ALL_LOGBOOK_ENTRIES['log_c105_voss_last_recording'];
      expect(vossLog).toBeDefined();
      expect(vossLog.title).toContain('The Last Witness');

      const roomSaLog = ALL_LOGBOOK_ENTRIES['log_c105_room_sa_truth'];
      expect(roomSaLog).toBeDefined();
      expect(roomSaLog.content).toContain('SUBSTRATE ARCHITECTURE // SUBJECT ALPHA');
    });
  });

  describe('Chamber 105: The Last Witness — 4-Stage Synthesis & 3 Endings', () => {
    let state = createChamber101InitialState();

    beforeEach(() => {
      state = engineReducer(createChamber101InitialState(), {
        type: 'SELECT_CHAMBER',
        payload: { chamberId: 'chamber_105' },
      }).nextState;
    });

    it('begins Chamber 105 with active objective for Station 1 (Material Axiom)', () => {
      const obj = getActiveObjective(state);
      expect(obj?.id).toBe('c105_obj_stage_material');
      expect(obj?.what).toBeDefined();
      expect(obj?.where).toBeDefined();
      expect(obj?.how).toBeDefined();
      expect(obj?.whyItMatters).toBeDefined();
    });

    it('rejects Master Compiler execution before all 4 stations are verified', () => {
      const res = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_master_compiler' },
      });
      expect(res.success).toBe(false);
      expect(res.message).toContain('MASTER COMPILER LOCKED');
    });

    it('rejects Final Authority Console before truth is compiled', () => {
      const res = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_endings_console' },
      });
      expect(res.success).toBe(false);
      expect(res.message).toContain('FINAL AUTHORITY CONSOLE: Locked');
    });

    it('solves all 4 stations, executes Master Compilation, and unmasks ROOM S A', () => {
      // Station 1: Material Contradiction
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_station_material' },
      }).nextState;
      expect(state.chamber105?.stationMaterialSolved).toBe(true);
      expect(getActiveObjective(state)?.id).toBe('c105_obj_stage_signal');

      // Station 2: Signal Resonance
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_station_signal' },
      }).nextState;
      expect(state.chamber105?.stationSignalSolved).toBe(true);
      expect(getActiveObjective(state)?.id).toBe('c105_obj_stage_archive');

      // Station 3: Archive Incident Record
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_station_archive' },
      }).nextState;
      expect(state.chamber105?.stationArchiveSolved).toBe(true);
      expect(getActiveObjective(state)?.id).toBe('c105_obj_stage_security');

      // Station 4: Cryptographic Parity Checksum
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_station_security' },
      }).nextState;
      expect(state.chamber105?.stationSecuritySolved).toBe(true);
      expect(state.chamber105?.masterCompilerUnlocked).toBe(true);
      expect(getActiveObjective(state)?.id).toBe('c105_obj_master_compiler');

      // Central Master Compiler Execution
      const compileRes = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_master_compiler' },
      });
      expect(compileRes.success).toBe(true);
      expect(compileRes.message).toContain('ROOM S A REVEALED — SUBSTRATE ARCHITECTURE // SUBJECT ALPHA');
      expect(compileRes.nextState.chamber105?.truthRevealed).toBe(true);
      expect(getActiveObjective(compileRes.nextState)?.id).toBe('c105_obj_choose_ending');
    });

    it('supports Ending A (Shut It Down)', () => {
      // Solve compiler first
      let s = state;
      ['c105_station_material', 'c105_station_signal', 'c105_station_archive', 'c105_station_security', 'c105_master_compiler'].forEach((id) => {
        s = engineReducer(s, { type: 'INTERACT_WITH_OBJECT', payload: { objectId: id } }).nextState;
      });

      const res = engineReducer(s, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_ending_shutdown' },
      });
      expect(res.success).toBe(true);
      expect(res.nextState.status).toBe('escaped');
      expect(res.nextState.chamber105?.chosenEnding).toBe('shutdown');
      expect(res.message).toContain('ENDING A: SHUT IT DOWN');
    });

    it('supports Ending B (Rewrite the Rules)', () => {
      let s = state;
      ['c105_station_material', 'c105_station_signal', 'c105_station_archive', 'c105_station_security', 'c105_master_compiler'].forEach((id) => {
        s = engineReducer(s, { type: 'INTERACT_WITH_OBJECT', payload: { objectId: id } }).nextState;
      });

      const res = engineReducer(s, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_ending_rewrite' },
      });
      expect(res.success).toBe(true);
      expect(res.nextState.status).toBe('escaped');
      expect(res.nextState.chamber105?.chosenEnding).toBe('rewrite');
      expect(res.message).toContain('ENDING B: REWRITE THE RULES');
    });

    it('supports Ending C (Take Control)', () => {
      let s = state;
      ['c105_station_material', 'c105_station_signal', 'c105_station_archive', 'c105_station_security', 'c105_master_compiler'].forEach((id) => {
        s = engineReducer(s, { type: 'INTERACT_WITH_OBJECT', payload: { objectId: id } }).nextState;
      });

      const res = engineReducer(s, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c105_ending_control' },
      });
      expect(res.success).toBe(true);
      expect(res.nextState.status).toBe('escaped');
      expect(res.nextState.chamber105?.chosenEnding).toBe('control');
      expect(res.message).toContain('ENDING C: TAKE CONTROL');
    });
  });
});
