import { describe, it, expect, vi, beforeEach } from 'vitest';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { soundManager } from '../services/audio/soundManager';

describe('ROOM S A — Desktop Gameplay, Campaign Scope & System Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Campaign Scope: Exactly 5 Chambers (101–105)', () => {
    it('confirms campaign has exactly Chambers 101 through 105, without Chamber 106', () => {
      const state = createChamber101InitialState();

      // Chamber 101: The Obvious Lie
      expect(state.currentRoomId).toBe('chamber_101');

      // Navigate to Chamber 102: The Signal Foundry
      const res102 = engineReducer(state, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_102' },
      });
      expect(res102.success).toBe(true);
      expect(res102.nextState.currentRoomId).toBe('chamber_102');

      // Navigate to Chamber 103: The Gravity Archive
      const res103 = engineReducer(res102.nextState, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_103' },
      });
      expect(res103.success).toBe(true);
      expect(res103.nextState.currentRoomId).toBe('chamber_103');

      // Navigate to Chamber 104: The Zero-Day Vault
      const res104 = engineReducer(res103.nextState, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_104' },
      });
      expect(res104.success).toBe(true);
      expect(res104.nextState.currentRoomId).toBe('chamber_104');

      // Navigate to Chamber 105: The Last Witness (Grand Finale)
      const res105 = engineReducer(res104.nextState, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_105' },
      });
      expect(res105.success).toBe(true);
      expect(res105.nextState.currentRoomId).toBe('chamber_105');
    });

    it('supports all three distinct endings in Chamber 105: shutdown, rewrite, control', () => {
      const baseState = {
        ...createChamber101InitialState(),
        currentRoomId: 'chamber_105',
        chamber105: {
          chronometerInspected: true,
          relaySequence: ['c105_relay_1', 'c105_relay_2', 'c105_relay_3', 'c105_relay_4'],
          relaysSequenced: true,
          ruleOverridden: true,
          masterCompilerUnlocked: true,
          truthRevealed: true,
          exitUnlocked: true,
        },
      };

      // Ending A: Shutdown
      const stateShutdown = {
        ...baseState,
        chamber105: { ...baseState.chamber105, chosenEnding: 'shutdown' as const },
      };
      const resShutdown = engineReducer(stateShutdown, { type: 'ATTEMPT_EXIT' });
      expect(resShutdown.success).toBe(true);
      expect(resShutdown.nextState.status).toBe('escaped');
      expect(resShutdown.message).toContain('SHUT IT DOWN');

      // Ending B: Rewrite
      const stateRewrite = {
        ...baseState,
        chamber105: { ...baseState.chamber105, chosenEnding: 'rewrite' as const },
      };
      const resRewrite = engineReducer(stateRewrite, { type: 'ATTEMPT_EXIT' });
      expect(resRewrite.success).toBe(true);
      expect(resRewrite.nextState.status).toBe('escaped');
      expect(resRewrite.message).toContain('REWRITE THE RULES');

      // Ending C: Control
      const stateControl = {
        ...baseState,
        chamber105: { ...baseState.chamber105, chosenEnding: 'control' as const },
      };
      const resControl = engineReducer(stateControl, { type: 'ATTEMPT_EXIT' });
      expect(resControl.success).toBe(true);
      expect(resControl.nextState.status).toBe('escaped');
      expect(resControl.message).toContain('TAKE CONTROL');
    });
  });

  describe('2. Desktop Audio Defaults & Hygiene', () => {
    it('verifies ambience starts at 0% with no persistent drone', () => {
      const settings = soundManager.getSettings();
      expect(settings.ambienceVolume).toBe(0);
      expect(settings.masterVolume).toBe(0.25);
      expect(settings.sfxVolume).toBe(0.25);
    });

    it('toggles mute correctly and preserves volume settings', () => {
      const isMuted = soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(isMuted);

      // Toggle back
      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(false);
    });
  });

  describe('3. Chamber Walkthrough & Solution Verification', () => {
    it('requires the brass key override in Chamber 101 to unlock the blast door', () => {
      let state = createChamber101InitialState();

      // Attempt exit without key: should fail
      const failNoKey = engineReducer(state, { type: 'ATTEMPT_EXIT' });
      expect(failNoKey.success).toBe(false);
      expect(state.exit.isLocked).toBe(true);

      // Collect brass key
      const keyResult = engineReducer(state, {
        type: 'COLLECT_ITEM',
        payload: { itemId: 'brass_key' },
      });
      expect(keyResult.success).toBe(true);
      state = keyResult.nextState;

      // Attempt exit with brass key but default copper-only rule: should fail (contradiction)
      const failRule = engineReducer(state, { type: 'ATTEMPT_EXIT' });
      expect(failRule.success).toBe(false);
      expect(failRule.message).toContain('copper');

      // Propose rule change: allow brass keys
      const ruleResult = engineReducer(state, {
        type: 'SUBMIT_RULE_PROPOSAL',
        payload: {
          proposal: {
            targetRuleId: 'RULE_01',
            proposedStatement: 'Doors yield to brass keys',
            newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
            operation: 'OVERRIDE_PREDICATE',
            explanation: 'The specimen is machined brass, contradicting the copper plaque.',
          },
        },
      });
      expect(ruleResult.success).toBe(true);
      state = ruleResult.nextState;

      // Attempt exit with rule override and brass key: unlocks!
      const winResult = engineReducer(state, { type: 'ATTEMPT_EXIT' });
      expect(winResult.success).toBe(true);
      expect(winResult.nextState.exit.isLocked).toBe(false);
    });
  });
});
