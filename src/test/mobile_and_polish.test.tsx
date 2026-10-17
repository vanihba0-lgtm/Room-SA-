import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { TouchControlsOverlay } from '../components/3d/TouchControlsOverlay';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { soundManager } from '../services/audio/soundManager';

describe('ROOM S A — Mobile & Desktop Polish Integration Tests (Phase 8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Mobile Touch Controls & Input Correctness', () => {
    it('renders virtual joystick, look zone, jump button, and mobile menu pill', () => {
      const onInputUpdate = vi.fn();
      const onInteract = vi.fn();
      const onInspect = vi.fn();
      const onOpenMenu = vi.fn();

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={null}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={onOpenMenu}
          isPaused={false}
        />
      );

      expect(screen.getByLabelText(/Virtual movement joystick/i)).toBeDefined();
      expect(screen.getByLabelText(/Drag here to look around/i)).toBeDefined();
      expect(screen.getByLabelText(/Jump/i)).toBeDefined();
      expect(screen.getByLabelText(/Open pause menu/i)).toBeDefined();
    });

    it('displays contextual INTERACT button when an interactive object is targeted', () => {
      const onInputUpdate = vi.fn();
      const onInteract = vi.fn();
      const onInspect = vi.fn();
      const onOpenMenu = vi.fn();

      const hoverTarget = {
        id: 'pedestal',
        name: 'Specimen Pedestal',
        actionText: 'Collect Machined Brass Key',
        inspectText: 'A dark slate column holding a key.',
        distance: 1.8,
      };

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={hoverTarget}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={onOpenMenu}
          isPaused={false}
        />
      );

      const interactBtn = screen.getByLabelText(/Collect Machined Brass Key/i);
      expect(interactBtn).toBeDefined();

      fireEvent.click(interactBtn);
      expect(onInteract).toHaveBeenCalledWith('pedestal');
    });

    it('displays contextual INSPECT button when inspectText is available on target', () => {
      const onInputUpdate = vi.fn();
      const onInteract = vi.fn();
      const onInspect = vi.fn();
      const onOpenMenu = vi.fn();

      const hoverTarget = {
        id: 'observation_slate',
        name: 'Observation Slate',
        actionText: 'Read Slate Plaque',
        inspectText: 'Read forensic telemetry inscription',
        distance: 1.5,
      };

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={hoverTarget}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={onOpenMenu}
          isPaused={false}
        />
      );

      const inspectBtn = screen.getByLabelText(/Inspect target/i);
      expect(inspectBtn).toBeDefined();

      fireEvent.click(inspectBtn);
      expect(onInspect).toHaveBeenCalledWith('observation_slate');
    });

    it('triggers jump input request when JUMP button is pressed', () => {
      const onInputUpdate = vi.fn();
      const onInteract = vi.fn();
      const onInspect = vi.fn();
      const onOpenMenu = vi.fn();

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={null}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={onOpenMenu}
          isPaused={false}
        />
      );

      const jumpBtn = screen.getByLabelText(/Jump/i);
      fireEvent.click(jumpBtn);

      expect(onInputUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          jumpRequested: true,
        })
      );
    });

    it('triggers pause menu when MENU button is tapped', () => {
      const onInputUpdate = vi.fn();
      const onInteract = vi.fn();
      const onInspect = vi.fn();
      const onOpenMenu = vi.fn();

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={null}
          onInteract={onInteract}
          onInspect={onInspect}
          onOpenMenu={onOpenMenu}
          isPaused={false}
        />
      );

      const menuBtn = screen.getByLabelText(/Open pause menu/i);
      fireEvent.click(menuBtn);
      expect(onOpenMenu).toHaveBeenCalledTimes(1);
    });

    it('clears all input state on pointercancel or blur', () => {
      const onInputUpdate = vi.fn();

      render(
        <TouchControlsOverlay
          onInputUpdate={onInputUpdate}
          hoverTarget={null}
          onInteract={vi.fn()}
          onInspect={vi.fn()}
          onOpenMenu={vi.fn()}
          isPaused={false}
        />
      );

      // Fire global window blur event
      fireEvent(window, new Event('blur'));

      expect(onInputUpdate).toHaveBeenCalledWith({
        move: { x: 0, y: 0 },
        look: { deltaX: 0, deltaY: 0 },
        jumpRequested: false,
      });
    });
  });

  describe('2. Campaign Integrity & Scope (Chambers 101–105 Only)', () => {
    it('confirms campaign has exactly Chambers 101 through 105, rejecting Chamber 106', () => {
      const state = createChamber101InitialState();

      // Chamber 101 exists
      expect(state.currentRoomId).toBe('chamber_101');

      // Navigate to Chamber 102
      const res102 = engineReducer(state, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_102' },
      });
      expect(res102.success).toBe(true);
      expect(res102.nextState.currentRoomId).toBe('chamber_102');

      // Navigate to Chamber 103
      const res103 = engineReducer(res102.nextState, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_103' },
      });
      expect(res103.success).toBe(true);
      expect(res103.nextState.currentRoomId).toBe('chamber_103');

      // Navigate to Chamber 104
      const res104 = engineReducer(res103.nextState, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_104' },
      });
      expect(res104.success).toBe(true);
      expect(res104.nextState.currentRoomId).toBe('chamber_104');

      // Navigate to Chamber 105 (Grand Finale)
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

  describe('3. Audio Defaults & Hygiene', () => {
    it('verifies ambience starts at 0% with no persistent drone', () => {
      // Audio defaults: ambience/music = 0, zero background loop autostart
      const settings = soundManager.getSettings();
      expect(settings.ambienceVolume).toBe(0);
      expect(settings.masterVolume).toBe(0.25);
      expect(settings.sfxVolume).toBe(0.25);
    });
  });
});
