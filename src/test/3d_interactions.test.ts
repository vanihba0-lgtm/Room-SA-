import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { CHAMBER_101_SOLUTION_PROPOSAL } from '../game/rules/registry';

describe('ROOM S A — 3D Systems & Interaction Math', () => {
  // 1. Raycast targeting logic
  it('1. identifies targeted interactive objects when looking directly at them within range', () => {
    const cameraPos = new Vector3(0, 1.7, 3.0);
    const cameraDir = new Vector3(0, 0, -1).normalize(); // Looking straight north towards door & pedestal

    const pedestalPos = new Vector3(0, 1.2, 0);
    const toPedestal = new Vector3().subVectors(pedestalPos, cameraPos);
    const dist = toPedestal.length();

    expect(dist).toBeLessThan(3.8); // Within 3.8m interaction range

    toPedestal.normalize();
    const dot = cameraDir.dot(toPedestal);
    expect(dot).toBeGreaterThan(0.95); // Directly in center crosshair cone
  });

  it('2. ignores interactive objects that are behind the player or out of range', () => {
    const cameraPos = new Vector3(0, 1.7, 0);
    const cameraDir = new Vector3(0, 0, 1).normalize(); // Looking south away from blast door

    const doorPos = new Vector3(0, 1.9, -5.8);
    const toDoor = new Vector3().subVectors(doorPos, cameraPos);
    toDoor.normalize();

    const dot = cameraDir.dot(toDoor);
    expect(dot).toBeLessThan(0); // Object is behind player, dot product is negative
  });

  // 2. Movement boundary clamping & obstacle avoidance
  it('3. clamps player position inside chamber boundaries [12m x 12m]', () => {
    const minX = -5.2;
    const maxX = 5.2;
    const minZLocked = -5.2;
    const maxZ = 5.2;

    const clampPos = (x: number, z: number, doorLocked: boolean) => {
      const minZ = doorLocked ? minZLocked : -8.5;
      return {
        x: Math.max(minX, Math.min(maxX, x)),
        z: Math.max(minZ, Math.min(maxZ, z)),
      };
    };

    // When trying to run through east wall
    const outsideEast = clampPos(7.5, 0, true);
    expect(outsideEast.x).toBe(5.2);

    // When trying to run through locked blast door
    const outsideNorthLocked = clampPos(0, -7.0, true);
    expect(outsideNorthLocked.z).toBe(-5.2);

    // When running through blast door after it is unlocked
    const passThroughUnlocked = clampPos(0, -7.0, false);
    expect(passThroughUnlocked.z).toBe(-7.0); // Passed through door!
  });

  it('4. prevents walking into specimen pedestal column via radial collision', () => {
    const resolvePedestalCollision = (x: number, z: number, radius = 0.85) => {
      const dist = Math.hypot(x, z);
      if (dist < radius) {
        const angle = Math.atan2(z, x);
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
        };
      }
      return { x, z };
    };

    const collision = resolvePedestalCollision(0.2, 0.2);
    const distAfter = Math.hypot(collision.x, collision.z);
    expect(distAfter).toBeCloseTo(0.85, 3);
  });

  // 3. Complete 3D first-person puzzle walkthrough through engine
  it('5. completes full 3D interactive chamber walkthrough: collect key -> toggle mechanism -> rewrite rule -> escape', () => {
    let state = createChamber101InitialState();

    // Step A: Aim at pedestal and collect key
    const collectRes = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key', sourceObjectId: 'pedestal' },
    });
    expect(collectRes.success).toBe(true);
    state = collectRes.nextState;

    // Step B: Aim at power regulator mechanism and engage it
    const mechRes = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'power_regulator' },
    });
    expect(mechRes.success).toBe(true);
    expect(mechRes.nextState.objects.power_regulator.state).toBe('transformed');
    state = mechRes.nextState;

    // Step C: Attempt door before rewrite -> fails with deceptive rule explanation
    const prematureExit = engineReducer(state, { type: 'ATTEMPT_EXIT' });
    expect(prematureExit.success).toBe(false);
    expect(prematureExit.message).toContain('Rule #1 insists only copper keys are recognized');

    // Step D: Aim at terminal and submit rule rewrite
    const rewriteRes = engineReducer(state, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    });
    expect(rewriteRes.success).toBe(true);
    state = rewriteRes.nextState;
    expect(state.rules['RULE_01']?.isDeceptive).toBe(false);

    // Step E: Walk up to blast door and unlock it
    const unlockResult = engineReducer(state, { type: 'ATTEMPT_EXIT' });
    expect(unlockResult.success).toBe(true);
    expect(unlockResult.nextState.exit.isLocked).toBe(false);

    // Step F: Walk through — transitions to Chamber 102
    const transitionResult = engineReducer(unlockResult.nextState, { type: 'ATTEMPT_EXIT' });
    expect(transitionResult.success).toBe(true);
    expect(transitionResult.nextState.currentRoomId).toBe('chamber_102');
  });

  // 4. Chamber 102 3D Systems & Full Campaign Victory Walkthrough
  it('6. determines Chamber 102 3D interactive targets based on look direction and range', () => {
    const cameraPos = new Vector3(0, 1.7, 2.0);
    const cameraDirToConsole = new Vector3(1, 0, -0.3).normalize(); // Looking towards east console

    const consolePos = new Vector3(6.4, 1.6, 0);
    const toConsole = new Vector3().subVectors(consolePos, cameraPos);
    toConsole.normalize();

    const dot = cameraDirToConsole.dot(toConsole);
    expect(dot).toBeGreaterThan(0.85); // High precision alignment with console
  });

  it('7. completes entire campaign walkthrough: Chamber 101 -> Chamber 102 Signal Foundry -> full escape', () => {
    let state = createChamber101InitialState();

    // Chamber 101: Key -> Rewrite -> Unlock -> Transition
    state = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key', sourceObjectId: 'pedestal' },
    }).nextState;

    state = engineReducer(state, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    }).nextState;

    state = engineReducer(state, { type: 'ATTEMPT_EXIT' }).nextState; // Unlock door
    state = engineReducer(state, { type: 'ATTEMPT_EXIT' }).nextState; // Transition to 102
    expect(state.currentRoomId).toBe('chamber_102');

    // Chamber 102:
    // Read diagnostic slate
    const slateRes = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'diagnostic_slate_102' },
    });
    expect(slateRes.success).toBe(true);
    expect(slateRes.message).toContain('Plate B (Substrate Transceiver) does NOT measure mass');

    // Pick up Heavy Flux Core (25kg) and place on Plate A
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'core_heavy' },
    }).nextState;
    expect(state.carriedObjectId).toBe('core_heavy');

    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'plate_mass' },
    }).nextState;
    expect(state.carriedObjectId).toBeNull();
    expect(state.chamber102.pressurePlates.plate_mass.isDepressed).toBe(true);

    // Pick up Harmonic Cell (8kg) and place on Plate B
    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'core_resonance' },
    }).nextState;
    expect(state.carriedObjectId).toBe('core_resonance');

    state = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'plate_harmonic' },
    }).nextState;
    expect(state.carriedObjectId).toBeNull();
    expect(state.chamber102.pressurePlates.plate_harmonic.isDepressed).toBe(true);

    // Tune circuit console to target frequency and channel
    const targetFreq = state.chamber102.circuit.targetFrequency;
    const targetChan = state.chamber102.circuit.targetChannel;

    state = engineReducer(state, {
      type: 'CONFIGURE_CIRCUIT',
      payload: { frequency: targetFreq, channel: targetChan },
    }).nextState;

    expect(state.chamber102.circuit.isCircuitClosed).toBe(true);
    expect(state.chamber102.puzzleSolved).toBe(true);
    expect(state.chamber102.exitDoorLocked).toBe(false);

    // Step through exit door of Chamber 102 -> CAMPAIGN CLEARED!
    const finalEscapeRes = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'exit_door_102' },
    });
    expect(finalEscapeRes.success).toBe(true);
    expect(finalEscapeRes.nextState.status).toBe('escaped');
    expect(finalEscapeRes.message).toContain('Facility quarantine cleared');
  });
});
