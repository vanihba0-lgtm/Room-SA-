import { describe, it, expect, beforeEach, vi } from 'vitest';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { notificationManager } from '../services/notifications/notificationManager';
import { getActiveObjective } from '../game/progression/objectives';
import { GameState } from '../game/types';

describe('Mega Prompt 4 — UX Repair, Notifications & Chamber 104 Zero-Day Vault', () => {
  beforeEach(() => {
    notificationManager.clear();
    vi.useRealTimers();
  });

  describe('NotificationManager — Transient Toast Management', () => {
    it('manages a single active toast at a time', () => {
      let currentNotif: any = null;
      const unsubscribe = notificationManager.subscribe((notif) => {
        currentNotif = notif;
      });

      notificationManager.notify('First message', 'info');
      expect(currentNotif).not.toBeNull();
      expect(currentNotif?.message).toBe('First message');

      // Next message replaces previous without stacking into a wall
      notificationManager.notify('Second message', 'success');
      expect(currentNotif?.message).toBe('Second message');
      expect(currentNotif?.priority).toBe('success');

      unsubscribe();
    });

    it('deduplicates identical messages sent within 1.5s', () => {
      let callCount = 0;
      let lastMessage = '';
      const unsubscribe = notificationManager.subscribe((notif) => {
        if (notif) {
          callCount++;
          lastMessage = notif.message;
        }
      });

      notificationManager.notify('Door is locked', 'critical');
      expect(callCount).toBe(1);
      expect(lastMessage).toBe('Door is locked');

      // Immediate repeated attempt with identical message is ignored
      notificationManager.notify('Door is locked', 'critical');
      expect(callCount).toBe(1);

      unsubscribe();
    });

    it('clears all active notifications when clear() is invoked on chamber change', () => {
      let currentNotif: any = null;
      const unsubscribe = notificationManager.subscribe((notif) => {
        currentNotif = notif;
      });

      notificationManager.notify('Chamber 101 item retrieved', 'success');
      expect(currentNotif).not.toBeNull();

      // Clear on room switch
      notificationManager.clear();
      expect(currentNotif).toBeNull();

      unsubscribe();
    });
  });

  describe('Chamber Routing & Inventory Isolation', () => {
    it('filters chamber-specific items when navigating via SELECT_CHAMBER', () => {
      // Start in Chamber 101 with brass key
      let state = engineReducer(createChamber101InitialState(), {
        type: 'COLLECT_ITEM',
        payload: { itemId: 'brass_key' },
      }).nextState;
      expect(state.inventory.some((i) => i.id === 'brass_key')).toBe(true);

      // Route directly to Chamber 103
      state = engineReducer(state, {
        type: 'SELECT_CHAMBER',
        payload: { chamberId: 'chamber_103' },
      }).nextState;

      expect(state.currentRoomId).toBe('chamber_103');
      // Brass key from Chamber 101 must NOT leak into Chamber 103!
      expect(state.inventory.some((i) => i.id === 'brass_key')).toBe(false);
      expect(state.inventory).toEqual([]);

      // Objective for Chamber 103 must match Chamber 103, not Chamber 101!
      const activeObj = getActiveObjective(state);
      expect(activeObj?.chamberId).toBe('chamber_103');
      expect(activeObj?.title).toBe('Survey the Gravity Archive');
    });

    it('isolates carried items when leaving Chamber 102', () => {
      let state = engineReducer(createChamber101InitialState(), {
        type: 'SELECT_CHAMBER',
        payload: { chamberId: 'chamber_102' },
      }).nextState;

      state = engineReducer(state, {
        type: 'PICKUP_OBJECT',
        payload: { objectId: 'core_heavy' },
      }).nextState;
      expect(state.carriedObjectId).toBe('core_heavy');

      // Transition to Chamber 103
      state = engineReducer(state, {
        type: 'TRANSITION_ROOM',
        payload: { targetRoomId: 'chamber_103' },
      }).nextState;

      expect(state.currentRoomId).toBe('chamber_103');
      expect(state.carriedObjectId).toBeNull();
    });
  });

  describe('Chamber 104 — The Zero-Day Vault Full Puzzle Flow', () => {
    let c104State: GameState;

    beforeEach(() => {
      c104State = engineReducer(createChamber101InitialState(), {
        type: 'SELECT_CHAMBER',
        payload: { chamberId: 'chamber_104' },
      }).nextState;
    });

    it('rejects vault door opening before prerequisites are completed', () => {
      const result = engineReducer(c104State, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'exit_door_104' },
      });

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/VAULT SEALED/i);
      expect(result.nextState.currentRoomId).toBe('chamber_104');
    });

    it('rejects central crypto console before acquiring guest token', () => {
      const result = engineReducer(c104State, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_crypto' },
      });

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/CONSOLE REJECTED.*Insert valid Guest Token/i);
    });

    it('completes the full 6-step Chamber 104 progression and unlocks exit', () => {
      // Step 1: Audit Vault Door / Access requirements
      expect(getActiveObjective(c104State)?.id).toBe('c104_obj_audit_vault');
      let state = engineReducer(c104State, {
        type: 'INSPECT_OBJECT',
        payload: { objectId: 'exit_door_104' },
      }).nextState;

      // Step 2: Investigate Expired Root Credentials
      expect(getActiveObjective(state)?.id).toBe('c104_obj_audit_clearance');
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_monitor' },
      }).nextState;
      expect(state.chamber104?.telemetryAudited).toBe(true);

      // Step 3: Dispense Guest Security Token #404
      expect(getActiveObjective(state)?.id).toBe('c104_obj_dispense_guest_token');
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_dispenser' },
      }).nextState;
      expect(state.chamber104?.hasGuestToken).toBe(true);
      expect(state.inventory.some((i) => i.id === 'guest_token')).toBe(true);

      // Step 4: Validate Checksum & Parity Override
      expect(getActiveObjective(state)?.id).toBe('c104_obj_calibrate_checksum');
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_crypto' },
      }).nextState;
      expect(state.chamber104?.checksumMatched).toBe(true);
      expect(state.chamber104?.exitUnlocked).toBe(true);

      // Step 5: Advance through unsealed vault door to Chamber 105
      expect(getActiveObjective(state)?.id).toBe('c104_obj_exit');
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'exit_door_104' },
      }).nextState;
      expect(state.currentRoomId).toBe('chamber_105');
    });

    it('does not duplicate token in inventory if dispenser is clicked repeatedly', () => {
      let state = engineReducer(c104State, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_dispenser' },
      }).nextState;
      expect(state.inventory.filter((i) => i.id === 'guest_token').length).toBe(1);

      // Click dispenser again
      state = engineReducer(state, {
        type: 'INTERACT_WITH_OBJECT',
        payload: { objectId: 'c104_dispenser' },
      }).nextState;
      expect(state.inventory.filter((i) => i.id === 'guest_token').length).toBe(1);
    });
  });
});
