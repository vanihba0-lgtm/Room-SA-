import { GameState } from '../types';

export interface PredicateEvaluationResult {
  readonly allowed: boolean;
  readonly message: string;
}

export type RulePredicate = (state: GameState) => PredicateEvaluationResult;

/**
 * Predicate: RULE_COPPER_KEY_ONLY
 * Initial deceptive rule governing Chamber 101.
 * Demands a 'copper_key' which does not exist in the chamber.
 */
export const copperKeyOnlyPredicate: RulePredicate = (state: GameState): PredicateEvaluationResult => {
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');
  const hasCopperKey = state.inventory.some((item) => item.id === 'copper_key');

  if (hasCopperKey) {
    return {
      allowed: true,
      message: 'Copper key accepted. The blast door unlocks.',
    };
  }

  if (hasBrassKey) {
    return {
      allowed: false,
      message:
        "The blast door lock rejects the brass key. Plaque: 'ONLY COPPER OPERATES THIS MECHANISM'. Rule #1 insists only copper keys are recognized.",
    };
  }

  return {
    allowed: false,
    message:
      "The blast door is sealed by hydraulic clamps. Plaque: 'ONLY COPPER OPERATES THIS MECHANISM'. A key is required.",
  };
};

/**
 * Predicate: RULE_BRASS_KEY_ALLOWED
 * Rewritten reality rule. Allows the chamber's brass key to operate the blast door.
 */
export const brassKeyAllowedPredicate: RulePredicate = (state: GameState): PredicateEvaluationResult => {
  const hasBrassKey = state.inventory.some((item) => item.id === 'brass_key');

  if (hasBrassKey) {
    return {
      allowed: true,
      message:
        'The lock scans the brass alloy. The rewritten law authorizes entry! Hydraulic clamps hiss and disengage.',
    };
  }

  return {
    allowed: false,
    message:
      'The chamber rule now authorizes brass keys, but you do not have the brass key in your inventory.',
  };
};

/**
 * Registry of known deterministic predicates
 */
export const PREDICATE_REGISTRY: Record<string, RulePredicate> = {
  RULE_COPPER_KEY_ONLY: copperKeyOnlyPredicate,
  RULE_BRASS_KEY_ALLOWED: brassKeyAllowedPredicate,
};

/**
 * Evaluates the exit door unlock condition based on the active rule
 */
export function evaluateExitUnlock(state: GameState): PredicateEvaluationResult {
  const ruleId = state.exit.unlockConditionRuleId;
  if (!ruleId) {
    return { allowed: true, message: 'The door has no lock constraints.' };
  }

  const activeRule = state.rules[ruleId];
  if (!activeRule) {
    return {
      allowed: false,
      message: `Error: Governing rule '${ruleId}' not found in chamber registry.`,
    };
  }

  const predicate = PREDICATE_REGISTRY[activeRule.predicateKey];
  if (!predicate) {
    return {
      allowed: false,
      message: `Error: Predicate '${activeRule.predicateKey}' is undefined.`,
    };
  }

  return predicate(state);
}
