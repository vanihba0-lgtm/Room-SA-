import { describe, it, expect, beforeEach } from 'vitest';
import { engineReducer } from '../game/engine/reducer';
import { createChamber101InitialState } from '../game/puzzles/chamber101';
import { CHAMBER_101_SOLUTION_PROPOSAL } from '../game/rules/registry';
import { GameState } from '../game/types';

describe('ROOM S A — Authoritative Engine & Puzzle Mechanics (Chamber 101)', () => {
  let state: GameState;

  beforeEach(() => {
    state = createChamber101InitialState();
  });

  // 1. Initial game state
  it('1. initializes in a pristine playing state with locked door and deceptive rule', () => {
    expect(state.currentRoomId).toBe('chamber_101');
    expect(state.status).toBe('playing');
    expect(state.inventory).toHaveLength(0);
    expect(state.exit.isLocked).toBe(true);
    expect(state.rules['RULE_01']?.statement).toBe(
      'Doors yield only to copper keys.'
    );
    expect(state.rules['RULE_01']?.isDeceptive).toBe(true);
    expect(state.rules['RULE_01']?.predicateKey).toBe('RULE_COPPER_KEY_ONLY');
    expect(state.terminalOpen).toBe(false);
    expect(state.realityShiftCount).toBe(0);
  });

  // 2. Key collection
  it('2. collects the machined brass key from the specimen pedestal', () => {
    const result = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    });

    expect(result.success).toBe(true);
    expect(result.nextState.inventory).toHaveLength(1);
    expect(result.nextState.inventory[0]?.id).toBe('brass_key');
    expect(result.nextState.inventory[0]?.name).toBe('Machined Brass Key');
    expect(result.nextState.objects.pedestal.inspectText).toContain('empty');
  });

  // 3. Duplicate key collection
  it('3. prevents duplicate collection of the same item', () => {
    const step1 = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    });
    expect(step1.success).toBe(true);

    const step2 = engineReducer(step1.nextState, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    });
    expect(step2.success).toBe(false);
    expect(step2.message).toContain('already exists');
    expect(step2.nextState.inventory).toHaveLength(1);
  });

  // 4. Door attempt without the key
  it('4. rejects door escape attempt when player has no key', () => {
    const result = engineReducer(state, { type: 'ATTEMPT_EXIT' });

    expect(result.success).toBe(false);
    expect(result.nextState.status).toBe('playing');
    expect(result.nextState.exit.isLocked).toBe(true);
    expect(result.message).toContain('A key is required');
  });

  // 5. Door attempt with the key but the wrong rule
  it('5. rejects door escape attempt when player holds brass key but RULE_01 still demands copper', () => {
    // Collect the key
    const withKey = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    }).nextState;

    // Attempt exit while deceptive rule is active
    const exitAttempt = engineReducer(withKey, { type: 'ATTEMPT_EXIT' });

    expect(exitAttempt.success).toBe(false);
    expect(exitAttempt.nextState.status).toBe('playing');
    expect(exitAttempt.nextState.exit.isLocked).toBe(true);
    expect(exitAttempt.message).toContain(
      "Rule #1 insists only copper keys are recognized"
    );
  });

  // 6. Successful terminal rule change
  it('6. applies authorized rule rewrite proposal and triggers reality shift', () => {
    const result = engineReducer(state, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    });

    expect(result.success).toBe(true);
    expect(result.nextState.rules['RULE_01']?.statement).toBe(
      'Doors yield to brass keys.'
    );
    expect(result.nextState.rules['RULE_01']?.isDeceptive).toBe(false);
    expect(result.nextState.rules['RULE_01']?.predicateKey).toBe(
      'RULE_BRASS_KEY_ALLOWED'
    );
    expect(result.nextState.realityShiftCount).toBe(1);
    expect(
      result.nextState.terminalLog.some((l) => l.includes('RULE REWRITE AUTHORIZED'))
    ).toBe(true);
  });

  // 7. Rejected unauthorized rule change
  it('7. rejects unauthorized rule proposals and logs error to terminal', () => {
    const badProposal = {
      targetRuleId: 'RULE_01',
      proposedStatement: 'Doors open automatically.',
      newPredicateKey: 'RULE_NON_EXISTENT_PREDICATE',
    };

    const result = engineReducer(state, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: badProposal },
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown logic predicate');
    // Rule remains unchanged
    expect(result.nextState.rules['RULE_01']?.predicateKey).toBe(
      'RULE_COPPER_KEY_ONLY'
    );
    expect(
      result.nextState.terminalLog.some((l) => l.includes('[ERROR]'))
    ).toBe(true);
  });

  // 8. Successful escape after satisfying both prerequisites
  it('8. permits escape when player has the brass key AND rule allows brass keys', () => {
    // Step A: Collect Key
    let s = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    }).nextState;

    // Step B: Rewrite Rule at Terminal
    s = engineReducer(s, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    }).nextState;

    // Step C: Attempt Exit
    const exitResult = engineReducer(s, { type: 'ATTEMPT_EXIT' });

    expect(exitResult.success).toBe(true);
    expect(exitResult.nextState.status).toBe('escaped');
    expect(exitResult.nextState.exit.isLocked).toBe(false);
    expect(exitResult.message).toContain('Hydraulic clamps hiss and disengage');
  });

  // 9. Correct victory state
  it('9. records victory event and sets status to escaped', () => {
    let s = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    }).nextState;
    s = engineReducer(s, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    }).nextState;
    const winResult = engineReducer(s, { type: 'ATTEMPT_EXIT' });

    expect(winResult.nextState.status).toBe('escaped');
    expect(
      winResult.nextState.eventLog.some((e) => e.type === 'CHAMBER_ESCAPED')
    ).toBe(true);
  });

  // 10. Prevention of ordinary state changes after victory
  it('10. prevents ordinary gameplay actions once chamber is escaped', () => {
    let s = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    }).nextState;
    s = engineReducer(s, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    }).nextState;
    s = engineReducer(s, { type: 'ATTEMPT_EXIT' }).nextState;
    expect(s.status).toBe('escaped');

    // Attempt to inspect or collect again
    const inspectResult = engineReducer(s, {
      type: 'INSPECT_OBJECT',
      payload: { objectId: 'pedestal' },
    });
    expect(inspectResult.success).toBe(false);
    expect(inspectResult.message).toContain('Chamber already cleared');
  });

  // 11. Restart behavior
  it('11. restores pristine initial chamber state on RESTART_GAME', () => {
    let s = engineReducer(state, {
      type: 'COLLECT_ITEM',
      payload: { itemId: 'brass_key' },
    }).nextState;
    s = engineReducer(s, {
      type: 'SUBMIT_RULE_PROPOSAL',
      payload: { proposal: CHAMBER_101_SOLUTION_PROPOSAL },
    }).nextState;
    s = engineReducer(s, { type: 'ATTEMPT_EXIT' }).nextState;

    const restartResult = engineReducer(s, { type: 'RESTART_GAME' });
    const resetState = restartResult.nextState;

    expect(resetState.status).toBe('playing');
    expect(resetState.inventory).toHaveLength(0);
    expect(resetState.exit.isLocked).toBe(true);
    expect(resetState.rules['RULE_01']?.statement).toBe(
      'Doors yield only to copper keys.'
    );
    expect(resetState.rules['RULE_01']?.isDeceptive).toBe(true);
    expect(resetState.realityShiftCount).toBe(0);
  });

  // 12. Interactive mechanism: Substrate Power Regulator
  it('12. toggles the Substrate Power Regulator mechanism and emits event', () => {
    const toggle1 = engineReducer(state, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'power_regulator' },
    });

    expect(toggle1.success).toBe(true);
    expect(toggle1.nextState.objects.power_regulator.state).toBe('transformed');
    expect(toggle1.message).toContain('Substrate Power Regulator');
    expect(toggle1.nextState.eventLog.some((e) => e.type === 'MECHANISM_TOGGLED')).toBe(true);

    const toggle2 = engineReducer(toggle1.nextState, {
      type: 'INTERACT_WITH_OBJECT',
      payload: { objectId: 'power_regulator' },
    });

    expect(toggle2.success).toBe(true);
    expect(toggle2.nextState.objects.power_regulator.state).toBe('default');
  });
});
