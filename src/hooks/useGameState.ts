import { useState, useEffect, useCallback } from 'react';
import { GameState, GameAction, ActionResult, RuleProposal } from '../game/types';
import { gameStore } from '../game/engine/store';

export function useGameState() {
  const [state, setState] = useState<GameState>(() => gameStore.getState());
  const [lastFeedback, setLastFeedback] = useState<{
    message: string;
    success: boolean;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = gameStore.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const dispatch = useCallback((action: GameAction): ActionResult => {
    const result = gameStore.dispatch(action);
    setLastFeedback({
      message: result.message,
      success: result.success,
      timestamp: Date.now(),
    });
    return result;
  }, []);

  const collectItem = useCallback(
    (itemId: string) => dispatch({ type: 'COLLECT_ITEM', payload: { itemId } }),
    [dispatch]
  );

  const inspectObject = useCallback(
    (objectId: string) => dispatch({ type: 'INSPECT_OBJECT', payload: { objectId } }),
    [dispatch]
  );

  const interactWithObject = useCallback(
    (objectId: string) => dispatch({ type: 'INTERACT_WITH_OBJECT', payload: { objectId } }),
    [dispatch]
  );

  const activateTerminal = useCallback(
    (open: boolean) => dispatch({ type: 'ACTIVATE_TERMINAL', payload: { open } }),
    [dispatch]
  );

  const submitRuleProposal = useCallback(
    (proposal: RuleProposal) =>
      dispatch({ type: 'SUBMIT_RULE_PROPOSAL', payload: { proposal } }),
    [dispatch]
  );

  const attemptExit = useCallback(
    () => dispatch({ type: 'ATTEMPT_EXIT' }),
    [dispatch]
  );

  const restartGame = useCallback(
    () => dispatch({ type: 'RESTART_GAME' }),
    [dispatch]
  );

  return {
    state,
    lastFeedback,
    dispatch,
    collectItem,
    inspectObject,
    interactWithObject,
    activateTerminal,
    submitRuleProposal,
    attemptExit,
    restartGame,
  };
}
